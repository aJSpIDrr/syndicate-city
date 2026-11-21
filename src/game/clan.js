// Family engine: your crime family of AI members. Everything here works on a cloned state and
// is called from the main engine (tick, perks, events) or from the Family screen.
import { FACTIONS, getFaction, rankIndexForLevel } from '../data/factions.js'
import { DISTRICTS } from '../data/content.js'
import {
  CLAN, SPECIALTIES, ROLES, CLAN_UPGRADES, upgradeCost, RIVAL_CLANS, TURF, WAR, HEISTS, CONTRACTS, CHATTER,
  standingFor, WAR_MIN_RANK, MEMBER_LEVEL_HOURS,
} from '../data/clan.js'
import { rand, randInt, pick, clamp, clone, log, toast, money, gainXp, rivalName, derive } from './engine.js'

const H = 3600000
const an = (w) => (/^[AEIOU]/i.test(w) ? 'an' : 'a') + ' ' + w
const dayKey = (t = Date.now()) => new Date(t).toLocaleDateString('en-CA')
const uid = () => Math.random().toString(36).slice(2, 9)
const specs = Object.keys(SPECIALTIES)

// ---------- levels, slots, perks ----------
export function clanLevel(c) {
  const t = CLAN.xpToLevel
  let level = 1
  while (level < t.length && c.xp >= t[level]) level++
  return { level, base: t[level - 1], next: level < t.length ? t[level] : null }
}
export const playerRank = (s) => rankIndexForLevel(s.level)
export const memberRank = (m) => rankIndexForLevel(m.level)
export const memberRankTitle = (m) => getFaction(m.faction).ranks[memberRank(m)].title
export const standingOf = (s) => standingFor(playerRank(s))
/** A position only works while you and the member both hold the required faction ranks. */
export function roleActive(s, role, m) { return !!m && playerRank(s) >= role.playerRank && memberRank(m) >= role.memberRank }

export function clanSlots(c, s) {
  return CLAN.baseSlots + Math.floor(clanLevel(c).level / 2) + (c.upgrades.barracks || 0) + (s ? standingOf(s).slots : 0)
}
export function memberById(c, id) { return c.members.find((m) => m.id === id) }

/** Personal bonuses from family positions and upgrades (merged into perksOf). */
export function clanPerks(s) {
  const out = {}
  const c = s.clan
  if (!c) return out
  const add = (k, v) => { out[k] = (out[k] || 0) + v }
  for (const r of ROLES) {
    const m = c.roles[r.id] && memberById(c, c.roles[r.id])
    if (roleActive(s, r, m)) for (const [k, v] of Object.entries(r.effects)) add(k, v * m.skill)
  }
  for (const u of CLAN_UPGRADES) {
    const lv = c.upgrades[u.id] || 0
    if (lv) for (const [k, v] of Object.entries(u.effects)) if (k !== 'slots') add(k, v * lv)
  }
  return out
}

export function heldDistricts(c) {
  return DISTRICTS.filter((d) => (c.turf[d.id]?.control || 0) >= TURF.holdAt).map((d) => d.id)
}

// ---------- members ----------
function makeMember(level) {
  const faction = pick(FACTIONS).id
  const skill = clamp(Math.round(rand(2, 7) + (Math.random() < 0.2 ? rand(1, 3) : 0)), 1, 10)
  const lvl = Math.max(1, level + randInt(-3, 3))
  return {
    id: uid(), name: rivalName(faction), faction, level: lvl, spec: pick(specs), skill,
    loyalty: randInt(60, 85), wage: Math.round(skill * (lvl + 4) * 25), joinedAt: 0, busyUntil: 0,
  }
}
export const hireCost = (m) => Math.round(m.wage * 4 + m.skill * m.skill * 400)
export const giftCost = (m) => Math.round(m.wage * 1.5)
const rankOfMember = (m) => memberRank(m)
export { rankOfMember }

