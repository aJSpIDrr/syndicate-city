// Checks gifting between two real accounts: fees, limits, both saves updated, audit log written.
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
const ok = (cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${msg}`); if (!cond) process.exitCode = 1 }
const a = (await call('POST', '/api/signup', { email: 'alice@example.com', username: 'alice', password: 'secret1' })).token
const b = (await call('POST', '/api/signup', { email: 'bob@example.com', username: 'bob', password: 'secret1' })).token
await call('POST', '/api/new', { name: 'Alice', factionId: 'families' }, a)
await call('POST', '/api/new', { name: 'Bob', factionId: 'triad' }, b)
let r = await call('POST', '/api/gift', { to: 'bob', kind: 'cash', amount: 100 }, a)
ok(r.status === 400 && /Level 5/.test(r.error), 'level 1 cannot gift')
await call('POST', '/api/act', { action: 'devLevels', args: [5] }, a)
await call('POST', '/api/act', { action: 'devCash', args: [10000] }, a)
await call('POST', '/api/act', { action: 'devGold', args: [50] }, a)
const before = (await call('GET', '/api/state', null, a)).state
const bBefore = (await call('GET', '/api/state', null, b)).state
r = await call('POST', '/api/gift', { to: 'BOB', kind: 'cash', amount: 1000 }, a)
ok(r.status === 200 && before.cash - r.state.cash === 1050, `cash gift costs 1000 + 5% fee (paid ${before.cash - r.state.cash})`)
let bs = (await call('GET', '/api/state', null, b)).state
ok(bs.cash - bBefore.cash >= 1000 && bs.log.some((l) => /Alice/.test(l.text)), 'bob received $1000 and a message')
r = await call('POST', '/api/gift', { to: 'bob', kind: 'gold', amount: 20 }, a)
ok(r.status === 200 && before.gold - r.state.gold === 21, `gold gift 20 + 1 fee (paid ${before.gold - r.state.gold})`)
r = await call('POST', '/api/gift', { to: 'bob', kind: 'gold', amount: 9999 }, a)
ok(r.status === 400, 'cannot gift more gold than you have')
await call('POST', '/api/act', { action: 'buyItem', args: ['revolver', 2] }, a)
const c0 = (await call('GET', '/api/state', null, a)).state.cash
r = await call('POST', '/api/gift', { to: 'bob', kind: 'item', itemId: 'revolver', qty: 2 }, a)
ok(r.status === 200 && r.state.inventory.revolver === 0 && c0 - r.state.cash === 1000, `item gift: 2 revolvers, $500 shipping each (paid ${c0 - r.state.cash})`)
bs = (await call('GET', '/api/state', null, b)).state
ok(bs.inventory.revolver === 2, 'bob has the revolvers')
r = await call('POST', '/api/gift', { to: 'alice', kind: 'cash', amount: 10 }, a)
ok(r.status === 400, 'no self-gift')
r = await call('POST', '/api/gift', { to: 'nobody', kind: 'cash', amount: 10 }, a)
ok(r.status === 404, 'unknown player')
r = await call('GET', '/api/players?q=bo', null, a)
ok(r.players.length === 1 && r.players[0].username === 'bob', 'player search finds bob')
const led = await db.query('SELECT count(*)::int AS n FROM ledger')
ok(led.rows[0].n === 3, `3 gifts in the audit log (${led.rows[0].n})`)
srv.close(); await db.close()
