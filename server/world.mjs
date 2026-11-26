// The shared online world: city Turf Wars zones, the Family district map, raids on real players'
// HQs and wars between real Families. Player saves stay in players.state; shared things live in
// their own tables and are copied into each save when it is loaded (syncIntoState).
import * as E from '../src/game/engine.js'
import { ZONES, TURF_WAR, HQ_RAID } from '../src/data/hq.js'
import { DISTRICTS } from '../src/data/content.js'
import { TURF, WAR, RIVAL_CLANS } from '../src/data/clan.js'
import { zoneStrength, zoneDefense, hqDefense, zoneUnlocked, ensureHq } from '../src/game/hq.js'
import { clanLevel, addClanXp } from '../src/game/clan.js'
import { rankIndexForLevel } from '../src/data/factions.js'

export const WORLD_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS zones (
    map TEXT NOT NULL, zone_id TEXT NOT NULL, owner INT REFERENCES accounts(id) ON DELETE SET NULL,
    strength REAL NOT NULL DEFAULT 100, fortify INT NOT NULL DEFAULT 0, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (map, zone_id))`,
  `CREATE TABLE IF NOT EXISTS family_wars (
    id SERIAL PRIMARY KEY, a INT NOT NULL, b INT NOT NULL, a_score REAL NOT NULL DEFAULT 0, b_score REAL NOT NULL DEFAULT 0,
    starts TIMESTAMPTZ NOT NULL DEFAULT now(), ends TIMESTAMPTZ NOT NULL, settled_a BOOLEAN NOT NULL DEFAULT false, settled_b BOOLEAN NOT NULL DEFAULT false)`,
  `CREATE TABLE IF NOT EXISTS hq_raids (id SERIAL PRIMARY KEY, attacker INT NOT NULL, defender INT NOT NULL, won BOOLEAN NOT NULL, stolen BIGINT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
]
const REGEN_PER_HOUR = 8 // a held zone's garrison recovers this many % per hour
const H = 3600000
const rand = (a, b) => a + Math.random() * (b - a)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const strip = (s) => { const { toast: _t, ...rest } = s; return rest }
const toast = (s, text, kind) => { s.toast = { id: Date.now() + Math.random(), text, kind } }
const log = (s, text, kind) => { s.log.unshift({ id: Date.now() + Math.random(), t: Date.now(), text, kind }); s.log = s.log.slice(0, 60) }

export async function ensureWorld(db) {
  for (const q of WORLD_SCHEMA) await db.query(q)
  for (const z of ZONES) await db.query(`INSERT INTO zones (map, zone_id) VALUES ('city', $1) ON CONFLICT DO NOTHING`, [z.id])
  for (const d of DISTRICTS) await db.query(`INSERT INTO zones (map, zone_id) VALUES ('family', $1) ON CONFLICT DO NOTHING`, [d.id])
}

const regen = (row) => Math.min(100, row.strength + REGEN_PER_HOUR * (Date.now() - new Date(row.updated_at).getTime()) / H)

const ZONE_SELECT = `SELECT z.*, p.boss_name, p.faction, a.username, p.state->'clan'->>'name' AS family, p.state->'clan'->>'tag' AS tag
  FROM zones z LEFT JOIN players p ON p.account_id = z.owner LEFT JOIN accounts a ON a.id = z.owner`
const WAR_SELECT = `SELECT fw.*, o.state->'clan'->>'name' AS oname, o.state->'clan'->>'tag' AS otag
  FROM family_wars fw LEFT JOIN players o ON o.account_id = CASE WHEN fw.a = $1 THEN fw.b ELSE fw.a END
  WHERE (fw.a = $1 AND NOT fw.settled_a) OR (fw.b = $1 AND NOT fw.settled_b) ORDER BY fw.id DESC LIMIT 1`