// ---------- founding ----------
export function cleanName(v, max) { return String(v || '').replace(/[^\p{L}\p{N} '&.-]/gu, '').trim().slice(0, max) }

export function foundClan(state, name, tag, crest) {
  const n = cleanName(name, 24), t = cleanName(tag, 4).toUpperCase().replace(/\s/g, '')
  if (state.clan) return state
  const s = clone(state)
  if (s.level < CLAN.foundLevel) { toast(s, `You can found a family at Level ${CLAN.foundLevel}.`, 'error'); return s }
  if (n.length < 3) { toast(s, 'Give your family a name of at least 3 letters.', 'error'); return s }
  if (t.length < 2) { toast(s, 'The tag needs 2–4 letters.', 'error'); return s }
  if (s.cash < CLAN.foundCost) { toast(s, `Founding a family costs ${money(CLAN.foundCost)} cash on hand.`, 'error'); return s }
  s.cash -= CLAN.foundCost
  const turf = {}
  for (const d of DISTRICTS) turf[d.id] = { control: 0, rival: pick(RIVAL_CLANS).id }
  const now = Date.now()
  s.clan = {
    name: n, tag: t, crest, foundedAt: now, xp: 0, treasury: 0,
    members: [], roles: {}, upgrades: {}, recruits: [], recruitsAt: 0,
    turf, war: null, truce: {}, warsWon: 0, warsLost: 0,
    heists: [], heistLog: [], contracts: null, feed: [], feedAt: now, lastWageAt: now,
  }
  refreshRecruitsIn(s)
  ensureContracts(s)
  feed(s, null, `${s.bossName} founded ${n} [${t}]. The city has a new family.`, 'system')
  toast(s, `${n} [${t}] is founded. Recruit your first members.`, 'level')
  log(s, `You founded the family ${n} [${t}].`, 'level')
  return s
}

function feed(s, member, text, kind = 'chat') {
  s.clan.feed.unshift({ id: uid(), t: Date.now(), name: member?.name || null, spec: member?.spec || null, text, kind })
  s.clan.feed = s.clan.feed.slice(0, 40)
}

function refreshRecruitsIn(s) {
  s.clan.recruits = Array.from({ length: 5 }, () => makeMember(s.level))
  s.clan.recruitsAt = Date.now()
}

export function rerollRecruits(state) {
  const s = clone(state)
  const cost = 5
  if (s.gold < cost) { toast(s, `New candidates cost ${cost} Gold (or wait for the free refresh).`, 'error'); return s }
  s.gold -= cost
  refreshRecruitsIn(s)
  toast(s, 'Fresh candidates are waiting.', 'info')
  return s
}

export function hireRecruit(state, id) {
  const s = clone(state)
  const c = s.clan
  const m = c.recruits.find((x) => x.id === id)
  if (!m) return state
  if (c.members.length >= clanSlots(c, s)) { toast(s, 'No free member slots. Level up the family, build Barracks or rise in faction rank.', 'error'); return s }
  const cost = hireCost(m)
  if (s.cash < cost) { toast(s, `Signing ${m.name} costs ${money(cost)} cash on hand.`, 'error'); return s }
  s.cash -= cost
  m.joinedAt = Date.now()
  c.members.push(m)
  c.recruits = c.recruits.filter((x) => x.id !== id)
  feed(s, m, `*kisses the ring* "I won't let you down, ${s.bossName}."`, 'join')
  toast(s, `${m.name} joined ${c.name} as ${/^[AEIOU]/.test(SPECIALTIES[m.spec].name) ? 'an' : 'a'} ${SPECIALTIES[m.spec].name}.`, 'win')
  return s
}

export function dismissMember(state, id) {
  const s = clone(state)
  const c = s.clan
  const m = memberById(c, id)
  if (!m) return state
  if (m.busyUntil > Date.now()) { toast(s, `${m.name} is out on a heist.`, 'error'); return s }
  c.members = c.members.filter((x) => x.id !== id)
  for (const r of Object.keys(c.roles)) if (c.roles[r] === id) delete c.roles[r]
  feed(s, null, `${m.name} was let go.`, 'leave')
  toast(s, `${m.name} has left the family.`, 'info')
  return s
}

export function giftMember(state, id) {
  const s = clone(state)
  const m = memberById(s.clan, id)
  if (!m) return state
  const cost = giftCost(m)
  if (s.cash < cost) { toast(s, `A gift for ${m.name} costs ${money(cost)}.`, 'error'); return s }
  if (m.loyalty >= 100) { toast(s, `${m.name} is already completely loyal.`, 'info'); return s }
  s.cash -= cost
  m.loyalty = Math.min(100, m.loyalty + 20)
  feed(s, m, `"Grazie, ${s.bossName}. I'll remember this."`, 'chat')
  toast(s, `${m.name}'s loyalty rose to ${m.loyalty}.`, 'win')
  return s
}

export function assignRole(state, roleId, memberId) {
  const s = clone(state)
  const c = s.clan
  const req = ROLES.find((r) => r.id === roleId)
  if (memberId) {
    const cand = memberById(c, memberId)
    if (playerRank(s) < req.playerRank) { toast(s, `You need faction Rank ${req.playerRank + 1} to appoint ${an(req.name)}.`, 'error'); return s }
    if (!cand || memberRank(cand) < req.memberRank) { toast(s, `${an(req.name).replace(/^a/, 'A')} must be at least Rank ${req.memberRank + 1} in their own faction.`, 'error'); return s }
  }
  for (const r of Object.keys(c.roles)) if (c.roles[r] === memberId) delete c.roles[r]
  if (memberId) c.roles[roleId] = memberId
  else delete c.roles[roleId]
  const m = memberId && memberById(c, memberId)
  const role = ROLES.find((r) => r.id === roleId)
  if (m) { feed(s, null, `${m.name} is now ${role.name}.`, 'system'); toast(s, `${m.name} is your ${role.name}.`, 'win') }
  return s
}

// ---------- treasury & upgrades ----------
export function donate(state, amount) {
  const s = clone(state)
  const amt = Math.min(Math.floor(amount), s.cash)
  if (amt <= 0 || !s.clan) return state
  s.cash -= amt
  s.clan.treasury += amt
  addClanXp(s, amt / CLAN.donationPerXp)
  clanEventIn(s, 'donate', amt)
  toast(s, `Donated ${money(amt)} to the treasury.`, 'win')
  return s
}

export function addClanXp(s, xp) {
  if (!s.clan || xp <= 0) return
  const before = clanLevel(s.clan).level
  s.clan.xp += xp
  const after = clanLevel(s.clan).level
  if (after > before) {
    feed(s, null, `${s.clan.name} reached family level ${after}!`, 'system')
    toast(s, `${s.clan.name} is now family level ${after}! More member slots and upgrades unlocked.`, 'level')
    log(s, `Your family reached level ${after}.`, 'level')
  }
}

export function buyClanUpgrade(state, id) {
  const s = clone(state)
  const c = s.clan
  const lv = c.upgrades[id] || 0
  const u = CLAN_UPGRADES.find((x) => x.id === id)
  if (lv >= clanLevel(c).level) { toast(s, 'Upgrades can\'t go above the family level.', 'error'); return s }
  const cost = upgradeCost(lv + 1)
  if (c.treasury < cost) { toast(s, `The treasury needs ${money(cost)}.`, 'error'); return s }
  c.treasury -= cost
  c.upgrades[id] = lv + 1
  feed(s, null, `${u.name} upgraded to level ${lv + 1}.`, 'system')
  toast(s, `${u.name} is now level ${lv + 1}.`, 'level')
  return s
}

// ---------- turf ----------
function clanPower(s) { return 1 + (derive(s).perks.clanPower || 0) }

export function pushTurf(state, districtId) {
  const s = clone(state)
  const c = s.clan
  const t = c.turf[districtId]
  const d = DISTRICTS.find((x) => x.id === districtId)
  if (!t) return state
  if (s.level < d.level) { toast(s, `${d.name} unlocks at Level ${d.level}.`, 'error'); return s }
  if (t.control >= 100) { toast(s, `${d.name} is already fully yours.`, 'info'); return s }
  if (s.energy < TURF.pushEnergy) { toast(s, `Pushing turf costs ${TURF.pushEnergy} Energy.`, 'error'); return s }
  s.energy -= TURF.pushEnergy
  const before = t.control
  const gain = Math.round(rand(5, 9) * clanPower(s))
  t.control = Math.min(100, t.control + gain)
  addClanXp(s, 5)
  clanEventIn(s, 'turf', 1)
  warPoints(s, 2)
  gainXp(s, 3)
  const rival = RIVAL_CLANS.find((r) => r.id === t.rival)
  if (before < TURF.holdAt && t.control >= TURF.holdAt) {
    feed(s, null, `${c.name} took ${d.name} from ${rival.name}!`, 'system')
    toast(s, `You now hold ${d.name}! +${Math.round(TURF.jobCashBonus * 100)}% job cash there and treasury income.`, 'level')
  } else {
    toast(s, `Pushed ${rival.name} back in ${d.name}: ${t.control}% control.`, 'win')
  }
  return s
}

// ---------- wars ----------
export function warPoints(s, n) {
  const w = s.clan?.war
  if (w && !w.result && Date.now() < w.endsAt) w.us += n
}

export function declareWar(state, rivalId) {
  const s = clone(state)
  const c = s.clan
  if (c.war && !c.war.result) return state
  const rival = RIVAL_CLANS.find((r) => r.id === rivalId)
  if (playerRank(s) < WAR_MIN_RANK) { toast(s, `You need faction Rank ${WAR_MIN_RANK + 1} to lead a family war.`, 'error'); return s }
  if ((c.truce[rivalId] || 0) > Date.now()) { toast(s, `You're in a truce with ${rival.name}.`, 'error'); return s }
  const cost = WAR.costPerLevel * clanLevel(c).level
  if (c.treasury < cost) { toast(s, `Declaring war costs ${money(cost)} from the treasury.`, 'error'); return s }
  c.treasury -= cost
  const now = Date.now()
  c.war = { rival: rivalId, startedAt: now, endsAt: now + WAR.hours * H, us: 0, them: 0, result: null, lastTick: now }
  feed(s, null, `${c.name} declared war on ${rival.name}! 24 hours. Every fight counts.`, 'war')
  toast(s, `War declared on ${rival.name}! Win fights, push turf and hit World Enemies to score.`, 'level')
  log(s, `Your family declared war on ${rival.name}.`, 'level')
  return s
}

export function claimWar(state) {
  const s = clone(state)
  const c = s.clan
  if (!c.war?.result) return state
  c.war = null
  return s
}

// ---------- heists ----------
export function heistChance(c, heist, crewIds, bonus = 0) {
  const crew = crewIds.map((id) => memberById(c, id)).filter(Boolean)
  let score = 0
  for (const m of crew) score += m.skill * (heist.needs.includes(m.spec) ? 1.5 : 1)
  const strategists = crew.filter((m) => m.spec === 'strategist').length
  const missing = heist.needs.filter((n) => !crew.some((m) => m.spec === n)).length
  return clamp(0.4 + (score - heist.difficulty) * 0.035 + strategists * 0.03 - missing * 0.1 + bonus, 0.1, 0.95)
}

export function startHeist(state, heistId, crewIds) {
  const s = clone(state)
  const c = s.clan
  const h = HEISTS.find((x) => x.id === heistId)
  const now = Date.now()
  if (s.level < h.level) { toast(s, `Unlocks at Level ${h.level}.`, 'error'); return s }
  if (c.heists.some((x) => x.heistId === heistId)) { toast(s, 'That heist is already underway.', 'error'); return s }
  if (crewIds.length !== h.crew) { toast(s, `Pick exactly ${h.crew} crew members.`, 'error'); return s }
  if (crewIds.some((id) => (memberById(c, id)?.busyUntil || 0) > now)) { toast(s, 'Someone on that crew is busy.', 'error'); return s }
  if (c.treasury < h.prep) { toast(s, `Prep costs ${money(h.prep)} from the treasury.`, 'error'); return s }
  c.treasury -= h.prep
  const chance = heistChance(c, h, crewIds, derive(s).perks.heistBonus || 0)
  const endsAt = now + h.hours * H
  for (const id of crewIds) memberById(c, id).busyUntil = endsAt
  c.heists.push({ id: uid(), heistId, crew: crewIds, startedAt: now, endsAt, chance })
  feed(s, memberById(c, crewIds[0]), `Crew's rolling out for the ${h.name}. See you in ${h.hours}h, ${s.bossName}.`, 'heist')
  toast(s, `${h.name} is underway. Come back in ${h.hours}h. Success chance ${Math.round(chance * 100)}%.`, 'info')
  return s
}

export function collectHeist(state, runId) {
  const s = clone(state)
  const c = s.clan
  const run = c.heists.find((x) => x.id === runId)
  if (!run || run.endsAt > Date.now()) return state
  const h = HEISTS.find((x) => x.id === run.heistId)
  c.heists = c.heists.filter((x) => x.id !== runId)
  const crew = run.crew.map((id) => memberById(c, id)).filter(Boolean)
  const ok = Math.random() < run.chance
  let msg
  if (ok) {
    s.cash += h.reward.cash
    s.stats.cashEarned += h.reward.cash
    if (h.reward.gold) s.gold += h.reward.gold
    addClanXp(s, h.reward.xp)
    for (const m of crew) m.loyalty = Math.min(100, m.loyalty + 6)
    msg = `${h.name} SUCCEEDED! +${money(h.reward.cash)}${h.reward.gold ? `, +${h.reward.gold} Gold` : ''}, +${h.reward.xp} family XP.`
    feed(s, crew[0], `We did it, ${s.bossName}! The ${h.name} went off without a hitch.`, 'heist')
    toast(s, msg, 'level')
  } else {
    const caught = pick(crew)
    if (caught) { caught.busyUntil = Date.now() + 6 * H; caught.loyalty = Math.max(0, caught.loyalty - 10) }
    for (const m of crew) m.loyalty = Math.max(0, m.loyalty - 4)
    msg = `${h.name} FAILED. The prep money is gone${caught ? ` and ${caught.name} is lying low for 6 hours` : ''}.`
    feed(s, caught, 'It was a setup, boss. Cops everywhere.', 'heist')
    toast(s, msg, 'error')
  }
  c.heistLog.unshift({ t: Date.now(), name: h.name, ok })
  c.heistLog = c.heistLog.slice(0, 10)
  log(s, msg, ok ? 'win' : 'loss')
  return s
}

// ---------- contracts ----------
function ensureContracts(s) {
  const c = s.clan
  const day = dayKey()
  if (c.contracts?.day === day) return
  const pool = [...CONTRACTS]
  const lvl = clanLevel(c).level
  const list = []
  while (list.length < 3 && pool.length) {
    const k = pool.splice(Math.floor(Math.random() * pool.length), 1)[0]
    const target = k.money ? Math.round(k.base * (1 + s.level * 0.4)) : Math.round(k.base * (1 + (lvl - 1) * 0.15))
    list.push({ id: k.id, target, progress: 0, claimed: false })
  }
  c.contracts = { day, list }
}
export function contractsView(s) { ensureContracts(s); return s.clan.contracts }
export const contractReward = (s) => ({ gold: 2, treasury: 1000 * s.level, xp: 150 })

function clanEventIn(s, event, amount = 1) {
  if (!s.clan) return
  ensureContracts(s)
  for (const k of s.clan.contracts.list) {
    const def = CONTRACTS.find((x) => x.id === k.id)
    if (def.event === event && !k.claimed) k.progress = Math.min(k.target, k.progress + amount)
  }
}
/** Called by the main engine when you do things (jobs, fights, World Enemy hits, boss hits). */
export function clanEvent(s, event, amount = 1) {
  if (!s.clan) return
  clanEventIn(s, event, amount)
  if (event === 'fight') warPoints(s, 3)
  if (event === 'world' || event === 'boss') warPoints(s, 1)
}

export function claimContract(state, id) {
  const s = clone(state)
  ensureContracts(s)
  const k = s.clan.contracts.list.find((x) => x.id === id)
  if (!k || k.claimed || k.progress < k.target) return state
  k.claimed = true
  const r = contractReward(s)
  s.gold += r.gold
  s.clan.treasury += r.treasury
  addClanXp(s, r.xp)
  toast(s, `Contract done: +${r.gold} Gold, +${money(r.treasury)} treasury, +${r.xp} family XP.`, 'level')
  return s
}

// ---------- hourly simulation (called from tick) ----------
export function memberIncome(m) { return m.spec === 'earner' ? m.skill * (m.level + 5) * 14 : 0 }
export function clanIncomePerHour(s) {
  const c = s.clan
  const perks = derive(s).perks
  const members = c.members.reduce((t, m) => t + memberIncome(m), 0) * (1 + (perks.treasuryIncome || 0))
  const turf = heldDistricts(c).reduce((t, id) => t + TURF.incomePerLevel * Math.max(1, DISTRICTS.find((d) => d.id === id).level), 0)
  const wages = c.members.reduce((t, m) => t + m.wage, 0) / CLAN.wageHoursPerDay
  return { members: Math.round(members), turf, wages: Math.round(wages), net: Math.round(members + turf - wages) }
}

export function clanTick(s, now, dt) {
  const c = s.clan
  if (!c) return
  ensureContracts(s)
  if (dt <= 0) return
  const hours = dt / 3600
  const inc = clanIncomePerHour(s)
  c.treasury += (inc.members + inc.turf) * hours
  // Wages: paid from the treasury; unpaid members lose loyalty and may walk out
  const owed = inc.wages * hours
  if (c.treasury >= owed) {
    c.treasury -= owed
    for (const m of c.members) if (m.loyalty < 70) m.loyalty = Math.min(70, m.loyalty + 0.5 * hours)
  } else {
    c.treasury = 0
    for (const m of c.members) m.loyalty = Math.max(0, m.loyalty - CLAN.loyaltyLossPerHourUnpaid * hours)
    if (Math.random() < hours * 0.3 && c.members.length) feed(s, pick(c.members), pick(CHATTER.unpaid).replace('{boss}', s.bossName), 'warn')
  }
  for (const m of [...c.members]) {
    if (m.loyalty < CLAN.leaveBelowLoyalty && m.busyUntil < now) {
      c.members = c.members.filter((x) => x.id !== m.id)
      for (const r of Object.keys(c.roles)) if (c.roles[r] === m.id) delete c.roles[r]
      feed(s, null, `${m.name} walked out on ${c.name}. Unpaid and unloved.`, 'leave')
      log(s, `${m.name} left your family over unpaid wages.`, 'loss')
    }
  }
  // Members rise through the ranks while they serve
  for (const m of c.members) {
    if (m.level >= s.level + 2) { m.xpHours = 0; continue }
    m.xpHours = (m.xpHours || 0) + hours
    while (m.xpHours >= MEMBER_LEVEL_HOURS && m.level < s.level + 2) {
      m.xpHours -= MEMBER_LEVEL_HOURS
      const before = memberRank(m)
      m.level++
      m.wage = Math.round(m.skill * (m.level + 4) * 25)
      if (memberRank(m) > before) feed(s, null, `${m.name} was promoted to ${memberRankTitle(m)} in ${getFaction(m.faction).name}.`, 'system')
    }
  }
  // Strategists train the family
  const strat = c.members.filter((m) => m.spec === 'strategist').reduce((t, m) => t + m.skill, 0)
  if (strat) addClanXp(s, strat * 4 * hours)
  // Turf: enforcers hold ground, rivals push back
  const enf = c.members.filter((m) => m.spec === 'enforcer').reduce((t, m) => t + m.skill, 0) * clanPower(s)
  for (const d of DISTRICTS) {
    const t = c.turf[d.id]
    if (!t || t.control <= 0) continue
    const rival = RIVAL_CLANS.find((r) => r.id === t.rival)
    t.control = clamp(t.control + (enf * 0.12 - TURF.rivalPushPerHour * rival.power) * hours, 0, 100)
  }
  // War scoring and result
  const w = c.war
  if (w && !w.result) {
    const end = Math.min(now, w.endsAt)
    const wh = Math.max(0, (end - w.lastTick) / H)
    const rival = RIVAL_CLANS.find((r) => r.id === w.rival)
    w.us += enf * 0.5 * wh
    w.them += rival.power * (3 + clanLevel(c).level * 1.0) * rand(0.6, 1.4) * wh
    w.lastTick = end
    if (now >= w.endsAt) settleWar(s)
  }
  // Recruits refresh
  if (now - c.recruitsAt > CLAN.recruitRefreshHours * H) refreshRecruitsIn(s)
  // Chatter
  if (c.members.length && now - c.feedAt > CLAN.feedEveryMinutes * 60000) {
    c.feedAt = now
    const m = pick(c.members)
    const line = pick(CHATTER[m.spec]).replace('{boss}', s.bossName).replace('{district}', pick(DISTRICTS).name)
    feed(s, m, line, 'chat')
  }
}

function settleWar(s) {
  const c = s.clan
  const w = c.war
  const rival = RIVAL_CLANS.find((r) => r.id === w.rival)
  w.us = Math.round(w.us); w.them = Math.round(w.them)
  c.truce[w.rival] = Date.now() + WAR.truceHours * H
  if (w.us > w.them) {
    const spoils = Math.round(20000 * clanLevel(c).level * (1 + WAR.winTreasuryPct))
    c.treasury += spoils
    s.gold += WAR.winGold
    addClanXp(s, WAR.winXp)
    c.warsWon++
    w.result = { won: true, spoils }
    feed(s, null, `VICTORY! ${c.name} crushed ${rival.name} ${w.us} to ${w.them}. Spoils: ${money(spoils)}.`, 'war')
    log(s, `Your family won the war against ${rival.name} (${w.us}–${w.them}). +${WAR.winGold} Gold, ${money(spoils)} to the treasury.`, 'level')
  } else {
    c.warsLost++
    w.result = { won: false, spoils: 0 }
    for (const m of c.members) m.loyalty = Math.max(0, m.loyalty - 5)
    feed(s, null, `Defeat. ${rival.name} beat ${c.name} ${w.them} to ${w.us}.`, 'war')
    log(s, `Your family lost the war against ${rival.name} (${w.us}–${w.them}).`, 'loss')
  }
  s.unread++
}

export function clanFactionColor(m) { return getFaction(m.faction).accent }

export function clanBadge(s) {
  const c = s.clan
  if (!c) return 0
  const now = Date.now()
  const heists = c.heists.filter((h) => h.endsAt <= now).length
  const contracts = (c.contracts?.list || []).filter((k) => !k.claimed && k.progress >= k.target).length
  const war = c.war?.result ? 1 : 0
  return heists + contracts + war
}

export function nextMemberLevelIn(m) { return Math.max(0, MEMBER_LEVEL_HOURS - (m.xpHours || 0)) }
