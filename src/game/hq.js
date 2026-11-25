// HQ and city Turf Wars engine. Rivals are AI bosses for now; the data shapes (owner, garrison,
// defense) are kept simple so real players can take their place once the game has a server.
import { FACTIONS, rankIndexForLevel } from '../data/factions.js'
import { getItem } from '../data/content.js'
import { HQ_TIERS, HQ_ROOMS, ROOM_MAX, roomCost, HQ_RAID, ZONES, TURF_WAR } from '../data/hq.js'
import { rand, randInt, pick, clamp, clone, log, toast, money, gainXp, rivalName, derive, bump } from './engine.js'

const H = 3600000

// ---------- state ----------
export function ensureHq(s) {
  s.hq ??= { tier: 1, rooms: {}, gear: [], safe: 0, defended: 0, lost: 0, rivals: [], rivalsAt: 0, lastRaidCheck: Date.now() }
  s.city ??= { zones: {}, pending: 0, captured: 0 }
  for (const z of ZONES) s.city.zones[z.id] ??= newRivalZone(s, z)
}
function newRivalZone(s, z) {
  const f = pick(FACTIONS).id
  return { owner: 'rival', boss: rivalName(f), faction: f, garrison: 100, fortify: 0 }
}

export const hqTier = (s) => HQ_TIERS[(s.hq?.tier || 1) - 1]

/** Sum of a room effect over all built room levels. */
function roomSum(s, key) {
  let t = 0
  for (const r of HQ_ROOMS) { const lv = s.hq?.rooms?.[r.id] || 0; if (lv && r.effects[key]) t += r.effects[key] * lv }
  return t
}
const HQ_ONLY = new Set(['hqDef', 'hqDefPct', 'income', 'safePct', 'protect'])

/** Personal bonuses from HQ rooms and held city zones (merged into perksOf). */
export function hqPerks(s) {
  const out = {}
  const add = (k, v) => { out[k] = (out[k] || 0) + v }
  for (const r of HQ_ROOMS) {
    const lv = s.hq?.rooms?.[r.id] || 0
    if (lv) for (const [k, v] of Object.entries(r.effects)) if (!HQ_ONLY.has(k)) add(k, v * lv)
  }
  for (const z of ZONES) if (s.city?.zones?.[z.id]?.owner === 'you') for (const [k, v] of Object.entries(z.bonus)) add(k, v)
  return out
}

export function safeCap(s) { return Math.round(hqTier(s).safe * (1 + roomSum(s, 'safePct'))) }
export function hqIncome(s) { return roomSum(s, 'income') }
export function roomsBuilt(s) { return HQ_ROOMS.filter((r) => (s.hq.rooms[r.id] || 0) > 0).length }

export function gearPower(s) {
  return (s.hq?.gear || []).reduce((t, id) => { const it = getItem(id); return t + (it ? it.def + it.atk * 0.5 : 0) }, 0)
}
/** HQ defense: building + rooms + gear on display + a share of your own defense. */
export function hqDefense(s, d = derive(s)) {
  return Math.round((hqTier(s).defense + roomSum(s, 'hqDef') + gearPower(s) + d.pDef * 0.4) * (1 + roomSum(s, 'hqDefPct')))
}

// ---------- building ----------
export function upgradeHq(state) {
  const s = clone(state); ensureHq(s)
  const next = HQ_TIERS[s.hq.tier]
  if (!next) return state
  if (rankIndexForLevel(s.level) < next.rank) { toast(s, `${next.name} needs faction Rank ${next.rank + 1}.`, 'error'); return s }
  if (s.cash < next.cost) { toast(s, `${next.name} costs ${money(next.cost)} cash on hand.`, 'error'); return s }
  s.cash -= next.cost
  s.hq.tier++
  toast(s, `Your HQ is now a ${next.name}! More rooms, gear slots and a bigger safe.`, 'level')
  log(s, `You upgraded your HQ to a ${next.name}.`, 'level')
  return s
}

