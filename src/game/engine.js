// Pure game logic. Every action takes a state, returns a new state (never mutates input).
import { FACTIONS, getFaction, rankIndexForLevel, RIVAL_NAMES, weaponName } from '../data/factions.js'
import {
  ITEMS, getItem, SIG_TIERS, JOBS, DISTRICTS, PROPERTIES, CONTRABAND, COLLECTIONS, MASTERY_REWARD, getContraband,
} from '../data/content.js'

export const SAVE_KEY = 'syndicate-city-save-v1'
export const SAVE_VERSION = 1
export const MAX_FAMILY = 500
export const BASE = { attack: 5, defense: 5, health: 100, energy: 100, stamina: 10 }
export const REGEN = { energy: { secs: 180, amt: 1 }, stamina: { secs: 300, amt: 1 }, health: { secs: 180, amt: 2 } }
export const HOSPITAL_THRESHOLD = 20
export const GOLD_PRICES = { energy: 10, stamina: 10, crate: 15 }
const INCOME_CAP_HOURS = 24

// ---------- helpers ----------
const rand = (a, b) => a + Math.random() * (b - a)
const randInt = (a, b) => Math.floor(rand(a, b + 1))
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const clone = (s) => structuredClone(s)
export const fmt = (n) => Math.floor(n).toLocaleString('en-US')
export const money = (n) => '$' + fmt(n)

// ---- Balance knobs (tune with `npm run sim`) ----
export const BALANCE = {
  xpBase: 30, xpExp: 1.35, // XP to next level = floor(xpBase * L^xpExp). GDD original: 50 * L^1.65
  pvpXpBase: 4, pvpXpPerLevel: 1, // XP per PvP win. GDD original: 10 + 2 * level
  rivalGearAtk: [1, 4.2, 0.68], rivalGearDef: [1, 4, 0.68], // rival per-crew-member gear: a + b * level^c
  rivalMult: [0.8, 1.2], // rival strength spread
  raidEverySecs: 1500, // average seconds between rival raids while playing
  raidMaxOffline: 2,
  promotionGoldPerRank: 5, // Gold on promotion = 5 x new rank number (not in GDD; makes Mk. X reachable without buying Gold)
  collectionGold: 5,
}
export const xpForNext = (level) => Math.floor(BALANCE.xpBase * Math.pow(level, BALANCE.xpExp))

function log(s, text, kind = 'info') {
  s.log.unshift({ id: Date.now() + Math.random(), t: Date.now(), text, kind })
  s.log = s.log.slice(0, 60)
}
function toast(s, text, kind = 'info') {
  s.toast = { id: Date.now() + Math.random(), text, kind }
}

// ---------- state ----------
export function newGame(bossName, factionId) {
  const s = {
    version: SAVE_VERSION,
    bossName: bossName.trim() || 'Nameless Boss',
    factionId,
    createdAt: Date.now(),
    lastTick: Date.now(),
    level: 1,
    xp: 0,
    cash: 500,
    bank: 0,
    gold: 10,
    skillPoints: 0,
    spent: { attack: 0, defense: 0, maxHealth: 0, maxEnergy: 0, maxStamina: 0 },
    bonus: { attack: 0, defense: 0, maxHealth: 0, maxEnergy: 0, maxStamina: 0 },
    energy: BASE.energy,
    stamina: BASE.stamina,
    health: BASE.health,
    regen: { energy: 0, stamina: 0, health: 0 },
    family: 1,
    sigTier: 1,
    inventory: {},
    contraband: {},
    properties: {},
    pendingIncome: 0,
    mastery: {},
    collections: {},
    rivals: [],
    rivalsRefreshedAt: 0,
    leaderboard: [],
    stats: { jobs: 0, fightsWon: 0, fightsLost: 0, defendedWon: 0, defendedLost: 0, cashEarned: 0 },
    log: [],
    unread: 0,
    promotion: null,
    toast: null,
  }
  s.leaderboard = makeLeaderboard()
  s.rivals = makeRivals(s)
  s.rivalsRefreshedAt = Date.now()
  const f = getFaction(factionId)
  log(s, `${f.mentor}: "Welcome to ${f.name}, ${s.bossName}. Start small. Work the Docks, keep your cash in the bank, and nobody touches you."`, 'mentor')
  return s
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw)
    if (!s || s.version !== SAVE_VERSION || !s.factionId) return null
    s.toast = null
    return s
  } catch {
    return null
  }
}

