// Checks the quick save path: many taps at once and a gift landing at the same moment all count,
// and each tap uses only a couple of database round trips.
import { createServer } from 'node:http'
import { openDb } from '../server/db.mjs'
import { makeApp } from '../server/app.mjs'
const db = await openDb({ memory: true })
let queries = 0
const q = db.query, tx = db.tx
db.query = (...a) => { queries++; return q(...a) }
db.tx = (fn) => tx((t) => fn({ query: (...a) => { queries++; return t.query(...a) } }))
const srv = createServer(makeApp(db, { dev: true })).listen(0)
const base = `http://localhost:${srv.address().port}`
const call = async (method, path, body, token) => {
  const r = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) }, body: body && JSON.stringify(body) })
  return { status: r.status, ...(await r.json()) }
}
const ok = (cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${msg}`); if (!cond) process.exitCode = 1 }
const a = (await call('POST', '/api/signup', { email: 'a@example.com', username: 'speedy', password: 'secret1' })).token
const b = (await call('POST', '/api/signup', { email: 'b@example.com', username: 'giver', password: 'secret1' })).token
await call('POST', '/api/new', { name: 'Speedy', factionId: 'families' }, a)
await call('POST', '/api/new', { name: 'Giver', factionId: 'firm' }, b)
await call('POST', '/api/act', { action: 'devLevels', args: [5] }, b)
await call('POST', '/api/act', { action: 'devCash', args: [100000] }, b)
const job = (await call('GET', '/api/state', null, a)).state
const jobs0 = job.stats.jobs, cash0 = job.cash
queries = 0
await call('POST', '/api/act', { action: 'doJob', args: ['hustle'] }, a)
ok(queries <= 3, `one tap = ${queries} database round trips (was about 10)`)
// 8 jobs at once plus a gift of $1000 from another player
const firstJob = 'hustle'
const rs = await Promise.all([
  ...Array.from({ length: 8 }, () => call('POST', '/api/act', { action: 'doJob', args: [firstJob] }, a)),
  call('POST', '/api/gift', { to: 'speedy', kind: 'cash', amount: 1000 }, b),
])
ok(rs.every((r) => r.status === 200), 'all taps and the gift answered OK')
const s = (await call('GET', '/api/state', null, a)).state
ok(s.stats.jobs === jobs0 + 9, `all 8 jobs (plus the first tap) counted (${s.stats.jobs - jobs0 - 1} + 1)`)
ok(s.log.some((l) => /Giver/.test(l.text)) && s.cash >= cash0 + 1000, 'the gift arrived too')
srv.close(); await db.close()