export function buildRoom(state, id) {
  const s = clone(state); ensureHq(s)
  const r = HQ_ROOMS.find((x) => x.id === id)
  const lv = s.hq.rooms[id] || 0
  if (!r || lv >= ROOM_MAX) return state
  if (s.hq.tier < r.tier) { toast(s, `${r.name} needs a tier ${r.tier} HQ.`, 'error'); return s }
  if (!lv && roomsBuilt(s) >= hqTier(s).rooms) { toast(s, 'No free room space. Upgrade the HQ building.', 'error'); return s }
  const cost = roomCost(r, lv + 1)
  if (s.cash < cost) { toast(s, `${r.name} level ${lv + 1} costs ${money(cost)}.`, 'error'); return s }
  s.cash -= cost
  s.hq.rooms[id] = lv + 1
  toast(s, lv ? `${r.name} upgraded to level ${lv + 1}.` : `${r.name} built.`, 'win')
  return s
}

/** Put an item from your inventory on display in the HQ (adds to HQ defense; your crew no longer uses it). */
export function equipHqGear(state, id) {
  const s = clone(state); ensureHq(s)
  const it = getItem(id)
  if (!it || (s.inventory[id] || 0) < 1) return state
  if (s.hq.gear.length >= hqTier(s).gear) { toast(s, 'All HQ gear slots are full. Upgrade the HQ building.', 'error'); return s }
  s.inventory[id]--
  s.hq.gear.push(id)
  toast(s, `${it.name} now guards your HQ (+${Math.round(it.def + it.atk * 0.5)} HQ defense).`, 'win')
  return s
}
export function unequipHqGear(state, index) {
  const s = clone(state); ensureHq(s)
  const id = s.hq.gear[index]
  if (!id) return state
  s.hq.gear.splice(index, 1)
  s.inventory[id] = (s.inventory[id] || 0) + 1
  toast(s, `${getItem(id).name} is back with your crew.`, 'info')
  return s
}

export function collectSafe(state) {
  const s = clone(state); ensureHq(s)
  const amt = Math.floor(s.hq.safe)
  if (amt < 1) return state
  s.hq.safe -= amt
  s.cash += amt
  s.stats.cashEarned += amt
  toast(s, `Collected ${money(amt)} from your HQ safe.`, 'win')
  return s
}

// ---------- rival HQs ----------
function makeRivalHq(s) {
  const f = pick(FACTIONS).id
  const level = Math.max(1, s.level + randInt(-4, 4))
  const tier = clamp(Math.floor(level / 25) + 1 + (Math.random() < 0.25 ? 1 : 0), 1, 5)
  const d = derive(s)
  const defense = Math.round((HQ_TIERS[tier - 1].defense + d.pDef * 0.4 + level * 8) * rand(0.75, 1.2))
  return { id: Math.random().toString(36).slice(2, 9), name: rivalName(f), faction: f, level, rank: rankIndexForLevel(level), tier, defense, safe: Math.round(HQ_TIERS[tier - 1].safe * rand(0.15, 0.6)), hits: 0 }
}
export function refreshRivalHqs(state) {
  const s = clone(state); ensureHq(s)
  s.hq.rivals = Array.from({ length: 6 }, () => makeRivalHq(s))
  s.hq.rivalsAt = Date.now()
  return s
}

export function raidHq(state, rivalId) {
  const s = clone(state); ensureHq(s)
  const r = s.hq.rivals.find((x) => x.id === rivalId)
  if (!r) return state
  if (s.stamina < HQ_RAID.stamina) { toast(s, `Raiding an HQ costs ${HQ_RAID.stamina} Stamina.`, 'error'); return s }
  if (s.health < 20) { toast(s, 'You are too injured. Visit the Street Doctor.', 'error'); return s }
  if (r.hits >= 3) { toast(s, `${r.name}'s HQ is locked down for now.`, 'error'); return s }
  const d = derive(s)
  s.stamina -= HQ_RAID.stamina
  r.hits++
  bump(s, 'hqRaids')
  const crit = Math.random() < d.crit
  const atk = d.pAtk * rand(0.85, 1.15) * (crit ? 1.5 : 1)
  const def = r.defense * (1 - d.pen) * rand(0.85, 1.15)
  if (atk > def) {
    const stolen = Math.floor(r.safe * rand(...HQ_RAID.stealPct))
    r.safe -= stolen
    s.cash += stolen
    s.stats.cashEarned += stolen
    s.health = Math.max(0, s.health - randInt(6, 14))
    const xp = 8 + r.level
    const msg = `${crit ? 'CRITICAL! ' : ''}You broke into ${r.name}'s ${HQ_TIERS[r.tier - 1].name} and cleaned out ${money(stolen)} from the safe. +${xp} XP.`
    toast(s, msg, 'win'); log(s, msg, 'win')
    gainXp(s, xp)
  } else {
    const taken = randInt(18, 34)
    s.health = Math.max(0, s.health - taken)
    const msg = `${r.name}'s HQ held. You took ${taken} damage.`
    toast(s, msg, 'error'); log(s, msg, 'loss')
  }
  return s
}