export function saveGame(s) {
  try {
    const { toast: _t, ...rest } = s
    localStorage.setItem(SAVE_KEY, JSON.stringify(rest))
  } catch { /* storage unavailable — play continues unsaved */ }
}

export function clearSave() {
  try { localStorage.removeItem(SAVE_KEY) } catch { /* ignore */ }
}

// ---------- derived stats ----------
export function rankOf(s) { return rankIndexForLevel(s.level) }
export function perksOf(s) { return getFaction(s.factionId).ranks[rankOf(s)].perks }

export function derive(s) {
  const pk = perksOf(s)
  const g = (k) => pk[k] || 0
  const sig = SIG_TIERS[s.sigTier - 1]
  const maxHealth = Math.floor((BASE.health + s.spent.maxHealth * 10 + s.bonus.maxHealth) * (1 + g('maxHealth')))
  const maxEnergy = BASE.energy + s.spent.maxEnergy * 5 + s.bonus.maxEnergy
  const maxStamina = BASE.stamina + s.spent.maxStamina + s.bonus.maxStamina
  const attack = BASE.attack + s.spent.attack + s.bonus.attack
  const defense = BASE.defense + s.spent.defense + s.bonus.defense
  const intervals = {
    energy: REGEN.energy.secs / (1 + g('energyRegen')),
    stamina: REGEN.stamina.secs / (1 + g('staminaRegen')),
    health: REGEN.health.secs / (1 + g('healthRegen')),
  }
  const bankFee = pk.bankFee ?? 0.10
  const crit = sig.crit + g('crit')
  const pen = sig.pen
  const grossIncome = PROPERTIES.reduce((t, p) => t + (s.properties[p.id] || 0) * p.income, 0) * (1 + g('propertyIncome'))
  const upkeep = ITEMS.reduce((t, i) => t + (s.inventory[i.id] || 0) * i.upkeep, 0)
  const power = combatPower(s, { attack, defense, sig, pk })
  return {
    perks: pk, rank: rankOf(s), sig, maxHealth, maxEnergy, maxStamina, attack, defense, intervals, bankFee,
    crit, pen, grossIncome, upkeep, netIncome: grossIncome - upkeep, ...power,
  }
}

// Take the top `n` owned items of a category, sorted by `key`, expanding counts.
function topItems(s, category, n, key) {
  if (n <= 0) return []
  const owned = ITEMS.filter((i) => i.category === category && (s.inventory[i.id] || 0) > 0)
    .sort((a, b) => b[key] - a[key])
  const out = []
  for (const item of owned) {
    const take = Math.min(s.inventory[item.id], n - out.length)
    for (let k = 0; k < take; k++) out.push(item)
    if (out.length >= n) break
  }
  return out
}

// GDD §5 — Family Size & Arsenal Rule + combat formulas.
function combatPower(s, { attack, defense, sig, pk }) {
  const N = s.family
  const wB = pk.weapon || 0, vB = pk.vehicle || 0, aB = pk.attack || 0, dB = pk.defense || 0
  const wA = topItems(s, 'weapon', N - 1, 'atk'), wD = topItems(s, 'weapon', N - 1, 'def')
  const arA = topItems(s, 'armor', N, 'atk'), arD = topItems(s, 'armor', N, 'def')
  const vA = topItems(s, 'vehicle', N, 'atk'), vD = topItems(s, 'vehicle', N, 'def')
  const sum = (arr, k, m = 0) => arr.reduce((t, i) => t + i[k] * (1 + m), 0)
  const pAtk = (attack * 1.5 + sig.atk + sum(wA, 'atk', wB) + sum(arA, 'atk') + sum(vA, 'atk', vB)) * (1 + aB)
  const pDef = (defense * 1.5 + sig.def + sum(wD, 'def') + sum(arD, 'def') + sum(vD, 'def', vB)) * (1 + dB)
  const equipped = { weapons: wA.length, armor: arA.length, vehicles: vA.length }
  return { pAtk: Math.round(pAtk), pDef: Math.round(pDef), equipped }
}

