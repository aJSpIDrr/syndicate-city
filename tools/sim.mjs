// Balance simulator: a greedy bot plays the real engine and reports pacing.
// Usage: node tools/sim.mjs [factionId] [hours] [checkInMinutes]
//   checkInMinutes = how often the bot "opens the game" (default 10). Time passes between check-ins.
import * as E from '../src/game/engine.js'
import { JOBS, ITEMS, PROPERTIES, BOSSES, ACHIEVEMENTS, getItem } from '../src/data/content.js'
import { getFaction } from '../src/data/factions.js'

const factionId = process.argv[2] || 'families'
const hours = Number(process.argv[3] || 72)
const checkIn = Number(process.argv[4] || 10)

const realNow = Date.now
let clock = Date.now()
Date.now = () => clock

let s = E.newGame('Bot', factionId)
const levelAt = {}
const fights = { won: 0, lost: 0 }
const bands = {}
const band = (l) => `${Math.floor((l - 1) / 10) * 10 + 1}-${Math.floor((l - 1) / 10) * 10 + 10}`
let raidsLost = 0
const bossAt = {}

function bestJob() {
  const ok = JOBS.filter((j) => E.jobBlockers(s, j).length === 0)
  // Prefer unmastered jobs a bit (mastery pays gold), otherwise best XP/energy.
  return ok.sort((a, b) => score(b) - score(a))[0]
}
// Strongly prefer jobs without Bronze yet (unlocks the district boss), then unmastered ones.
const score = (j) => { const st = s.mastery[j.id]?.star ?? 0; return (j.xp / j.energy) * (st === 0 ? 3 : st < 3 ? 1.15 : 1) }

function buyForNextJob() {
  // Next locked job in an unlocked district: buy its missing items if affordable.
  for (const j of JOBS) {
    if (!E.districtUnlocked(s, j.district)) continue
    const b = E.jobBlockers(s, j)
    if (!b.length) continue
    if (j.req.family && s.family < j.req.family) continue
    let cost = 0
    for (const [id, q] of Object.entries(j.req.items || {})) cost += Math.max(0, q - (s.inventory[id] || 0)) * getItem(id).price
    if (cost > 0 && cost <= s.cash + s.bank * 0.5) {
      if (s.cash < cost) s = E.withdraw(s, cost - s.cash)
      for (const [id, q] of Object.entries(j.req.items || {})) {
        const need = q - (s.inventory[id] || 0)
        if (need > 0) s = E.buyItem(s, id, need)
      }
      return true
    }
  }
  return false
}

function gearUp() {
  // Fill crew slots with the best affordable item per category, keeping a reserve.
  const d = E.derive(s)
  const slots = { weapon: s.family - 1 - d.equipped.weapons, armor: s.family - d.equipped.armor, vehicle: s.family - d.equipped.vehicles }
  for (const cat of ['weapon', 'armor', 'vehicle']) {
    if (slots[cat] <= 0) continue
    const opts = ITEMS.filter((i) => i.category === cat && !i.unique && !i.exclusive && i.price * 4 < s.cash).sort((a, b) => (b.atk + b.def) - (a.atk + a.def))
    if (opts[0]) s = E.buyItem(s, opts[0].id, Math.min(slots[cat], Math.floor(s.cash / 4 / opts[0].price)) || 1)
  }
}

function buyProperty() {
  const opts = PROPERTIES.filter((p) => s.level >= p.level).map((p) => ({ p, price: E.propertyPrice(s, p) }))
    .filter((o) => o.price <= s.cash * 0.6).sort((a, b) => b.p.income / b.price - a.p.income / a.price)
  if (opts[0]) { s = E.buyProperty(s, opts[0].p.id); return true }
  return false
}

