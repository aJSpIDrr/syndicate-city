// Family system data. A family is your crime family: AI members, positions, treasury, upgrades,
// turf, wars against rival families, timed heists and daily contracts.

export const CLAN = {
  foundLevel: 5,
  foundCost: 25000,
  baseSlots: 4, // + 1 per 2 family levels + Barracks
  xpToLevel: [0, 400, 1200, 2800, 5500, 9500, 15500, 24000, 36000, 52000], // index = level - 1 (max level 10)
  donationPerXp: 100, // $ donated per family XP
  recruitRefreshHours: 6,
  wageHoursPerDay: 24,
  loyaltyLossPerHourUnpaid: 3,
  leaveBelowLoyalty: 15,
  feedEveryMinutes: 25,
}

export const SPECIALTIES = {
  earner: { name: 'Earner', desc: 'Brings money into the treasury every hour.', color: '#4ADE80' },
  enforcer: { name: 'Enforcer', desc: 'Wins turf and scores points in family wars.', color: '#F87171' },
  smuggler: { name: 'Smuggler', desc: 'Makes heists more likely to succeed.', color: '#60A5FA' },
  strategist: { name: 'Strategist', desc: 'Earns extra family XP and makes every heist a little safer.', color: '#C084FC' },
}

// Positions: one member each. Bonus = per x the member's skill (1–10), applied to you personally.
export const ROLES = [
  { id: 'underboss', name: 'Underboss', desc: 'Attack and Defense', effects: { attack: 0.01, defense: 0.01 } },
  { id: 'consigliere', name: 'Consigliere', desc: 'Job XP and a lower bank fee', effects: { jobXp: 0.01, bankFeeCut: 0.002 } },
  { id: 'capo_rackets', name: 'Capo of Rackets', desc: 'Job cash', effects: { jobCash: 0.015 } },
  { id: 'capo_muscle', name: 'Capo of Muscle', desc: 'Turf pushes and war points', effects: { clanPower: 0.04 } },
  { id: 'treasurer', name: 'Treasurer', desc: 'Treasury income and property income', effects: { treasuryIncome: 0.05, propertyIncome: 0.01 } },
]

// Upgrades bought from the treasury. Max level = family level. Cost = base x growth^level.
export const CLAN_UPGRADES = [
  { id: 'armory', name: 'Armory', desc: '+2% Attack per level', effects: { attack: 0.02 } },
  { id: 'safehouses', name: 'Safehouses', desc: '+2% Defense per level, and raids on you are rarer', effects: { defense: 0.02 } },
  { id: 'fronts', name: 'Front Businesses', desc: '+4% property income per level', effects: { propertyIncome: 0.04 } },
  { id: 'routes', name: 'Smuggling Routes', desc: '+3% job cash per level', effects: { jobCash: 0.03 } },
  { id: 'barracks', name: 'Barracks', desc: '+1 member slot per level', effects: { slots: 1 } },
  { id: 'bribes', name: 'Bribed Officials', desc: '-0.5% bank fee per level', effects: { bankFeeCut: 0.005 } },
]
export const upgradeCost = (level) => Math.round(15000 * Math.pow(2.1, level))

export const RIVAL_CLANS = [
  { id: 'r_vipers', name: 'The Velvet Vipers', tag: 'VV', color: '#22C55E', power: 1.0 },
  { id: 'r_crowns', name: 'Brass Crown Mob', tag: 'BCM', color: '#EAB308', power: 1.15 },
  { id: 'r_ravens', name: 'Midnight Ravens', tag: 'MR', color: '#818CF8', power: 0.9 },
  { id: 'r_saints', name: 'The Fallen Saints', tag: 'FS', color: '#F472B6', power: 1.25 },
  { id: 'r_jackals', name: 'Dust Jackals', tag: 'DJ', color: '#FB923C', power: 1.05 },
]

