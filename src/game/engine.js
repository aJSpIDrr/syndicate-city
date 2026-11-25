// Pure game logic. Every action takes a state, returns a new state (never mutates input).
import { FACTIONS, getFaction, rankIndexForLevel, RIVAL_NAMES, weaponName } from '../data/factions.js'
import {
  ITEMS, getItem, SIG_TIERS, JOBS, DISTRICTS, PROPERTIES, CONTRABAND, COLLECTIONS, MASTERY_REWARD, getContraband,
  BOSSES, ACHIEVEMENTS, DAILY_GOLD, ORDER_POOLS, ORDER_COUNT, ORDER_REWARD, ORDER_BONUS, PASSIVE_PERKS, ACTIVE_BOOSTS, perkCost, WORLD, WORLD_ENEMIES,
} from '../data/content.js'
import { clanPerks, clanTick, clanEvent, heldDistricts } from './clan.js'
import { TURF } from '../data/clan.js'

export const SAVE_KEY = 'syndicate-city-save-v1'
export const SAVE_VERSION = 1
export const MAX_FAMILY = 500
export const BASE = { attack: 5, defense: 5, health: 100, energy: 100, stamina: 10 }
export const REGEN = { energy: { secs: 180, amt: 1 }, stamina: { secs: 300, amt: 1 }, health: { secs: 180, amt: 2 } }
export const HOSPITAL_THRESHOLD = 20
export const GOLD_PRICES = { energy: 10, stamina: 10, crate: 15 }
const INCOME_CAP_HOURS = 24

// ---------- helpers ----------
export const rand = (a, b) => a + Math.random() * (b - a)
export const randInt = (a, b) => Math.floor(rand(a, b + 1))
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
export const clone = (s) => structuredClone(s)
export const fmt = (n) => Math.floor(n).toLocaleString('en-US')
export const money = (n) => (n < 0 ? '-$' : '$') + fmt(Math.abs(n))

// ---- Balance knobs (tune with `npm run sim`) ----
export const BALANCE = {
  xpBase: 30, xpExp: 1.35, // XP to next level = floor(xpBase * L^xpExp). GDD original: 50 * L^1.65
  pvpXpBase: 4, pvpXpPerLevel: 1, // XP per PvP win. GDD original: 10 + 2 * level
  rivalGearAtk: [1, 3.75, 0.76], rivalGearDef: [1, 3.55, 0.76], // rival per-crew-member gear: a + b * level^c
  rivalMult: [0.8, 1.2], // rival strength spread
  raidEverySecs: 1500, // average seconds between rival raids while playing
  raidMaxOffline: 2,
  promotionGoldPerRank: 5, // Gold on promotion = 5 x new rank number (not in GDD; makes Mk. X reachable without buying Gold)
  collectionGold: 5,
}
export const xpForNext = (level) => Math.floor(BALANCE.xpBase * Math.pow(level, BALANCE.xpExp))