// ---------- city Turf Wars ----------
export function zoneUnlocked(s, z) {
  if (s.level < z.level) return false
  if (z.needHeld) return heldZones(s).filter((id) => id !== z.id).length >= z.needHeld
  return true
}
export const heldZones = (s) => ZONES.filter((z) => s.city?.zones?.[z.id]?.owner === 'you').map((z) => z.id)
/** Garrison strength of a rival-held zone, scaled to the zone and to you. */
export function zoneStrength(s, z, d = derive(s)) {
  return Math.round((60 + z.level * 22 + d.pDef * 0.25) * (z.crown ? 1.6 : 1))
}
export function zoneDefense(s, z, d = derive(s)) {
  const st = s.city.zones[z.id]
  return Math.round(d.pDef * (1 + (d.perks.turfDef || 0) + st.fortify * 0.12) * 0.9)
}

export function attackZone(state, zoneId) {
  const s = clone(state); ensureHq(s)
  const z = ZONES.find((x) => x.id === zoneId)
  const st = s.city.zones[zoneId]
  if (!z || st.owner === 'you') return state
  if (!zoneUnlocked(s, z)) { toast(s, z.needHeld ? `Hold ${z.needHeld} other zones to move on Mafia HQ.` : `Unlocks at Level ${z.level}.`, 'error'); return s }
  if (s.energy < TURF_WAR.energy || s.stamina < TURF_WAR.stamina) { toast(s, `Each attack costs ${TURF_WAR.energy} Energy and ${TURF_WAR.stamina} Stamina.`, 'error'); return s }
  if (s.health < 20) { toast(s, 'You are too injured. Visit the Street Doctor.', 'error'); return s }
  const d = derive(s)
  s.energy -= TURF_WAR.energy
  s.stamina -= TURF_WAR.stamina
  bump(s, 'turfHits')
  const ratio = clamp((d.pAtk * (1 + (d.perks.turfAtk || 0))) / Math.max(1, zoneStrength(s, z, d) * (1 - d.pen)), 0.25, 2)
  const crit = Math.random() < d.crit
  const dmg = Math.round(rand(12, 22) * ratio * (crit ? 1.5 : 1))
  st.garrison = Math.max(0, st.garrison - dmg)
  const taken = Math.round(rand(4, 10) / Math.max(0.5, ratio))
  s.health = Math.max(0, s.health - taken)
  gainXp(s, 4 + Math.floor(z.level / 3))
  if (st.garrison <= 0) {
    const cash = z.income * 4
    s.city.zones[zoneId] = { owner: 'you', boss: s.bossName, faction: s.factionId, garrison: 100, fortify: 0, since: Date.now() }
    s.cash += cash
    s.city.captured++
    bump(s, 'zonesTaken')
    const msg = `You took ${z.name} from ${st.boss}! +${money(cash)} and ${money(z.income)}/hr. Bonus: ${z.bonusText}.`
    toast(s, msg, 'level'); log(s, msg, 'level')
  } else {
    toast(s, `${crit ? 'CRITICAL! ' : ''}Hit ${st.boss}'s crew in ${z.name}: garrison down to ${st.garrison}%. -${taken} HP.`, ratio >= 0.8 ? 'win' : 'error')
  }
  return s
}

