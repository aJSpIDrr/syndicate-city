// Email log-in, adding an email to an old account, forgot / reset password.
import { createServer } from 'node:http'
import { openDb } from '../server/db.mjs'
import { makeApp } from '../server/app.mjs'
const db = await openDb({ memory: true })
const srv = createServer(makeApp(db, { dev: true })).listen(0)
const base = `http://localhost:${srv.address().port}`
const call = async (method, path, body, token) => {
  const r = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) }, body: body && JSON.stringify(body) })
  return { status: r.status, ...(await r.json()) }
}
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'} ${m}`); if (!c) process.exitCode = 1 }
const site = 'http://localhost:4180/'
let r = await call('POST', '/api/signup', { email: 'bad', username: 'ann', password: 'secret1' })
ok(r.status === 400, 'invalid email rejected')
r = await call('POST', '/api/signup', { email: 'Ann@Example.com', username: 'ann', password: 'secret1' })
ok(r.status === 200 && !r.needsEmail, 'sign up with email')
r = await call('POST', '/api/signup', { email: 'ann@example.com', username: 'ann2', password: 'secret1' })
ok(r.status === 409, 'same email twice refused (any letter case)')
r = await call('POST', '/api/login', { email: 'ann@example.com', password: 'secret1' })
ok(r.status === 200 && r.username === 'ann', 'log in with email')
// An old account without an email (made before this change)
await db.query("INSERT INTO accounts (username, username_lower, pass_hash) SELECT 'old', 'old', pass_hash FROM accounts WHERE username = 'ann'")
r = await call('POST', '/api/login', { email: 'old', password: 'secret1' })
ok(r.status === 200 && r.needsEmail, 'old account logs in with username and is asked for an email')
const oldTok = r.token
r = await call('POST', '/api/email', { email: 'ann@example.com' }, oldTok)
ok(r.status === 409, 'cannot take an email already in use')
r = await call('POST', '/api/email', { email: 'old@example.com' }, oldTok)
ok(r.status === 200, 'old account adds its email')
r = await call('POST', '/api/forgot', { email: 'nobody@example.com', site })
ok(r.status === 200 && !r.devLink, 'forgot for unknown email gives the same answer')
r = await call('POST', '/api/forgot', { email: 'ann@example.com', site: 'https://evil.example.com/' })
ok(r.status === 200 && !r.devLink, 'reset links only point at the game site')
r = await call('POST', '/api/forgot', { email: 'ann@example.com', site })
ok(r.status === 200 && /\?reset=[a-f0-9]{64}$/.test(r.devLink || ''), 'forgot makes a reset link')
const token = r.devLink.split('reset=')[1]
r = await call('POST', '/api/reset', { token, password: 'newpass1' })
ok(r.status === 200 && r.token, 'reset sets a new password and logs in')
r = await call('POST', '/api/reset', { token, password: 'again12' })
ok(r.status === 400, 'reset link works only once')
r = await call('POST', '/api/login', { email: 'ann@example.com', password: 'secret1' })
ok(r.status === 401, 'old password no longer works')
r = await call('POST', '/api/login', { email: 'ann@example.com', password: 'newpass1' })
ok(r.status === 200, 'new password works')
for (let i = 0; i < 3; i++) await call('POST', '/api/forgot', { email: 'ann@example.com', site })
r = await call('POST', '/api/forgot', { email: 'ann@example.com', site })
ok(!r.devLink, 'at most 3 reset emails per hour')
srv.close(); await db.close()