export function log(s, text, kind = 'info') {
  s.log.unshift({ id: Date.now() + Math.random(), t: Date.now(), text, kind })
  s.log = s.log.slice(0, 60)
}
export function toast(s, text, kind = 'info') {
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
    achievements: {},
    daily: { last: null, streak: 0 },
    bosses: {},
    revenge: [],
    perks: {},
    boosts: {},
    clan: null,
    orders: {},
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
    // Fields added after the first release
    s.achievements ??= {}
    s.daily ??= { last: null, streak: 0 }
    s.bosses ??= {}
    s.revenge ??= []
    s.perks ??= {}
    s.boosts ??= {}
    s.clan ??= null
    s.orders ??= {}
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
export function rankPerksOf(s) { return getFaction(s.factionId).ranks[rankOf(s)].perks }

// All perk bonuses combined: faction rank + purchased passive perks + active boosts.
export function activeBoosts(s, now = Date.now()) {
  return ACTIVE_BOOSTS.filter((b) => (s.boosts?.[b.id] || 0) > now)
}
export function perksOf(s) {
  const out = { ...rankPerksOf(s) }
  const add = (k, v) => { out[k] = (out[k] || 0) + v }
  for (const p of PASSIVE_PERKS) { const lv = s.perks?.[p.id] || 0; if (lv) add(p.key, p.per * lv) }
  for (const b of activeBoosts(s)) for (const [k, v] of Object.entries(b.effects)) add(k, v)
  for (const [k, v] of Object.entries(clanPerks(s))) add(k, v)
  return out
}

export function derive(s) {
  const pk = perksOf(s)
  const g = (k) => pk[k] || 0
  const sig = SIG_TIERS[s.sigTier - 1]
  const maxHealth = Math.floor((BASE.health + s.spent.maxHealth * 10 + s.bonus.maxHealth + g('maxHealthFlat')) * (1 + g('maxHealth')))
  const maxEnergy = BASE.energy + s.spent.maxEnergy * 2 + s.bonus.maxEnergy + g('maxEnergyFlat')
  const maxStamina = BASE.stamina + s.spent.maxStamina + s.bonus.maxStamina + g('maxStaminaFlat')
  const attack = BASE.attack + s.spent.attack + s.bonus.attack
  const defense = BASE.defense + s.spent.defense + s.bonus.defense
  const intervals = {
    energy: REGEN.energy.secs / (1 + g('energyRegen')),
    stamina: REGEN.stamina.secs / (1 + g('staminaRegen')),
    health: REGEN.health.secs / (1 + g('healthRegen')),
  }
  const bankFee = Math.max(0.01, (pk.bankFee ?? 0.10) - g('bankFeeCut'))
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

  worldTick(s, now, dt)
  ensureOrders(s)
  clanTick(s, now, dt)

  // Refresh the rival board every 10 minutes.
  if (now - s.rivalsRefreshedAt > 10 * 60 * 1000) { s.rivals = makeRivals(s); s.rivalsRefreshedAt = now }
  return s
}

function incomingRaid(s, d) {
  if (s.health < HOSPITAL_THRESHOLD || s.level < 2) return
  if (Math.random() < (s.clan?.upgrades?.safehouses || 0) * 0.06) return // Safehouses: raids are rarer
  if (d.perks.raidShield) {
    log(s, 'Your bodyguards turned away a rival crew looking for trouble.', 'win')
    return
  }
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
    // Remember the raider for 24h so the player can take revenge
    s.revenge = [{ ...r, id: 'rv' + r.id, stolen, until: Date.now() + 24 * 3600 * 1000, cash: r.cash + stolen }, ...(s.revenge || [])].slice(0, 5)
    log(s, `${r.name} (${f.name}) raided you and stole ${money(stolen)} unbanked cash. You took ${dmg} damage. Get revenge in the Fight Club.`, 'loss')
  } else {
    const dmg = randInt(5, 10)
    s.health = Math.max(0, s.health - dmg)
    s.stats.defendedWon++
    log(s, `Your crew repelled an attack from ${r.name} (${f.name}). You took ${dmg} damage.`, 'win')
  }
  s.unread++
}

// ---------- leveling ----------
export function gainXp(s, amount) {
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
  if (job.req.family && s.family < job.req.family) out.push(`Crew Size ${job.req.family}+`)
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
  const turfBonus = s.clan && heldDistricts(s.clan).includes(job.district) ? TURF.jobCashBonus : 0
  const cash = Math.floor(randInt(job.cashMin, job.cashMax) * (1 + (pk.jobCash || 0) + turfBonus))
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
  clanEvent(s, 'job')
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
  if (hired) toast(s, `Recruited ${hired} crew for ${money(spent)}. Crew Size: ${s.family}.`, 'win')
  else toast(s, s.family >= MAX_FAMILY ? 'Your crew is at full strength.' : 'Not enough cash on hand.', 'error')
  return s
}

export function spendSkill(state, stat) {
  const cost = stat === 'maxStamina' ? 2 : 1
  if (state.skillPoints < cost) return state
  const s = clone(state)
  s.skillPoints -= cost
  s.spent[stat]++
  if (stat === 'maxEnergy') s.energy += 2
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
  bump(s, 'propsBought')
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
  if (!item || item.unique || item.exclusive) return state
  const s = clone(state)
  const total = item.price * qty
  if (s.cash < total) { toast(s, 'Not enough cash on hand.', 'error'); return s }
  s.cash -= total
  s.inventory[id] = (s.inventory[id] || 0) + qty
  bump(s, 'itemsBought', qty)
  toast(s, `Bought ${qty}x ${item.name} for ${money(total)}.`, 'win')
  return s
}