const steps = Math.floor((hours * 60) / checkIn)
for (let step = 0; step < steps; step++) {
  clock += checkIn * 60 * 1000
  const before = s.stats.defendedLost
  s = E.tick(s, clock)
  raidsLost += s.stats.defendedLost - before
  s = E.collectIncome(s)
  if (s.bank > 0) s = E.withdraw(s, s.bank)

  // Skill points: energy-first, then combat
  while (s.skillPoints > 0) {
    const pickStat = ['maxEnergy', 'attack', 'defense', 'maxEnergy', 'attack'][s.skillPoints % 5]
    const before = s.skillPoints
    s = E.spendSkill(s, pickStat === 'maxStamina' && s.skillPoints < 2 ? 'attack' : pickStat)
    if (s.skillPoints === before) break
  }

  // Jobs
  for (let guard = 0; guard < 500; guard++) {
    const j = bestJob()
    if (!j || s.energy < j.energy) break
    const lvl = s.level
    s = E.doJob(s, j.id)
    if (s.level > lvl) for (let L = lvl + 1; L <= s.level; L++) levelAt[L] ??= (clock - s.createdAt) / 3600000
  }

  // Daily reward + achievements
  s = E.claimDaily(s)
  for (const a of ACHIEVEMENTS) s = E.claimAchievement(s, a.id)

  // District bosses (only when the odds are reasonable)
  for (const id of Object.keys(BOSSES)) {
    for (let guard = 0; guard < 30; guard++) {
      if (!E.bossUnlocked(s, id) || E.bossState(s, id).defeated) break
      if (s.health < E.HOSPITAL_THRESHOLD) { s = E.healAtDoctor(s); if (s.health < E.HOSPITAL_THRESHOLD) break }
      const st = E.bossStats(id), d0 = E.derive(s)
      if (d0.pAtk / st.def < 0.7 || s.energy < BOSSES[id].energy) break
      const lvl = s.level
      s = E.attackBoss(s, id)
      if (E.bossState(s, id).defeated) bossAt[id] = { h: (clock - s.createdAt) / 3600000, lvl: s.level }
      if (s.level > lvl) for (let L = lvl + 1; L <= s.level; L++) levelAt[L] ??= (clock - s.createdAt) / 3600000
    }
  }

  // World Enemy first (uses stamina + 5 energy per hit)
  for (let guard = 0; guard < 40; guard++) {
    const w = s.world
    if (!w || w.defeated || w.escaped || s.stamina < 1 || s.energy < 5) break
    if (s.health < E.HOSPITAL_THRESHOLD) { s = E.healAtDoctor(s); if (s.health < E.HOSPITAL_THRESHOLD) break }
    const lvl = s.level
    s = E.attackWorld(s)
    if (s.level > lvl) for (let L = lvl + 1; L <= s.level; L++) levelAt[L] ??= (clock - s.createdAt) / 3600000
  }

  // Fights
  for (let guard = 0; guard < 50 && s.stamina > 0; guard++) {
    if (s.health < E.HOSPITAL_THRESHOLD) { s = E.healAtDoctor(s); if (s.health < E.HOSPITAL_THRESHOLD) break }
    const d = E.derive(s)
    const target = s.rivals.filter((r) => r.health >= E.HOSPITAL_THRESHOLD).sort((a, b) => a.def - b.def)[0]
    if (!target) { s = E.refreshRivals(s); continue }
    const won = s.stats.fightsWon
    const lvl = s.level
    s = E.attackRival(s, target.id)
    const w = s.stats.fightsWon > won
    w ? fights.won++ : fights.lost++
    const bd = (bands[band(lvl)] ??= { won: 0, lost: 0, ratio: [] })
    w ? bd.won++ : bd.lost++
    bd.ratio.push(d.pAtk / target.def)
    if (s.level > lvl) for (let L = lvl + 1; L <= s.level; L++) levelAt[L] ??= (clock - s.createdAt) / 3600000
  }

  // Spend: forge, job items, crew, properties, gear
  while (s.sigTier < 10) { const t = s.sigTier; s = E.upgradeSignature(s); if (s.sigTier === t) break }
  buyForNextJob()
  for (let i = 0; i < 20 && s.cash > E.hireCost(s) * 3; i++) s = E.hireCrew(s, 1)
  for (let i = 0; i < 5 && buyProperty(); i++);
  gearUp()
  if (s.cash > 0) s = E.deposit(s, s.cash)
}

Date.now = realNow
const d = E.derive(s)
const f = getFaction(factionId)
console.log(`\n== ${f.name} · ${hours}h · check-in every ${checkIn}m ==`)
console.log(`Final: Lv ${s.level} (${f.ranks[d.rank].title}), family ${s.family}, sig Mk.${s.sigTier}, atk ${d.pAtk}, def ${d.pDef}`)
console.log(`Cash ${E.money(s.cash)} bank ${E.money(s.bank)} income ${E.money(d.netIncome)}/hr, gold ${s.gold}`)
console.log(`Equipped w/a/v ${d.equipped.weapons}/${d.equipped.armor}/${d.equipped.vehicles}; atk SP ${s.spent.attack}; rival@lv avg def ${Math.round(s.rivals.reduce((t,r)=>t+r.def,0)/s.rivals.length)} fam ${Math.round(s.rivals.reduce((t,r)=>t+r.family,0)/s.rivals.length)}; props ${JSON.stringify(s.properties)}`)
console.log(`Jobs ${s.stats.jobs}, fights ${fights.won}W/${fights.lost}L, raids lost ${raidsLost}`)
const marks = [2, 5, 10, 15, 20, 25, 30, 35, 40, 50].filter((L) => levelAt[L] !== undefined)
console.log('Hours to level:', marks.map((L) => `L${L}=${levelAt[L].toFixed(1)}h`).join('  '))
console.log('PvP by level band:', Object.entries(bands).map(([k, v]) => {
  const avg = v.ratio.reduce((a, b) => a + b, 0) / v.ratio.length
  return `${k}: ${Math.round((v.won / (v.won + v.lost)) * 100)}% win (atk/def ${avg.toFixed(2)})`
}).join('  |  '))
console.log('Bosses:', Object.entries(bossAt).map(([k, v]) => `${k}@${v.h.toFixed(1)}h/L${v.lvl}`).join('  ') || 'none')
if (process.env.DEBUG_BOSS) for (const id of Object.keys(BOSSES)) {
  const st = E.bossStats(id)
  console.log(id, 'unlocked', E.bossUnlocked(s, id), 'state', JSON.stringify(E.bossState(s, id)), 'bossDef', st.def, 'stars', JOBS.filter((j) => j.district === id).map((j) => s.mastery[j.id]?.star || 0).join(','))
}
console.log('World Enemy leaders defeated:', s.stats.worldKills || 0, '· trophies:', Object.keys(s.inventory).filter((k) => k.startsWith('w_')).join(', ') || 'none')