export function fortifyZone(state, zoneId) {
  const s = clone(state); ensureHq(s)
  const st = s.city.zones[zoneId]
  const z = ZONES.find((x) => x.id === zoneId)
  if (!st || st.owner !== 'you' || st.fortify >= TURF_WAR.fortifyMax) return state
  const cost = Math.round(TURF_WAR.fortifyBase * Math.max(1, z.level) * Math.pow(1.8, st.fortify))
  if (s.cash < cost) { toast(s, `Fortifying costs ${money(cost)}.`, 'error'); return s }
  s.cash -= cost
  st.fortify++
  toast(s, `${z.name} fortified to level ${st.fortify} (+${st.fortify * 12}% defense).`, 'win')
  return s
}
export const fortifyCost = (s, zoneId) => {
  const z = ZONES.find((x) => x.id === zoneId)
  return Math.round(TURF_WAR.fortifyBase * Math.max(1, z.level) * Math.pow(1.8, s.city.zones[zoneId].fortify))
}

export function cityIncome(s) { return ZONES.reduce((t, z) => t + (s.city?.zones?.[z.id]?.owner === 'you' ? z.income : 0), 0) }

export function collectTurf(state) {
  const s = clone(state); ensureHq(s)
  const amt = Math.floor(s.city.pending)
  if (amt < 1) return state
  s.city.pending -= amt
  s.cash += amt
  s.stats.cashEarned += amt
  toast(s, `Collected ${money(amt)} from your city turf.`, 'win')
  return s
}

// ---------- hourly simulation ----------
export function hqTick(s, now, dt) {
  ensureHq(s)
  if (dt <= 0) return
  const hours = dt / 3600
  // Safe fills from income rooms
  s.hq.safe = Math.min(safeCap(s), s.hq.safe + hqIncome(s) * hours)
  // Turf income
  const inc = cityIncome(s)
  s.city.pending = Math.min(inc * TURF_WAR.incomeCapHours, s.city.pending + inc * hours)
  // Rival HQ list refresh
  const avg = s.hq.rivals.length ? s.hq.rivals.reduce((t, r) => t + r.level, 0) / s.hq.rivals.length : 0
  if (now - s.hq.rivalsAt > HQ_RAID.refreshMinutes * 60000 || Math.abs(avg - s.level) > 5) { s.hq.rivals = Array.from({ length: 6 }, () => makeRivalHq(s)); s.hq.rivalsAt = now }
  // Raids on your HQ and retakes of your zones (checked at most every 10 minutes of game time)
  if (now - s.hq.lastRaidCheck < 10 * 60000) return
  const span = Math.min(12, (now - s.hq.lastRaidCheck) / H)
  s.hq.lastRaidCheck = now
  if (s.level < 3) return
  const d = derive(s)
  if (Math.random() < span / HQ_RAID.raidEveryHours) hqRaidedBy(s, d)
  for (const z of ZONES) {
    const st = s.city.zones[z.id]
    if (st.owner !== 'you' || Math.random() >= span / TURF_WAR.retakeEveryHours) continue
    const atk = zoneStrength(s, z, d) * rand(0.7, 1.25)
    if (atk > zoneDefense(s, z, d) * rand(0.85, 1.15)) {
      const f = pick(FACTIONS).id
      s.city.zones[z.id] = { owner: 'rival', boss: rivalName(f), faction: f, garrison: 70, fortify: 0 }
      log(s, `${s.city.zones[z.id].boss} took ${z.name} from you. Win it back on the Turf Wars map.`, 'loss')
    } else {
      log(s, `Your crew in ${z.name} beat off a rival attack.`, 'win')
    }
    s.unread++
  }
}

function hqRaidedBy(s, d) {
  const f = pick(FACTIONS).id
  const name = rivalName(f)
  const atk = (d.pAtk * rand(0.7, 1.2) + s.level * 10) * rand(0.85, 1.15)
  if (atk > hqDefense(s, d)) {
    const protect = Math.min(0.6, roomSum(s, 'protect'))
    const stolen = Math.floor(s.hq.safe * rand(0.2, 0.3) * (1 - protect))
    s.hq.safe -= stolen
    s.hq.lost++
    log(s, `${name} raided your HQ and took ${money(stolen)} from the safe.`, 'loss')
  } else {
    s.hq.defended++
    log(s, `${name}'s crew attacked your HQ and was thrown out.`, 'win')
  }
  s.unread++
}