/** Copies the shared world into a player's save (called whenever a save is loaded online). */
export async function syncIntoState(t, accountId, s) {
  const zones = (await t.query(ZONE_SELECT)).rows
  const war = s.clan ? (await t.query(WAR_SELECT, [accountId])).rows[0] || null : null
  applyWorld(s, accountId, zones, war)
  if (war && Date.now() >= new Date(war.ends).getTime()) await settleRealWar(t, accountId, s, war)
  return s
}

/**
 * Fast load for the everyday path: the save, its version, the turf maps and any Family war in ONE
 * database round trip (each round trip to the hosted database is slow, so we keep them few).
 */
export async function loadFast(db, accountId) {
  const r = (await db.query(
    `SELECT p.state, p.rev,
       (SELECT coalesce(json_agg(z), '[]'::json) FROM (${ZONE_SELECT}) z) AS zones,
       (SELECT row_to_json(w) FROM (${WAR_SELECT}) w) AS war
     FROM players p WHERE p.account_id = $1`, [accountId])).rows[0]
  return r || null
}
/** True when the war has ended and still needs settling (that path writes, so it uses a transaction). */
export const warNeedsSettling = (war) => !!war && Date.now() >= new Date(war.ends).getTime()

/**
 * Fast save in ONE round trip: stores the save only if nobody changed it since loadFast (rev check),
 * and banks any new war points in the same statement. Returns false if the save changed meanwhile.
 */
export async function saveFast(db, accountId, s, rev) {
  const w = s.clan?.war
  let warId = null, delta = 0
  if (w?.real && !w.result) {
    delta = Math.max(0, w.us - (w.synced || 0))
    if (delta > 0) { warId = w.warId; w.synced = w.us }
  }
  const r = await db.query(
    `WITH p AS (UPDATE players SET state = $2, level = $3, rev = rev + 1, updated_at = now() WHERE account_id = $1 AND rev = $4 RETURNING 1),
     w AS (UPDATE family_wars SET a_score = a_score + CASE WHEN a = $1 THEN $6::real ELSE 0 END, b_score = b_score + CASE WHEN b = $1 THEN $6::real ELSE 0 END
           WHERE id = $5::int AND ends > now() AND EXISTS (SELECT 1 FROM p) RETURNING 1)
     SELECT (SELECT count(*) FROM p)::int AS n`, [accountId, strip(s), s.level, rev, warId, delta])
  return r.rows[0].n === 1
}

function applyWorld(s, accountId, zones, w) {
  s.online = true
  ensureHq(s)
  for (const r of zones.filter((z) => z.map === 'city')) {
    const mine = r.owner === accountId
    const cur = s.city.zones[r.zone_id] || {}
    s.city.zones[r.zone_id] = mine
      ? { owner: 'you', boss: s.bossName, faction: s.factionId, garrison: Math.round(regen(r)), fortify: r.fortify, since: cur.since || Date.now() }
      : r.owner
        ? { owner: 'player', boss: r.boss_name, username: r.username, faction: r.faction, garrison: Math.round(regen(r)), fortify: r.fortify }
        : { owner: 'rival', boss: cur.owner === 'rival' ? cur.boss : 'An AI crew', faction: cur.faction || 'families', garrison: Math.round(regen(r)), fortify: 0 }
  }
  if (!s.clan) return
  for (const r of zones.filter((z) => z.map === 'family')) {
    const mine = r.owner === accountId
    const st = Math.round(regen(r))
    s.clan.turf[r.zone_id] = mine
      ? { control: Math.max(TURF.holdAt, st), strength: st, rival: s.clan.turf[r.zone_id]?.rival || RIVAL_CLANS[0].id, holder: 'you' }
      : { control: 0, strength: st, rival: s.clan.turf[r.zone_id]?.rival || RIVAL_CLANS[0].id, holder: r.owner ? `${r.family || r.boss_name} [${r.tag || '?'}]` : null }
  }
  if (w) {
    const meA = w.a === accountId
    const other = meA ? w.b : w.a
    const us = meA ? w.a_score : w.b_score, them = meA ? w.b_score : w.a_score
    const prev = s.clan.war?.real && s.clan.war.warId === w.id ? s.clan.war : null
    s.clan.war = {
      real: true, warId: w.id, rival: `p:${other}`, rivalName: w.oname || 'A rival Family', rivalTag: w.otag || '?',
      startedAt: new Date(w.starts).getTime(), endsAt: new Date(w.ends).getTime(), us, them, synced: us, lastTick: prev?.lastTick || Date.now(), result: null,
    }
  } else if (s.clan.war?.real && !s.clan.war.result) {
    s.clan.war = null
  }
}
export { applyWorld }