export function sellItem(state, id, qty = 1) {
  const item = getItem(id)
  const have = state.inventory[id] || 0
  if (have < qty || item.unique || item.exclusive) return state
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

export function rivalName(factionId) {
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
  s.revenge = (s.revenge || []).filter((x) => x.until > Date.now())
  const isRevenge = rivalId.startsWith('rv')
  const r = (isRevenge ? s.revenge : s.rivals).find((x) => x.id === rivalId)
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
    const bonus = isRevenge ? 1.5 : 1
    const pct = rand(0.10, 0.15) * (1 + (pk.pvpCash || 0) + d.sig.cash)
    const stolen = Math.floor(r.cash * pct * bonus)
    const xp = Math.round((BALANCE.pvpXpBase + r.level * BALANCE.pvpXpPerLevel) * bonus)
    const dealt = randInt(15, 30), taken = randInt(5, 12)
    r.cash -= stolen
    r.health = Math.max(0, r.health - dealt)
    s.cash += stolen
    s.stats.cashEarned += stolen
    s.health = Math.max(0, s.health - taken)
    s.stats.fightsWon++
    clanEvent(s, 'fight')
    msg = `${crit ? 'CRITICAL! ' : ''}${isRevenge ? 'REVENGE! ' : ''}You beat ${r.name} and took ${money(stolen)}. +${xp} XP, -${taken} HP.`
    if (isRevenge) s.revenge = s.revenge.filter((x) => x.id !== r.id)
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

// ---------- jobs: repeat ----------
export function doJobRepeat(state, jobId, times = 5) {
  const job = JOBS.find((j) => j.id === jobId)
  let s = state, done = 0, cash = 0, xp = 0
  for (let i = 0; i < times; i++) {
    if (!job || s.energy < job.energy || jobBlockers(s, job).length) break
    const before = { cash: s.cash, xp: s.xp, level: s.level, stats: s.stats.cashEarned }
    s = doJob(s, jobId)
    done++
    cash += s.stats.cashEarned - before.stats
    xp += Math.round(job.xp * (1 + (perksOf(s).jobXp || 0)))
  }
  if (done > 1) { s = clone(s); toast(s, `${job.name} x${done}: +${money(cash)} · +${xp} XP`, 'win') }
  return s
}

// ---------- daily reward ----------
const dayKey = (t = Date.now()) => new Date(t).toLocaleDateString('en-CA')
export function dailyStatus(s) {
  const today = dayKey()
  const yesterday = dayKey(Date.now() - 86400000)
  const ready = s.daily.last !== today
  const streak = !ready ? s.daily.streak : s.daily.last === yesterday ? s.daily.streak + 1 : 1
  const day = (streak - 1) % 7
  return { ready, streak, day, gold: DAILY_GOLD[day], cash: s.level * 150 * (day + 1) }
}
export function claimDaily(state) {
  const st = dailyStatus(state)
  if (!st.ready) return state
  const s = clone(state)
  s.daily = { last: dayKey(), streak: st.streak }
  s.gold += st.gold
  s.cash += st.cash
  toast(s, `Daily tribute, day ${st.streak}: +${st.gold} Gold, +${money(st.cash)}`, 'level')
  log(s, `Collected daily tribute (day ${st.streak}): +${st.gold} Gold Bars, +${money(st.cash)}.`, 'win')
  return s
}

// ---------- achievements ----------
export function achievementProgress(s, a) {
  const v = a.value(s)
  return { value: Math.min(v, a.target), done: v >= a.target, claimed: !!s.achievements[a.id] }
}
export function claimableCount(s) {
  return ACHIEVEMENTS.filter((a) => !s.achievements[a.id] && a.value(s) >= a.target).length + (dailyStatus(s).ready ? 1 : 0) + ordersClaimable(s)
}
export function claimAchievement(state, id) {
  const a = ACHIEVEMENTS.find((x) => x.id === id)
  if (!a || state.achievements[id] || a.value(state) < a.target) return state
  const s = clone(state)
  s.achievements[id] = Date.now()
  s.gold += a.reward.gold || 0
  s.cash += a.reward.cash || 0
  const parts = [a.reward.gold && `+${a.reward.gold} Gold`, a.reward.cash && `+${money(a.reward.cash)}`].filter(Boolean).join(', ')
  toast(s, `Achievement: ${a.title}! ${parts}`, 'level')
  log(s, `Achievement unlocked: ${a.title} (${parts}).`, 'win')
  return s
}

// ---------- district bosses ----------
export function bossUnlocked(s, districtId) {
  return districtUnlocked(s, districtId) && JOBS.filter((j) => j.district === districtId && !j.id.includes('_x')).every((j) => (s.mastery[j.id]?.star || 0) >= 1)
}
export function bossState(s, districtId) {
  return s.bosses[districtId] || { hp: 100, defeated: false }
}
export function bossStats(districtId) {
  const b = BOSSES[districtId]
  const fam = Math.round(3 + b.level * 0.9)
  const sig = sigAtkForLevel(b.level + 3)
  const gear = ([a, c, e]) => a + c * Math.pow(b.level, e)
  const base = (5 + b.level * 2) * 1.5
  return {
    atk: Math.round((base + sig.atk + (fam - 1) * gear(BALANCE.rivalGearAtk)) * 1.15),
    def: Math.round((base + sig.def + (fam - 1) * gear(BALANCE.rivalGearDef)) * 1.15),
    family: fam,
  }
}
export function attackBoss(state, districtId) {
  const b = BOSSES[districtId]
  if (!b || !bossUnlocked(state, districtId)) return state
  const s = clone(state)
  const bs = { ...bossState(s, districtId) }
  if (bs.defeated) return state
  if (s.energy < b.energy) { toast(s, `Need ${b.energy} Energy to hit ${b.name}.`, 'error'); return s }
  if (s.health < HOSPITAL_THRESHOLD) { toast(s, 'You are too injured. Visit the Street Doctor.', 'error'); return s }
  const d = derive(s)
  const st = bossStats(districtId)
  s.energy -= b.energy
  const crit = Math.random() < d.crit
  const ratio = (d.pAtk * (crit ? 1.5 : 1)) / Math.max(1, st.def * (1 - d.pen))
  const dmg = Math.max(1, Math.round(rand(8, 14) * clamp(ratio, 0.3, 1.7) * (1 + (d.perks.worldDamage || 0))))
  const taken = Math.round(rand(4, 9) * clamp(st.atk / Math.max(1, d.pDef), 0.5, 2.2))
  bs.hp = Math.max(0, bs.hp - dmg)
  s.health = Math.max(0, s.health - taken)
  const xp = Math.round(b.energy * 2.2)
  let msg = `${crit ? 'CRITICAL! ' : ''}You hit ${b.name} for ${dmg}% (${bs.hp}% left) and took ${taken} damage. +${xp} XP.`
  if (bs.hp <= 0) {
    bs.defeated = true
    s.gold += b.reward.gold
    s.cash += b.reward.cash
    s.stats.cashEarned += b.reward.cash
    s.inventory[b.reward.item] = (s.inventory[b.reward.item] || 0) + 1
    msg = `${b.name} is finished! +${b.reward.gold} Gold, +${money(b.reward.cash)} and trophy: ${getItem(b.reward.item).name}.`
    log(s, msg, 'level')
    toast(s, msg, 'level')
  } else {
    toast(s, msg, ratio >= 0.8 ? 'win' : 'error')
  }
  s.bosses[districtId] = bs
  bump(s, 'bossHits')
  clanEvent(s, 'boss')
  gainXp(s, xp)
  return s
}

// ---------- save backup codes ----------
const B64_PREFIX = 'SYNDICATE1:'
export function exportSave(s) {
  const { toast: _t, ...rest } = s
  const bytes = new TextEncoder().encode(JSON.stringify(rest))
  let bin = ''
  bytes.forEach((b) => { bin += String.fromCharCode(b) })
  return B64_PREFIX + btoa(bin)
}
export function importSave(code) {
  const raw = String(code || '').trim()
  if (!raw.startsWith(B64_PREFIX)) throw new Error('That is not a Syndicate City backup code.')
  let s
  try {
    const bin = atob(raw.slice(B64_PREFIX.length))
    s = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))))
  } catch {
    throw new Error('The backup code is damaged or incomplete.')
  }
  if (!s || s.version !== SAVE_VERSION || !getFaction(s.factionId) || typeof s.level !== 'number') throw new Error('The backup code is not a valid save.')
  s.achievements ??= {}; s.daily ??= { last: null, streak: 0 }; s.bosses ??= {}; s.revenge ??= []; s.perks ??= {}; s.boosts ??= {}; s.clan ??= null; s.orders ??= {}
  s.lastTick = Date.now()
  s.toast = { id: Date.now(), text: `Welcome back, ${s.bossName}. Save restored.`, kind: 'level' }
  return s
}