export const TURF = {
  pushEnergy: 8, // energy per turf push
  holdAt: 60, // control % needed to hold a district
  rivalPushPerHour: 1.5, // rivals claw back control every hour (scaled by their power)
  incomePerLevel: 120, // treasury $/hour per held district, x district unlock level
  jobCashBonus: 0.10, // +10% job cash in districts you hold
}

export const WAR = { hours: 24, costPerLevel: 8000, truceHours: 12, winTreasuryPct: 0.15, winGold: 8, winXp: 600 }

// Heists: timed operations with a crew. difficulty is compared with the crew's matching skills.
export const HEISTS = [
  { id: 'h_jewelry', name: 'Jewelry Store Smash', hours: 1, crew: 2, needs: ['smuggler'], prep: 2000, level: 5, difficulty: 6, reward: { cash: 15000, xp: 150 } },
  { id: 'h_armored', name: 'Armored Car Ambush', hours: 2, crew: 3, needs: ['enforcer', 'smuggler'], prep: 8000, level: 8, difficulty: 11, reward: { cash: 45000, xp: 320, gold: 3 } },
  { id: 'h_casino', name: 'Casino Vault Job', hours: 4, crew: 4, needs: ['smuggler', 'strategist', 'enforcer'], prep: 30000, level: 12, difficulty: 18, reward: { cash: 160000, xp: 700, gold: 6 } },
  { id: 'h_port', name: 'Port Authority Heist', hours: 6, crew: 4, needs: ['smuggler', 'earner', 'enforcer'], prep: 90000, level: 18, difficulty: 24, reward: { cash: 450000, xp: 1200, gold: 10 } },
  { id: 'h_reserve', name: 'Federal Reserve Raid', hours: 8, crew: 5, needs: ['strategist', 'smuggler', 'enforcer', 'earner'], prep: 300000, level: 25, difficulty: 34, reward: { cash: 1500000, xp: 2500, gold: 20 } },
]

// Daily contracts: 3 a day. Your actions add progress.
export const CONTRACTS = [
  { id: 'c_jobs', text: 'Complete {n} jobs', event: 'job', base: 15 },
  { id: 'c_fights', text: 'Win {n} fights', event: 'fight', base: 6 },
  { id: 'c_donate', text: 'Donate {n} to the treasury', event: 'donate', base: 5000, money: true },
  { id: 'c_turf', text: 'Push turf {n} times', event: 'turf', base: 4 },
  { id: 'c_world', text: 'Hit the World Enemy {n} times', event: 'world', base: 5 },
  { id: 'c_boss', text: 'Hit a district boss {n} times', event: 'boss', base: 4 },
]

// Things members say in the family feed. {name} = speaker, {boss} = you, {district} = random district.
export const CHATTER = {
  earner: ['Collections from {district} are in, {boss}. Treasury\'s looking healthy.', 'Found a new laundromat to wash our money through.', 'The numbers racket had a good night.'],
  enforcer: ['A rival crew tried their luck in {district}. They won\'t try again.', 'Say the word and I\'ll lean on whoever you want, {boss}.', 'Our boys are holding the line in {district}.'],
  smuggler: ['Shipment came through {district} clean. No cops.', 'I know a tunnel nobody else knows about.', 'Got a buyer for those crates, {boss}.'],
  strategist: ['Our rivals are stretched thin in {district}. Now\'s the time.', 'I\'ve been studying the vault blueprints. We can do this.', 'Patience, {boss}. The city rewards the careful.'],
  unpaid: ['The treasury\'s dry, {boss}. The boys are getting restless.', 'No pay, no loyalty. Just saying.'],
}

// Crest designer options
export const CREST = {
  shapes: ['shield', 'circle', 'diamond', 'hex'],
  symbols: ['crown', 'skull', 'swords', 'gem', 'flame', 'star', 'spade', 'rose'],
  colors: ['#D4AF37', '#A4161A', '#1D3557', '#007F5F', '#5C5346', '#800F2F', '#111827', '#E5E7EB', '#7C3AED', '#EA580C'],
}