// ---------- timer tick ----------
export function tick(state, now = Date.now()) {
  const dt = Math.max(0, (now - state.lastTick) / 1000)
  if (dt < 0.25) return state
  const s = clone(state)
  s.lastTick = now
  const d = derive(s)
  const max = { energy: d.maxEnergy, stamina: d.maxStamina, health: d.maxHealth }
  for (const m of ['energy', 'stamina', 'health']) {
    if (s[m] >= max[m]) { s.regen[m] = 0; continue }
    s.regen[m] += dt
    const iv = d.intervals[m]
    if (s.regen[m] >= iv) {
      const steps = Math.floor(s.regen[m] / iv)
      s[m] = Math.min(max[m], s[m] + steps * REGEN[m].amt)
      s.regen[m] -= steps * iv
    }
    if (s[m] >= max[m]) s.regen[m] = 0
  }
  // Passive property income (net of item upkeep), capped so idle players don't overflow.
  const cap = Math.max(0, d.grossIncome * INCOME_CAP_HOURS)
  s.pendingIncome = clamp(s.pendingIncome + (d.netIncome * dt) / 3600, 0, cap)

  // Asynchronous rival raids on unbanked cash.
  const raids = dt > 5
    ? Math.min(BALANCE.raidMaxOffline, Math.floor((dt / BALANCE.raidEverySecs) * Math.random() * 2))
    : (Math.random() < dt / BALANCE.raidEverySecs ? 1 : 0)
  for (let i = 0; i < raids; i++) incomingRaid(s, d)

  // Refresh the rival board every 10 minutes.
  if (now - s.rivalsRefreshedAt > 10 * 60 * 1000) { s.rivals = makeRivals(s); s.rivalsRefreshedAt = now }
  return s
}

function incomingRaid(s, d) {
  if (s.health < HOSPITAL_THRESHOLD || s.level < 2) return
  const r = makeRival(s, BALANCE.rivalMult[0] - 0.1, BALANCE.rivalMult[1] - 0.1)
  const theirAtk = r.atk * rand(0.85, 1.15)
  const myDef = d.pDef * rand(0.85, 1.15)
  const f = getFaction(r.factionId)
  if (theirAtk > myDef) {
    const stolen = Math.floor(s.cash * rand(0.10, 0.15))
    const dmg = randInt(15, 30)
    s.cash -= stolen
    s.health = Math.max(0, s.health - dmg)
    s.stats.defendedLost++
    log(s, `${r.name} (${f.name}) raided you and stole ${money(stolen)} unbanked cash. You took ${dmg} damage.`, 'loss')
  } else {
    const dmg = randInt(5, 10)
    s.health = Math.max(0, s.health - dmg)
    s.stats.defendedWon++
    log(s, `Your crew repelled an attack from ${r.name} (${f.name}). You took ${dmg} damage.`, 'win')
  }
  s.unread++
}

// ---------- leveling ----------
function gainXp(s, amount) {
  s.xp += amount
  const startRank = rankOf(s)
  let leveled = false
  while (s.xp >= xpForNext(s.level)) {
    s.xp -= xpForNext(s.level)
    levelUp(s)
    leveled = true
  }
  if (leveled) afterLevel(s, startRank)
}

function levelUp(s) {
  s.level++
  s.gold += 2
  s.skillPoints += 5
}

function afterLevel(s, startRank) {
  const d = derive(s)
  s.energy = Math.max(s.energy, d.maxEnergy)
  s.stamina = Math.max(s.stamina, d.maxStamina)
  s.health = Math.max(s.health, d.maxHealth)
  s.regen = { energy: 0, stamina: 0, health: 0 }
  s.rivals = makeRivals(s)
  s.rivalsRefreshedAt = Date.now()
  const newRank = rankOf(s)
  log(s, `Level up! You reached Level ${s.level}. +2 Gold Bars, +5 Skill Points, meters refilled.`, 'level')
  if (newRank > startRank) {
    let bonus = 0
    for (let r = startRank + 1; r <= newRank; r++) bonus += BALANCE.promotionGoldPerRank * (r + 1)
    s.gold += bonus
    s.promotion = { from: startRank, to: newRank, gold: bonus }
    const f = getFaction(s.factionId)
    log(s, `RANK PROMOTION: You are now ${f.ranks[newRank].title} of ${f.name}. +${bonus} Gold Bars.`, 'level')
  }
  toast(s, `Level ${s.level}!`, 'level')
}