// ---------- Gold Exclusives ----------
export function buyExclusive(state, id) {
  const item = getItem(id)
  if (!item || !item.exclusive) return state
  const s = clone(state)
  if (s.level < item.level) { toast(s, `Unlocks at Level ${item.level}.`, 'error'); return s }
  if (s.gold < item.gold) { toast(s, `Needs ${item.gold} Gold Bars.`, 'error'); return s }
  s.gold -= item.gold
  s.inventory[id] = (s.inventory[id] || 0) + 1
  toast(s, `Acquired ${item.name} for ${item.gold} Gold.`, 'level')
  log(s, `Bought the exclusive ${item.name} for ${item.gold} Gold Bars.`, 'win')
  return s
}

// ---------- Perk Shop ----------
export function buyPerk(state, id) {
  const perk = PASSIVE_PERKS.find((p) => p.id === id)
  if (!perk) return state
  const lv = state.perks?.[id] || 0
  if (lv >= perk.max) return state
  const cost = perkCost(perk, lv + 1)
  const s = clone(state)
  if (s.gold < cost) { toast(s, `Needs ${cost} Gold Bars.`, 'error'); return s }
  s.gold -= cost
  s.perks = { ...s.perks, [id]: lv + 1 }
  toast(s, `${perk.name} upgraded to level ${lv + 1}.`, 'level')
  return s
}

