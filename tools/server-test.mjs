import { openDb } from '../server/db.mjs'
import { makeApp } from '../server/app.mjs'
import { createServer } from 'node:http'
const db = await openDb({ memory: true })
const srv = createServer(makeApp(db, { dev: true })).listen(0)
const base = `http://localhost:${srv.address().port}`
const call = async (method, path, body, token) => {
  const r = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) }, body: body && JSON.stringify(body) })
  return { status: r.status, ...(await r.json()) }
}
console.log('signup', (await call('POST', '/api/signup', { username: 'vito', password: 'secret1' })).username)
console.log('dup', (await call('POST', '/api/signup', { username: 'Vito', password: 'secret1' })).error)
console.log('badpw', (await call('POST', '/api/login', { username: 'vito', password: 'nope' })).error)
const { token } = await call('POST', '/api/login', { username: 'vito', password: 'secret1' })
console.log('state before boss', (await call('GET', '/api/state', null, token)).status)
const n = await call('POST', '/api/new', { name: 'Vito', factionId: 'families' }, token)
console.log('new', n.state.bossName, n.state.cash)
const j = await call('POST', '/api/act', { action: 'doJob', args: ['hustle'] }, token)
console.log('job', j.state.cash, j.state.energy, j.state.toast?.text)
console.log('unknown', (await call('POST', '/api/act', { action: 'eval', args: [] }, token)).error)
console.log('bad args', (await call('POST', '/api/act', { action: 'doJob', args: [{ a: { b: 1 } }] }, token)).error)
const g = await call('GET', '/api/state', null, token); console.log('persisted', g.state.cash, g.state.stats.jobs)
console.log('no auth', (await call('GET', '/api/state')).status)

srv.close(); await db.close()