// ---------- actions ----------
export function districtUnlocked(s, districtId) {
  const d = DISTRICTS.find((x) => x.id === districtId)
  return s.level >= d.level
}

export function jobBlockers(s, job) {
  const out = []
  if (!districtUnlocked(s, job.district)) out.push(`Unlocks at Level ${DISTRICTS.find((d) => d.id === job.district).level}`)
  if (job.req.family && s.family < job.req.family) out.push(`Family Size ${job.req.family}+`)
  for (const [id, qty] of Object.entries(job.req.items || {})) {
    if ((s.inventory[id] || 0) < qty) out.push(`${qty}x ${getItem(id).name}`)
  }
  return out
}

export function doJob(state, jobId) {
  const job = JOBS.find((j) => j.id === jobId)
  if (!job) return state
  const s = clone(state)
  if (jobBlockers(s, job).length) { toast(s, 'Requirements not met.', 'error'); return s }
  if (s.energy < job.energy) { toast(s, 'Not enough Energy.', 'error'); return s }
  const pk = perksOf(s)
  s.energy -= job.energy
  const cash = Math.floor(randInt(job.cashMin, job.cashMax) * (1 + (pk.jobCash || 0)))
  const xp = Math.round(job.xp * (1 + (pk.jobXp || 0)))
  s.cash += cash
  s.stats.cashEarned += cash
  s.stats.jobs++
  const parts = [`+${money(cash)}`, `+${xp} XP`]

  // Loot
  for (const drop of job.drops) {
    if (Math.random() < drop.chance * (1 + (pk.loot || 0))) {
      if (drop.kind === 'item') {
        s.inventory[drop.id] = (s.inventory[drop.id] || 0) + 1
        parts.push(`Loot: ${getItem(drop.id).name}`)
      } else {
        s.contraband[drop.id] = (s.contraband[drop.id] || 0) + 1
        parts.push(`Contraband: ${getContraband(drop.id).name}`)
      }
    }
  }

  // Mastery
  const m = s.mastery[job.id] || { pct: 0, star: 0 }
  if (m.star < 3) {
    m.pct += randInt(5, 10)
    if (m.pct >= 100) {
      m.star++
      m.pct = m.star >= 3 ? 100 : 0
      const rw = MASTERY_REWARD[job.mastery]
      for (const [k, v] of Object.entries(rw)) if (k !== 'text') s.bonus[k] += v
      s.gold += 3
      const star = ['', 'Bronze', 'Silver', 'Gold'][m.star]
      parts.push(`${star} Mastery! +3 Gold, ${rw.text}`)
      log(s, `${star} Mastery earned on "${job.name}". +3 Gold Bars, ${rw.text}.`, 'win')
    }
  }
  s.mastery[job.id] = m
  toast(s, `${job.name}: ${parts.join(' · ')}`, 'win')
  gainXp(s, xp)
  return s
}

export function hireCost(s, size = s.family) {
  const disc = perksOf(s).crewCost || 0
  return Math.floor(250 * Math.pow(size, 1.25) * (1 - disc))
}

export function hireCrew(state, count) {
  const s = clone(state)
  let hired = 0, spent = 0
  for (let i = 0; i < count && s.family < MAX_FAMILY; i++) {
    const c = hireCost(s)
    if (s.cash < c) break
    s.cash -= c
    spent += c
    s.family++
    hired++
  }
  if (hired) toast(s, `Recruited ${hired} crew for ${money(spent)}. Family Size: ${s.family}.`, 'win')
  else toast(s, s.family >= MAX_FAMILY ? 'Your Family is at full strength.' : 'Not enough cash on hand.', 'error')
  return s
}