export function activateBoost(state, id) {
  const b = ACTIVE_BOOSTS.find((x) => x.id === id)
  if (!b) return state
  const s = clone(state)
  if (s.gold < b.gold) { toast(s, `Needs ${b.gold} Gold Bars.`, 'error'); return s }
  s.gold -= b.gold
  const now = Date.now()
  s.boosts = { ...s.boosts, [id]: Math.max(now, s.boosts?.[id] || 0) + b.minutes * 60000 }
  if (b.heal) { s.health = derive(s).maxHealth; s.regen.health = 0 }
  toast(s, `${b.name} active for ${b.minutes} more minutes.`, 'level')
  log(s, `Activated ${b.name} (${b.gold} Gold).`, 'info')
  return s
}

// ---------- World Enemy (roaming crew) ----------
const H = 3600000
export function worldTemplate(w) { return WORLD_ENEMIES.find((t) => t.id === w?.enemyId) }
export function worldTarget(w) {
  const i = w.members.findIndex((m) => m.hp > 0)
  return i >= 0 ? { kind: 'member', index: i, unit: w.members[i] } : { kind: 'leader', unit: w.leader }
}
export function worldTotals(w) {
  const max = w.members.reduce((t, m) => t + m.max, 0) + w.leader.max
  const left = w.members.reduce((t, m) => t + Math.max(0, m.hp), 0) + Math.max(0, w.leader.hp)
  return { max, left }
}

function spawnWorld(s, now) {
  const t = pick(WORLD_ENEMIES.filter((x) => x.id !== s.world?.enemyId))
  const d = derive(s)
  const p = Math.max(60, d.pAtk) // HP scales with the player so every enemy is a long but fair fight
  const rank = Math.min(8, rankIndexForLevel(s.level) + 1)
  const members = Array.from({ length: t.size }, () => {
    const hp = Math.round(p * rand(6, 8))
    return { name: rivalName(t.faction), rank, hp, max: hp }
  })
  const lhp = Math.round(p * 36)
  const districts = DISTRICTS.map((x) => x.id)
  s.world = {
    enemyId: t.id, faction: t.faction, members, leader: { name: t.leader, rank: 9, hp: lhp, max: lhp },
    def: Math.round(d.pAtk * rand(0.85, 1.0)), atk: Math.round(d.pDef * 1.1),
    location: pick(districts), nextMove: now + WORLD.moveEveryHours * H,
    spawnedAt: now, expiresAt: now + WORLD.lifetimeHours * H,
    damage: 0, npcDamage: 0, defeated: false, escaped: false, cooldownUntil: 0,
  }
  log(s, `WORLD ENEMY: ${t.name} has been spotted in ${DISTRICTS.find((x) => x.id === s.world.location).name}. Every boss in the city is going after them.`, 'level')
  s.unread++
}