/** After an action, add any war points the player earned to their Family's real war. */
export async function syncWarScore(t, accountId, s) {
  const w = s.clan?.war
  if (!w?.real || w.result) return
  const delta = Math.max(0, w.us - (w.synced || 0))
  if (delta <= 0) return
  const row = (await t.query('SELECT a, ends FROM family_wars WHERE id = $1', [w.warId])).rows[0]
  if (!row || Date.now() > new Date(row.ends).getTime()) return
  await t.query(`UPDATE family_wars SET ${row.a === accountId ? 'a_score = a_score' : 'b_score = b_score'} + $2 WHERE id = $1`, [w.warId, delta])
  w.synced = w.us
}

async function settleRealWar(t, accountId, s, row) {
  const meA = row.a === accountId
  const us = Math.round(meA ? row.a_score : row.b_score), them = Math.round(meA ? row.b_score : row.a_score)
  const c = s.clan
  const won = us > them
  if (won) {
    const spoils = Math.round(20000 * clanLevel(c).level * (1 + WAR.winTreasuryPct))
    c.treasury += spoils
    s.gold += WAR.winGold
    addClanXp(s, WAR.winXp)
    c.warsWon++
    c.war = { ...c.war, us, them, result: { won: true, spoils } }
    log(s, `Your Family beat ${c.war.rivalName} ${us}–${them} in a war between real Families! +${WAR.winGold} Gold, +${E.money(spoils)} to the treasury.`, 'level')
  } else {
    c.warsLost++
    c.war = { ...c.war, us, them, result: { won: false, spoils: 0 } }
    log(s, `Your Family lost the war against ${c.war.rivalName} ${us}–${them}.`, 'loss')
  }
  c.truce[`p:${meA ? row.b : row.a}`] = Date.now() + WAR.truceHours * H
  await t.query(`UPDATE family_wars SET ${meA ? 'settled_a' : 'settled_b'} = true WHERE id = $1`, [row.id])
}

// ---------- endpoints (each runs inside withPlayer, so the caller's save is locked) ----------
async function loadOther(t, id) {
  const r = (await t.query('SELECT state FROM players WHERE account_id = $1 FOR UPDATE', [id])).rows[0]
  return r ? E.tick(E.migrate(r.state)) : null
}
async function saveOther(t, id, s) {
  await t.query('UPDATE players SET state = $2, level = $3, rev = rev + 1, updated_at = now() WHERE account_id = $1', [id, strip(s), s.level])
}