export function spendSkill(state, stat) {
  const cost = stat === 'maxStamina' ? 2 : 1
  if (state.skillPoints < cost) return state
  const s = clone(state)
  s.skillPoints -= cost
  s.spent[stat]++
  if (stat === 'maxEnergy') s.energy += 5
  if (stat === 'maxStamina') s.stamina += 1
  if (stat === 'maxHealth') s.health += 10
  return s
}

export function deposit(state, amount) {
  const s = clone(state)
  const amt = Math.min(Math.floor(amount), s.cash)
  if (amt <= 0) return state
  const fee = Math.ceil(amt * derive(s).bankFee)
  s.cash -= amt
  s.bank += amt - fee
  toast(s, `Laundered ${money(amt)}. Fee ${money(fee)}. ${money(amt - fee)} is now safe in the vault.`, 'info')
  return s
}

export function withdraw(state, amount) {
  const s = clone(state)
  const amt = Math.min(Math.floor(amount), s.bank)
  if (amt <= 0) return state
  s.bank -= amt
  s.cash += amt
  toast(s, `Withdrew ${money(amt)}.`, 'info')
  return s
}

export const propertyPrice = (s, p) => Math.floor(p.cost * Math.pow(1.15, s.properties[p.id] || 0))

export function buyProperty(state, id) {
  const p = PROPERTIES.find((x) => x.id === id)
  const s = clone(state)
  const price = propertyPrice(s, p)
  if (s.level < p.level) { toast(s, `Unlocks at Level ${p.level}.`, 'error'); return s }
  if (s.cash < price) { toast(s, 'Not enough cash on hand.', 'error'); return s }
  s.cash -= price
  s.properties[id] = (s.properties[id] || 0) + 1
  toast(s, `Bought ${p.name} for ${money(price)}.`, 'win')
  return s
}

export function collectIncome(state) {
  if (state.pendingIncome < 1) return state
  const s = clone(state)
  const amt = Math.floor(s.pendingIncome)
  s.cash += amt
  s.stats.cashEarned += amt
  s.pendingIncome -= amt
  toast(s, `Collected ${money(amt)} from your properties.`, 'win')
  return s
}

export function buyItem(state, id, qty = 1) {
  const item = getItem(id)
  const s = clone(state)
  const total = item.price * qty
  if (s.cash < total) { toast(s, 'Not enough cash on hand.', 'error'); return s }
  s.cash -= total
  s.inventory[id] = (s.inventory[id] || 0) + qty
  toast(s, `Bought ${qty}x ${item.name} for ${money(total)}.`, 'win')
  return s
}

export function sellItem(state, id, qty = 1) {
  const item = getItem(id)
  const have = state.inventory[id] || 0
  if (have < qty) return state
  const s = clone(state)
  const total = Math.floor(item.price * 0.5) * qty
  s.inventory[id] = have - qty
  s.cash += total
  toast(s, `Sold ${qty}x ${item.name} for ${money(total)}.`, 'info')
  return s
}

export function upgradeSignature(state) {
  const next = SIG_TIERS[state.sigTier]
  if (!next) return state
  const s = clone(state)
  if (s.level < next.level) { toast(s, `Requires Level ${next.level}.`, 'error'); return s }
  if (s.gold < next.gold) { toast(s, `Requires ${next.gold} Gold Bars.`, 'error'); return s }
  s.gold -= next.gold
  s.sigTier++
  const f = getFaction(s.factionId)
  const before = weaponName(f, s.sigTier - 1), after = weaponName(f, s.sigTier)
  toast(s, `Forged: ${next.prefix} ${after}!`, 'level')
  log(s, before === after ? `Your ${after} was upgraded to ${next.prefix}.` : `Your ${before} was reforged into the ${next.prefix} ${after}.`, 'level')
  return s
}

export function healAtDoctor(state) {
  const s = clone(state)
  const d = derive(s)
  if (s.health >= d.maxHealth) return state
  const cost = s.level * 150
  if (s.cash < cost) { toast(s, `The Street Doctor wants ${money(cost)} cash up front.`, 'error'); return s }
  s.cash -= cost
  s.health = d.maxHealth
  s.regen.health = 0
  toast(s, `Patched up for ${money(cost)}.`, 'info')
  return s
}