function worldTick(s, now, dt) {
  if (s.level < WORLD.unlockLevel) return
  const w = s.world
  if (!w || ((w.defeated || w.escaped) && now >= w.cooldownUntil)) { spawnWorld(s, now); return }
  if (w.defeated || w.escaped) return
  // Other bosses chip away (members first; they never land the final blow on the leader)
  const live = Math.min(dt, Math.max(0, (w.expiresAt - (now - dt * 1000)) / 1000))
  let npc = worldTotals(w).max * WORLD.npcPctPerHour * live / 3600
  w.npcDamage += npc
  for (const m of w.members) { if (npc <= 0) break; const take = Math.min(m.hp, npc); m.hp -= take; npc -= take }
  if (npc > 0) w.leader.hp = Math.max(w.leader.max * 0.05, w.leader.hp - npc)
  // Roam
  while (now >= w.nextMove && now < w.expiresAt) {
    const others = DISTRICTS.filter((x) => x.id !== w.location)
    w.location = pick(others).id
    w.nextMove += WORLD.moveEveryHours * H
  }
  // Escape
  if (now >= w.expiresAt) {
    w.escaped = true
    w.cooldownUntil = now + WORLD.cooldownMinutes * 60000
    log(s, `${worldTemplate(w).name} slipped out of the city before anyone could finish them.`, 'loss')
  }
}

export function worldTurf(s, w) { return !!s.bosses?.[w.location]?.defeated }

export function attackWorld(state) {
  const w0 = state.world
  if (!w0 || w0.defeated || w0.escaped) return state
  const s = clone(state)
  const w = s.world
  const t = worldTemplate(w)
  if (s.stamina < WORLD.stamina) { toast(s, 'Not enough Stamina.', 'error'); return s }
  if (s.energy < WORLD.energy) { toast(s, `Need ${WORLD.energy} Energy.`, 'error'); return s }
  if (s.health < HOSPITAL_THRESHOLD) { toast(s, 'You are too injured. Visit the Street Doctor.', 'error'); return s }
  const d = derive(s)
  s.stamina -= WORLD.stamina
  s.energy -= WORLD.energy
  const crit = Math.random() < d.crit
  const turf = worldTurf(s, w) ? 1 + WORLD.turfBonus : 1
  const ratio = clamp(d.pAtk / Math.max(1, w.def * (1 - d.pen)), 0.5, 1.4)
  const dmg = Math.max(1, Math.round(d.pAtk * rand(0.75, 1.1) * (crit ? 1.5 : 1) * ratio * turf * (1 + (d.perks.worldDamage || 0))))
  const taken = Math.round(rand(3, 8) * clamp(w.atk / Math.max(1, d.pDef), 0.5, 2))
  const target = worldTarget(w)
  target.unit.hp = Math.max(0, target.unit.hp - dmg)
  w.damage += dmg
  bump(s, 'worldHits')
  clanEvent(s, 'world')
  s.health = Math.max(0, s.health - taken)
  let xp = 4 + Math.floor(s.level / 2)
  let msg = `${crit ? 'CRITICAL! ' : ''}You hit ${target.unit.name} for ${fmt(dmg)}${turf > 1 ? ' (home turf)' : ''}. -${taken} HP.`
  if (target.unit.hp <= 0) {
    if (target.kind === 'member') {
      const cash = s.level * 250
      s.cash += cash; s.stats.cashEarned += cash; s.gold += 1; xp += 10 + s.level
      msg = `${target.unit.name} of ${t.name} is down! +${money(cash)}, +1 Gold.`
      log(s, msg, 'win')
      if (w.members.every((m) => m.hp <= 0)) msg += ` ${w.leader.name} has nowhere left to hide.`
    } else {
      const gold = 10 + Math.floor(s.level / 3)
      const cash = s.level * 1500
      s.gold += gold; s.cash += cash; s.stats.cashEarned += cash; xp += 40 + s.level * 2
      s.stats.worldKills = (s.stats.worldKills || 0) + 1
      w.defeated = true
      w.cooldownUntil = Date.now() + WORLD.cooldownMinutes * 60000
      const share = Math.round((w.damage / Math.max(1, w.damage + w.npcDamage)) * 100)
      msg = `You took down ${w.leader.name}! ${t.name} is finished. +${gold} Gold, +${money(cash)}. Your share: ${share}%.`
      if (!(s.inventory[t.trophy] > 0)) {
        s.inventory[t.trophy] = 1
        msg += ` Trophy: ${getItem(t.trophy).name}!`
      }
      log(s, msg, 'level')
    }
    toast(s, msg, target.kind === 'leader' ? 'level' : 'win')
  } else {
    toast(s, msg, 'win')
  }
  gainXp(s, xp)
  return s
}