/** Attack a city zone (map 'city') or push on a Family district (map 'family'). */
export async function attackShared(t, accountId, s, map, zoneId) {
  const city = map === 'city'
  const z = city ? ZONES.find((x) => x.id === zoneId) : DISTRICTS.find((x) => x.id === zoneId)
  if (!z) return { error: 'Unknown zone.' }
  if (!city && !s.clan) return { error: 'You need a Family to fight for districts.' }
  const row = (await t.query('SELECT * FROM zones WHERE map = $1 AND zone_id = $2 FOR UPDATE', [map, zoneId])).rows[0]
  const energy = city ? TURF_WAR.energy : TURF.pushEnergy
  const stamina = city ? TURF_WAR.stamina : 0
  if (city && !zoneUnlocked(s, z)) return { error: z.needHeld ? `Hold ${z.needHeld} other zones to move on Mafia HQ.` : `Unlocks at Level ${z.level}.` }
  if (!city && s.level < z.level) return { error: `${z.name} unlocks at Level ${z.level}.` }
  if (s.energy < energy || s.stamina < stamina) return { error: `This costs ${energy} Energy${stamina ? ` and ${stamina} Stamina` : ''}.` }
  if (s.health < 20) return { error: 'You are too injured. Visit the Street Doctor.' }
  s.energy -= energy; s.stamina -= stamina
  const d = E.derive(s)
  const strength = regen(row)
  const name = city ? z.name : z.name
  if (row.owner === accountId) { // reinforce your own zone
    const gain = Math.round(rand(6, 10))
    await t.query('UPDATE zones SET strength = $3, updated_at = now() WHERE map = $1 AND zone_id = $2', [map, zoneId, Math.min(100, strength + gain)])
    toast(s, `Reinforced ${name}: ${Math.round(Math.min(100, strength + gain))}% strength.`, 'win')
    if (!city) E.gainXp(s, 3)
    return { ok: true }
  }
  let defense
  if (row.owner) {
    const owner = (await t.query('SELECT state FROM players WHERE account_id = $1', [row.owner])).rows[0]
    const os = owner ? E.migrate(owner.state) : null
    defense = os ? (city ? zoneDefense({ ...os, city: { zones: { [zoneId]: { fortify: row.fortify } } } }, z) : E.derive(os).pDef * 0.9) : 50
  } else {
    defense = city ? zoneStrength(s, z, d) : 50 + (z.level || 1) * 20 + d.pDef * 0.2
  }
  const power = d.pAtk * (1 + (city ? d.perks.turfAtk || 0 : d.perks.clanPower || 0))
  const ratio = clamp(power / Math.max(1, defense * (1 - d.pen)), 0.25, 2)
  const crit = Math.random() < d.crit
  const dmg = Math.round(rand(12, 22) * ratio * (crit ? 1.5 : 1))
  const left = Math.max(0, strength - dmg)
  E.bump(s, city ? 'turfHits' : 'familyPushes')
  if (s.clan?.war && !s.clan.war.result) s.clan.war.us += 2
  E.gainXp(s, 4 + Math.floor((z.level || 1) / 3))
  s.health = Math.max(0, s.health - Math.round(rand(4, 10) / Math.max(0.5, ratio)))
  if (left > 0) {
    await t.query('UPDATE zones SET strength = $3, updated_at = now() WHERE map = $1 AND zone_id = $2', [map, zoneId, left])
    toast(s, `${crit ? 'CRITICAL! ' : ''}Hit the defenders of ${name}: ${Math.round(left)}% left.`, ratio >= 0.8 ? 'win' : 'error')
    return { ok: true }
  }
  // Captured
  const prevOwner = row.owner
  await t.query('UPDATE zones SET owner = $3, strength = 100, fortify = 0, updated_at = now() WHERE map = $1 AND zone_id = $2', [map, zoneId, accountId])
  if (city) { s.cash += z.income * 4; E.bump(s, 'zonesTaken') }
  toast(s, city ? `You took ${name}! +${E.money(z.income * 4)} and ${E.money(z.income)}/hr. Bonus: ${z.bonusText}.` : `Your Family took ${name}!`, 'level')
  log(s, city ? `You captured ${name} on the city map.` : `Your Family captured ${name}.`, 'level')
  if (prevOwner) {
    const os = await loadOther(t, prevOwner)
    if (os) { log(os, `${s.bossName} took ${name} from you${city ? '' : 'r Family'}. Win it back!`, 'loss'); os.unread = (os.unread || 0) + 1; await saveOther(t, prevOwner, os) }
  }
  return { ok: true }
}

