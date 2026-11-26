// Phase 3: two real players share the city map, raid each other's HQs and fight a Family war.
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
const act = (tok, action, ...args) => call('POST', '/api/act', { action, args }, tok)
async function player(name, faction) {
  const tok = (await call('POST', '/api/signup', { email: `${name}@ex.com`, username: name, password: 'secret1' })).token
  await call('POST', '/api/new', { name: name.toUpperCase(), factionId: faction }, tok)
  for (let i = 0; i < 5; i++) await act(tok, 'devLevels', 5)
  await act(tok, 'devCash', 5e6)
  return tok
}
const A = await player('alfa', 'families'), B = await player('bravo', 'triad')
// Make Alfa very strong so captures are quick
for (const id of ['tank', 'helicopter', 'lmg', 'swatvest']) await act(A, 'buyItem', id, 20)
await act(A, 'hireCrew', 40)
let r, n = 0
do { r = await act(A, 'attackZone', 'newyork'); if (r.status !== 200) { await act(A, 'devLevels', 1); } n++ } while (r.state?.city?.zones?.newyork?.owner !== 'you' && n < 60)
ok(r.state.city.zones.newyork.owner === 'you', `Alfa captured New York (${n} attacks)`)
let bs = (await call('GET', '/api/state', null, B)).state
ok(bs.city.zones.newyork.owner === 'player' && bs.city.zones.newyork.boss === 'ALFA', 'Bravo sees New York held by the real player ALFA')
r = await act(B, 'attackZone', 'newyork')
ok(r.status === 200 && r.state.city.zones.newyork.garrison < 100, `Bravo can attack Alfa's zone (garrison ${r.state.city.zones.newyork?.garrison}%)`)
// HQ raids
r = await call('GET', '/api/hq/targets', null, B)
ok(r.targets.some((x) => x.username === 'alfa'), 'Alfa appears in Bravo\'s real HQ targets')
let raids = 0; for (let i = 0; i < 12 && raids < 3; i++) { r = await call('POST', '/api/hq/raid', { username: 'alfa' }, B); if (r.status === 200) raids++; else await act(B, 'devLevels', 1) }
r = await call('POST', '/api/hq/raid', { username: 'alfa' }, B)
ok(r.status === 400 && /3 times/.test(r.error), 'max 3 raids per target per day')
const as = (await call('GET', '/api/state', null, A)).state
ok(as.log.some((l) => /BRAVO/.test(l.text) && /HQ/.test(l.text)), 'Alfa is told about Bravo\'s raid')
// Families and a real war
await act(A, 'foundClan', 'Alpha Family', 'ALF', null)
await act(B, 'foundClan', 'Bravo Family', 'BRV', null)
await act(A, 'donate', 500000)
r = await call('GET', '/api/families', null, A)
ok(r.families.some((f) => f.name === 'Bravo Family'), 'Alfa sees the real Bravo Family')
r = await call('POST', '/api/family/war', { username: 'bravo' }, A)
ok(r.status === 200 && r.state.clan.war?.real, 'Alfa declares war on Bravo\'s Family')
r = await call('POST', '/api/family/war', { username: 'bravo' }, A)
ok(r.status === 400, 'cannot declare a second war')
for (let i = 0; i < 4; i++) { const rv = (await call('GET', '/api/state', null, A)).state.rivals[0]; await act(A, 'attackRival', rv.id) }
r = await act(A, 'pushTurf', 'docks')
bs = (await call('GET', '/api/state', null, B)).state
ok(bs.clan.war?.real && bs.clan.war.them > 0, `Bravo sees Alfa's war score live (${Math.round(bs.clan.war.them)})`)
await db.query("UPDATE family_wars SET ends = now() - interval '1 minute'")
const a2 = (await call('GET', '/api/state', null, A)).state, b2 = (await call('GET', '/api/state', null, B)).state
ok(a2.clan.war?.result?.won === true && b2.clan.war?.result?.won === false, 'war ends: Alfa wins, Bravo loses')
ok(a2.clan.warsWon === 1 && b2.clan.warsLost === 1, 'war records updated on both sides')
r = await call('POST', '/api/family/war', { username: 'bravo' }, A)
ok(r.status === 400, 'truce after the war')
srv.close(); await db.close()