export function goldRefill(state, meter) {
  const price = GOLD_PRICES[meter]
  const s = clone(state)
  if (s.gold < price) { toast(s, 'Not enough Gold Bars.', 'error'); return s }
  const d = derive(s)
  s.gold -= price
  if (meter === 'energy') { s.energy = Math.max(s.energy, d.maxEnergy); s.regen.energy = 0 }
  if (meter === 'stamina') { s.stamina = Math.max(s.stamina, d.maxStamina); s.regen.stamina = 0 }
  toast(s, `${meter === 'energy' ? 'Energy' : 'Stamina'} refilled.`, 'info')
  return s
}

export function openCrate(state) {
  const s = clone(state)
  if (s.gold < GOLD_PRICES.crate) { toast(s, 'Not enough Gold Bars.', 'error'); return s }
  s.gold -= GOLD_PRICES.crate
  const got = [pick(CONTRABAND), pick(CONTRABAND)]
  got.forEach((c) => { s.contraband[c.id] = (s.contraband[c.id] || 0) + 1 })
  toast(s, `Crate opened: ${got.map((c) => c.name).join(' + ')}`, 'win')
  return s
}

export function collectionReady(s, col) {
  return col.parts.every((p) => (p.startsWith('item:') ? (s.inventory[p.slice(5)] || 0) : (s.contraband[p] || 0)) > 0)
}

export function vaultCollection(state, id) {
  const col = COLLECTIONS.find((c) => c.id === id)
  if (!collectionReady(state, col)) return state
  const s = clone(state)
  col.parts.forEach((p) => {
    if (p.startsWith('item:')) s.inventory[p.slice(5)]--
    else s.contraband[p]--
  })
  for (const [k, v] of Object.entries(col.reward)) s.bonus[k] += v
  s.collections[id] = (s.collections[id] || 0) + 1
  s.gold += BALANCE.collectionGold
  toast(s, `${col.name} vaulted! ${col.rewardText}, +${BALANCE.collectionGold} Gold`, 'level')
  log(s, `Vaulted the ${col.name}: ${col.rewardText}.`, 'win')
  return s
}

// ---------- rivals & PvP ----------
function sigAtkForLevel(level) {
  let t = SIG_TIERS[0]
  for (const tier of SIG_TIERS) if (level >= tier.level + 3) t = tier
  return t
}

function rivalName(factionId) {
  const pool = RIVAL_NAMES[factionId]
  return Math.random() < 0.4 ? `${pick(pool.first)} ${pick(pool.tag)} ${pick(pool.last)}` : `${pick(pool.first)} ${pick(pool.last)}`
}

// Rival power models a "typical" boss of that level & family size, so gear and crew choices matter.
export function makeRival(s, lo = BALANCE.rivalMult[0], hi = BALANCE.rivalMult[1]) {
  const factionId = pick(FACTIONS).id
  const level = Math.max(1, s.level + randInt(-3, 3))
  const family = clamp(Math.round(s.family * rand(0.6, 1.3)) + randInt(-1, 2), 1, MAX_FAMILY)
  const sig = sigAtkForLevel(level)
  const gear = ([a, b, c]) => a + b * Math.pow(level, c)
  const perMemberAtk = gear(BALANCE.rivalGearAtk)
  const perMemberDef = gear(BALANCE.rivalGearDef)
  const baseStat = 5 + level * 2
  const mult = rand(lo, hi)
  const atk = Math.round((baseStat * 1.5 + sig.atk + (family - 1) * perMemberAtk) * mult)
  const def = Math.round((baseStat * 1.5 + sig.def + (family - 1) * perMemberDef) * mult)
  return {
    id: Math.random().toString(36).slice(2, 9),
    name: rivalName(factionId),
    factionId,
    level,
    family,
    rank: rankIndexForLevel(level),
    atk, def,
    cash: randInt(level * 120, level * 500) + 50,
    health: 100,
  }
}

export function makeRivals(s) {
  return Array.from({ length: 6 }, () => makeRival(s)).sort((a, b) => a.level - b.level)
}

