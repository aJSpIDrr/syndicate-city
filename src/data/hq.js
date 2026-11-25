// Headquarters (HQ) and city Turf Wars data. Art lives in public/art/hq and public/art/turf.

// ---- HQ building tiers ----
export const HQ_TIERS = [
  { tier: 1, name: 'Hideout Shack', art: 'tier1', cost: 0, rank: 0, defense: 40, safe: 20000, rooms: 4, gear: 2 },
  { tier: 2, name: 'Brick Warehouse', art: 'tier2', cost: 60000, rank: 1, defense: 160, safe: 120000, rooms: 8, gear: 4 },
  { tier: 3, name: 'Iron Fortress', art: 'tier3', cost: 450000, rank: 3, defense: 550, safe: 700000, rooms: 12, gear: 6 },
  { tier: 4, name: 'Palm Mansion', art: 'tier4', cost: 3000000, rank: 5, defense: 1500, safe: 4000000, rooms: 16, gear: 8 },
  { tier: 5, name: 'Syndicate Castle', art: 'tier5', cost: 20000000, rank: 7, defense: 4000, safe: 25000000, rooms: 20, gear: 10 },
]

// ---- HQ rooms: 20, each up to level 5. `tier` = HQ tier needed to build it.
// effects per level: personal perks (same keys as faction perks), or HQ-only keys:
// hqDef (flat HQ defense), hqDefPct, income ($/hr into the safe), safePct (safe capacity), protect (share of safe raiders can't take)
const room = (id, name, desc, tier, base, effects) => ({ id, name, desc, tier, base, effects })
export const HQ_ROOMS = [
  room('armory', 'Armory', '+3% Attack', 1, 4000, { attack: 0.03 }),
  room('vault', 'Vault Room', '+20% safe size, +6% of the safe protected from raids', 1, 5000, { safePct: 0.2, protect: 0.06 }),
  room('gym', 'Boxing Gym', '+15 Max Health', 1, 3000, { maxHealthFlat: 15 }),
  room('storage', 'Contraband Storage', '+4% loot drop chance', 1, 3500, { loot: 0.04 }),
  room('garage', 'Car Garage', '+4% vehicle stats', 2, 15000, { vehicle: 0.04 }),
  room('cells', 'Holding Cells', '+60 HQ defense', 2, 18000, { hqDef: 60 }),
  room('counting', 'Counting Room', '+$300/hr into the safe, +2% property income', 2, 20000, { income: 300, propertyIncome: 0.02 }),
  room('nightclub', 'Neon Nightclub', '+$500/hr into the safe', 2, 25000, { income: 500 }),
  room('casino', 'Private Casino', '+$1,200/hr into the safe', 3, 90000, { income: 1200 }),
  room('command', 'Command Center', '+5% damage in Turf Wars', 3, 100000, { turfAtk: 0.05 }),
  room('radio', 'Radio Tower', '+6% HQ defense (early warning)', 3, 80000, { hqDefPct: 0.06 }),
  room('lab', 'Research Lab', '+3% job XP', 3, 110000, { jobXp: 0.03 }),
  room('trophy', 'Trophy Hall', '+3% Defense', 4, 600000, { defense: 0.03 }),
  room('yacht', 'Yacht Dock', '+$4,000/hr into the safe', 4, 750000, { income: 4000 }),
  room('fountain', 'Stallion Fountain', '+6% Health regen', 4, 500000, { healthRegen: 0.06 }),
  room('banner', 'War Banner', '+6% defense for city zones you hold', 4, 650000, { turfDef: 0.06 }),
  room('helipad', 'Helipad', '+6% damage in Turf Wars', 5, 4000000, { turfAtk: 0.06 }),
  room('dragon', 'Dragon Shrine', '+1.5% crit chance', 5, 4500000, { crit: 0.015 }),
  room('throne', 'Throne Room', '+2% Attack and Defense', 5, 5000000, { attack: 0.02, defense: 0.02 }),
  room('gates', 'Golden Gates', '+400 HQ defense', 5, 4200000, { hqDef: 400 }),
]
export const ROOM_MAX = 5
export const roomCost = (r, nextLevel) => Math.round(r.base * Math.pow(2, nextLevel - 1))

// ---- Rival HQ raids ----
export const HQ_RAID = { stamina: 2, stealPct: [0.2, 0.3], raidEveryHours: 3, refreshMinutes: 60 }

// ---- City Turf Wars (open to every player, separate from Family turf) ----
// x/y = label position on the map in % (art: public/art/turf/map.jpg)
export const ZONES = [
  { id: 'newyork', name: 'New York', x: 9.6, y: 32.5, level: 1, income: 400, bonus: { jobCash: 0.03 }, bonusText: '+3% job cash' },
  { id: 'bridges', name: 'The Bridges', x: 10.0, y: 60.2, level: 4, income: 700, bonus: { energyRegen: 0.04 }, bonusText: '+4% Energy regen' },
  { id: 'littleitaly', name: 'Little Italy', x: 28.8, y: 25.7, level: 8, income: 1100, bonus: { defense: 0.03 }, bonusText: '+3% Defense' },
  { id: 'slums', name: 'The Slums', x: 48.7, y: 78.5, level: 12, income: 1500, bonus: { crewCost: 0.05 }, bonusText: '-5% crew hire cost' },
  { id: 'chinatown', name: 'Chinatown', x: 30.5, y: 48.6, level: 16, income: 2200, bonus: { loot: 0.06 }, bonusText: '+6% loot chance' },
  { id: 'industrial', name: 'The Industrial Zone', x: 25.7, y: 73.9, level: 20, income: 3000, bonus: { weapon: 0.04 }, bonusText: '+4% weapon stats' },
  { id: 'docks', name: 'The Docks', x: 83.0, y: 45.7, level: 25, income: 4200, bonus: { vehicle: 0.05 }, bonusText: '+5% vehicle stats' },
  { id: 'port', name: 'The Port', x: 75.8, y: 57.7, level: 30, income: 5600, bonus: { propertyIncome: 0.05 }, bonusText: '+5% property income' },
  { id: 'prison', name: 'The Prison', x: 65.1, y: 80.8, level: 36, income: 7000, bonus: { healthRegen: 0.1 }, bonusText: '+10% Health regen' },
  { id: 'downtown', name: 'Downtown', x: 50.1, y: 23.6, level: 42, income: 9500, bonus: { jobXp: 0.04 }, bonusText: '+4% job XP' },
  { id: 'casino', name: 'The Casino', x: 71.6, y: 27.8, level: 50, income: 13000, bonus: { pvpCash: 0.08 }, bonusText: '+8% cash stolen in fights' },
  { id: 'island', name: 'The Island', x: 88.7, y: 84.8, level: 60, income: 18000, bonus: { attack: 0.04 }, bonusText: '+4% Attack' },
  { id: 'mafiahq', name: 'Mafia HQ', x: 51.8, y: 45.7, level: 30, income: 30000, needHeld: 6, bonus: { attack: 0.05, defense: 0.05 }, bonusText: '+5% Attack and Defense', crown: true },
]
export const TURF_WAR = {
  energy: 10, stamina: 1, // per attack
  retakeEveryHours: 4, // a rival tries to take back each held zone about this often
  fortifyBase: 5000, fortifyMax: 5, // fortify level: +12% zone defense each
  incomeCapHours: 24,
}