// ---------- Orders: daily / weekly / monthly ----------
export function bump(s, key, n = 1) { s.stats[key] = (s.stats[key] || 0) + n }
const pad = (n) => String(n).padStart(2, '0')
export function periodKey(kind, t = Date.now()) {
  const d = new Date(t)
  if (kind === 'daily') return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  if (kind === 'monthly') return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
  const day = (d.getDay() + 6) % 7 // Monday = 0
  const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day)
  return `W${mon.getFullYear()}-${pad(mon.getMonth() + 1)}-${pad(mon.getDate())}`
}
export function periodEnds(kind, t = Date.now()) {
  const d = new Date(t)
  if (kind === 'daily') return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime()
  if (kind === 'monthly') return new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime()
  const day = (d.getDay() + 6) % 7
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day + 7).getTime()
}
function ensureOrders(s) {
  s.orders ??= {}
  for (const kind of Object.keys(ORDER_POOLS)) {
    const key = periodKey(kind)
    if (s.orders[kind]?.key === key) continue
    const pool = [...ORDER_POOLS[kind]]
    const list = []
    while (list.length < ORDER_COUNT[kind] && pool.length) {
      const o = pool.splice(Math.floor(Math.random() * pool.length), 1)[0]
      const target = Math.max(1, Math.round(o.base + o.perLevel * s.level))
      list.push({ id: o.id, target, start: s.stats[o.stat] || 0, claimed: false })
    }
    s.orders[kind] = { key, list, bonus: false }
  }
}
export function orderProgress(s, kind, o) {
  const def = ORDER_POOLS[kind].find((x) => x.id === o.id)
  return Math.min(o.target, Math.max(0, (s.stats[def.stat] || 0) - o.start))
}
export function ordersView(state) {
  const s = clone(state)
  ensureOrders(s)
  return s.orders
}
function ordersClaimable(s) {
  let n = 0
  for (const kind of Object.keys(ORDER_POOLS)) {
    const o = s.orders?.[kind]
    if (!o || o.key !== periodKey(kind)) continue
    n += o.list.filter((x) => !x.claimed && orderProgress(s, kind, x) >= x.target).length
  }
  return n
}
export function ordersTick(s) { ensureOrders(s) }
export function claimOrder(state, kind, id) {
  const s = clone(state)
  ensureOrders(s)
  const o = s.orders[kind].list.find((x) => x.id === id)
  if (!o || o.claimed || orderProgress(s, kind, o) < o.target) return state
  o.claimed = true
  const r = ORDER_REWARD[kind](s.level)
  s.gold += r.gold
  s.cash += r.cash
  let msg = `${kind[0].toUpperCase() + kind.slice(1)} order done: +${r.gold} Gold, +${money(r.cash)}.`
  if (!s.orders[kind].bonus && s.orders[kind].list.every((x) => x.claimed)) {
    s.orders[kind].bonus = true
    s.gold += ORDER_BONUS[kind]
    msg += ` All ${kind} orders done: +${ORDER_BONUS[kind]} bonus Gold!`
  }
  toast(s, msg, 'level')
  return s
}