export function refreshRivals(state) {
  const s = clone(state)
  s.rivals = makeRivals(s)
  s.rivalsRefreshedAt = Date.now()
  return s
}

export function attackRival(state, rivalId) {
  const s = clone(state)
  const r = s.rivals.find((x) => x.id === rivalId)
  if (!r) return state
  if (s.stamina < 1) { toast(s, 'Not enough Stamina.', 'error'); return s }
  if (s.health < HOSPITAL_THRESHOLD) { toast(s, 'You are too injured to fight. Visit the Street Doctor.', 'error'); return s }
  if (r.health < HOSPITAL_THRESHOLD) { toast(s, `${r.name} is already in the hospital.`, 'error'); return s }
  const d = derive(s)
  const pk = d.perks
  s.stamina -= 1
  const crit = Math.random() < d.crit
  const finalAtk = d.pAtk * rand(0.85, 1.15) * (crit ? 1.5 : 1)
  const finalDef = r.def * (1 - d.pen) * rand(0.85, 1.15)
  const f = getFaction(r.factionId)
  let msg
  if (finalAtk > finalDef) {
    const pct = rand(0.10, 0.15) * (1 + (pk.pvpCash || 0) + d.sig.cash)
    const stolen = Math.floor(r.cash * pct)
    const xp = BALANCE.pvpXpBase + r.level * BALANCE.pvpXpPerLevel
    const dealt = randInt(15, 30), taken = randInt(5, 12)
    r.cash -= stolen
    r.health = Math.max(0, r.health - dealt)
    s.cash += stolen
    s.stats.cashEarned += stolen
    s.health = Math.max(0, s.health - taken)
    s.stats.fightsWon++
    msg = `${crit ? 'CRITICAL! ' : ''}You beat ${r.name} and took ${money(stolen)}. +${xp} XP, -${taken} HP.`
    // Fight Club exclusive contraband drop
    if (Math.random() < 0.06 * (1 + (pk.loot || 0))) {
      const c = Math.random() < 0.6 ? 'briefcase' : 'firearms'
      s.contraband[c] = (s.contraband[c] || 0) + 1
      msg += ` Found: ${getContraband(c).name}!`
    }
    log(s, msg, 'win')
    toast(s, msg, 'win')
    gainXp(s, xp)
  } else {
    const taken = randInt(20, 35)
    s.health = Math.max(0, s.health - taken)
    r.health = Math.max(0, r.health - randInt(5, 10))
    s.stats.fightsLost++
    msg = `${r.name} of ${f.name} held their ground. You took ${taken} damage.`
    log(s, msg, 'loss')
    toast(s, msg, 'error')
  }
  return s
}

// ---------- leaderboard ----------
export function respectOf(s) {
  const stars = Object.values(s.mastery).reduce((t, m) => t + m.star, 0)
  return s.level * 120 + s.stats.fightsWon * 25 + stars * 40 + s.family * 6 + (s.sigTier - 1) * 80
}

function makeLeaderboard() {
  return Array.from({ length: 40 }, (_, i) => {
    const factionId = pick(FACTIONS).id
    return { name: rivalName(factionId), factionId, respect: Math.round(250 * Math.pow(1.13, i) + randInt(0, 150)) }
  }).sort((a, b) => b.respect - a.respect)
}

export function cityRank(s) {
  const mine = respectOf(s)
  return s.leaderboard.filter((b) => b.respect > mine).length + 1
}

// ---------- dev / test ----------
export function devLevels(state, n = 5) {
  const s = clone(state)
  const startRank = rankOf(s)
  for (let i = 0; i < n; i++) levelUp(s)
  s.xp = 0
  afterLevel(s, startRank)
  return s
}
export function devGold(state, n = 50) {
  const s = clone(state)
  s.gold += n
  toast(s, `+${n} Gold Bars (test)`, 'info')
  return s
}
export function devCash(state, n = 100000) {
  const s = clone(state)
  s.cash += n
  toast(s, `+${money(n)} (test)`, 'info')
  return s
}

export function dismissPromotion(state) { return { ...state, promotion: null } }
export function markRead(state) { return { ...state, unread: 0 } }