export async function fortifyShared(t, accountId, s, zoneId) {
  const row = (await t.query("SELECT * FROM zones WHERE map = 'city' AND zone_id = $1 FOR UPDATE", [zoneId])).rows[0]
  const z = ZONES.find((x) => x.id === zoneId)
  if (!row || row.owner !== accountId) return { error: 'You don\'t hold that zone.' }
  if (row.fortify >= TURF_WAR.fortifyMax) return { error: 'Already fully fortified.' }
  const cost = Math.round(TURF_WAR.fortifyBase * Math.max(1, z.level) * Math.pow(1.8, row.fortify))
  if (s.cash < cost) return { error: `Fortifying costs ${E.money(cost)}.` }
  s.cash -= cost
  await t.query("UPDATE zones SET fortify = fortify + 1 WHERE map = 'city' AND zone_id = $1", [zoneId])
  toast(s, `${z.name} fortified to level ${row.fortify + 1}.`, 'win')
  return { ok: true }
}

/** Real players' HQs near your level that you can raid. */
export async function hqTargets(db, accountId, s) {
  const rows = (await db.query(
    `SELECT p.account_id, a.username, p.boss_name, p.faction, p.level, p.state->'hq' AS hq, p.state AS state
     FROM players p JOIN accounts a ON a.id = p.account_id
     WHERE p.account_id <> $1 AND p.level >= 5 AND p.level BETWEEN $2 AND $3 ORDER BY random() LIMIT 8`,
    [accountId, Math.max(5, s.level - 15), s.level + 15])).rows
  const recent = (await db.query(`SELECT defender, count(*)::int AS n FROM hq_raids WHERE attacker = $1 AND created_at > now() - interval '1 day' GROUP BY defender`, [accountId])).rows
  return rows.map((r) => {
    const os = E.migrate(r.state)
    return {
      username: r.username, name: r.boss_name, faction: r.faction, level: r.level, rank: rankIndexForLevel(r.level), tier: os.hq.tier,
      defense: hqDefense(os), safe: Math.round(os.hq.safe), raidsLeft: Math.max(0, 3 - (recent.find((x) => x.defender === r.account_id)?.n || 0)),
    }
  })
}

export async function raidPlayerHq(t, accountId, s, username) {
  const target = (await t.query('SELECT a.id FROM accounts a JOIN players p ON p.account_id = a.id WHERE a.username_lower = $1', [String(username || '').toLowerCase()])).rows[0]
  if (!target || target.id === accountId) return { error: 'Pick another boss.' }
  const n = (await t.query(`SELECT count(*)::int AS n FROM hq_raids WHERE attacker = $1 AND defender = $2 AND created_at > now() - interval '1 day'`, [accountId, target.id])).rows[0].n
  if (n >= 3) return { error: 'You already raided this HQ 3 times today.' }
  if (s.stamina < HQ_RAID.stamina) return { error: `Raiding an HQ costs ${HQ_RAID.stamina} Stamina.` }
  if (s.health < 20) return { error: 'You are too injured. Visit the Street Doctor.' }
  const os = await loadOther(t, target.id)
  if (!os || os.level < 5) return { error: 'That boss is still under new-player protection.' }
  s.stamina -= HQ_RAID.stamina
  E.bump(s, 'hqRaids')
  const d = E.derive(s)
  const crit = Math.random() < d.crit
  const atk = d.pAtk * rand(0.85, 1.15) * (crit ? 1.5 : 1)
  const def = hqDefense(os) * (1 - d.pen) * rand(0.85, 1.15)
  let stolen = 0
  if (atk > def) {
    const protect = Math.min(0.6, (os.hq.rooms.vault || 0) * 0.06)
    stolen = Math.floor(os.hq.safe * rand(...HQ_RAID.stealPct) * (1 - protect))
    os.hq.safe -= stolen
    os.hq.lost++
    s.cash += stolen
    s.stats.cashEarned += stolen
    E.gainXp(s, 8 + os.level)
    toast(s, `${crit ? 'CRITICAL! ' : ''}You broke into ${os.bossName}'s HQ and took ${E.money(stolen)} from the safe.`, 'win')
    log(s, `You raided ${os.bossName}'s HQ and took ${E.money(stolen)}.`, 'win')
    log(os, `${s.bossName} broke into your HQ and took ${E.money(stolen)} from the safe. Raid them back from the HQ tab!`, 'loss')
  } else {
    os.hq.defended++
    s.health = Math.max(0, s.health - Math.round(rand(18, 34)))
    toast(s, `${os.bossName}'s HQ held.`, 'error')
    log(os, `${s.bossName} tried to raid your HQ and was thrown out.`, 'win')
  }
  os.unread = (os.unread || 0) + 1
  await saveOther(t, target.id, os)
  await t.query('INSERT INTO hq_raids (attacker, defender, won, stolen) VALUES ($1, $2, $3, $4)', [accountId, target.id, stolen > 0, stolen])
  return { ok: true }
}

/** Real Families you could go to war with. */
export async function familyList(db, accountId) {
  const rows = (await db.query(
    `SELECT p.account_id, a.username, p.boss_name, p.level, p.state->'clan'->>'name' AS name, p.state->'clan'->>'tag' AS tag,
            p.state->'clan'->'crest' AS crest, jsonb_array_length(coalesce(p.state->'clan'->'members', '[]'::jsonb)) AS members, (p.state->'clan'->>'xp')::float AS xp
     FROM players p JOIN accounts a ON a.id = p.account_id WHERE p.account_id <> $1 AND p.state->'clan'->>'name' IS NOT NULL ORDER BY xp DESC LIMIT 30`, [accountId])).rows
  const busy = (await db.query('SELECT a, b FROM family_wars WHERE NOT (settled_a AND settled_b) AND ends > now()')).rows
  return rows.map((r) => ({ ...r, level: clanLevel({ xp: r.xp || 0 }).level, atWar: busy.some((w) => w.a === r.account_id || w.b === r.account_id) }))
}

export async function declareRealWar(t, accountId, s, username) {
  const c = s.clan
  if (!c) return { error: 'You need a Family first.' }
  if (rankIndexForLevel(s.level) < 2) return { error: 'You need faction Rank 3 to lead a Family war.' }
  if (c.war && !c.war.result) return { error: 'Your Family is already at war.' }
  const target = (await t.query(`SELECT a.id FROM accounts a JOIN players p ON p.account_id = a.id WHERE a.username_lower = $1 AND p.state->'clan'->>'name' IS NOT NULL`, [String(username || '').toLowerCase()])).rows[0]
  if (!target || target.id === accountId) return { error: 'Pick another Family.' }
  if ((c.truce[`p:${target.id}`] || 0) > Date.now()) return { error: 'You are in a truce with that Family.' }
  const busy = (await t.query('SELECT 1 FROM family_wars WHERE (a = ANY($1) OR b = ANY($1)) AND ends > now()', [[accountId, target.id]])).rows
  if (busy.length) return { error: 'One of the Families is already at war.' }
  const cost = WAR.costPerLevel * clanLevel(c).level
  if (c.treasury < cost) return { error: `Declaring war costs ${E.money(cost)} from the treasury.` }
  c.treasury -= cost
  await t.query(`INSERT INTO family_wars (a, b, ends) VALUES ($1, $2, now() + interval '${WAR.hours} hours')`, [accountId, target.id])
  const os = await loadOther(t, target.id)
  if (os) { log(os, `${c.name} [${c.tag}] declared war on your Family! 24 hours: fights, turf pushes and World Enemy hits all score.`, 'loss'); os.unread = (os.unread || 0) + 1; await saveOther(t, target.id, os) }
  toast(s, 'War declared! Every fight, turf push and World Enemy hit scores for your Family.', 'level')
  return { ok: true }
}
