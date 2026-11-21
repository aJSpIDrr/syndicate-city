// Game content tables (GDD §3, §6). Jobs marked `spec: true` come straight from the GDD;
// the others were added so every district has a short job chain.

export const RARITY = {
  common: { label: 'Common', color: '#9CA3AF' },
  uncommon: { label: 'Uncommon', color: '#34D399' },
  rare: { label: 'Rare', color: '#60A5FA' },
  epic: { label: 'Epic', color: '#C084FC' },
  legendary: { label: 'Legendary', color: '#D4AF37' },
  exclusive: { label: 'Exclusive', color: '#FF4D6D' },
}

// ---- Signature weapon upgrade tiers (Mk. I – Mk. X) ----
export const SIG_TIERS = [
  { tier: 1, prefix: 'Standard Mk. I', gold: 0, level: 1, atk: 25, def: 15, crit: 0, pen: 0, cash: 0 },
  { tier: 2, prefix: 'Modified Mk. II', gold: 5, level: 5, atk: 45, def: 25, crit: 0.02, pen: 0, cash: 0 },
  { tier: 3, prefix: 'Tactical Mk. III', gold: 12, level: 10, atk: 75, def: 40, crit: 0.04, pen: 0, cash: 0 },
  { tier: 4, prefix: 'Custom Engraved Mk. IV', gold: 25, level: 15, atk: 120, def: 65, crit: 0.04, pen: 0.05, cash: 0 },
  { tier: 5, prefix: 'Gold-Plated Mk. V', gold: 45, level: 20, atk: 180, def: 95, crit: 0.04, pen: 0.08, cash: 0.05 },
  { tier: 6, prefix: 'Syndicate Mythic Mk. VI', gold: 75, level: 25, atk: 255, def: 135, crit: 0.07, pen: 0.11, cash: 0.06 },
  { tier: 7, prefix: 'Syndicate Mythic Mk. VII', gold: 105, level: 30, atk: 330, def: 175, crit: 0.10, pen: 0.13, cash: 0.07 },
  { tier: 8, prefix: 'Syndicate Mythic Mk. VIII', gold: 135, level: 35, atk: 405, def: 215, crit: 0.13, pen: 0.15, cash: 0.08 },
  { tier: 9, prefix: 'Syndicate Mythic Mk. IX', gold: 165, level: 40, atk: 480, def: 255, crit: 0.16, pen: 0.18, cash: 0.09 },
  { tier: 10, prefix: 'Syndicate Mythic Mk. X', gold: 195, level: 45, atk: 555, def: 295, crit: 0.20, pen: 0.20, cash: 0.10 },
]

// ---- Black Market Arsenal ----
const it = (id, category, name, rarity, atk, def, price, upkeep) => ({ id, category, name, rarity, atk, def, price, upkeep })
export const ITEMS = [
  it('bat', 'weapon', 'Baseball Bat', 'common', 2, 1, 100, 0),
  it('switchblade', 'weapon', 'Switchblade', 'common', 4, 2, 250, 0),
  it('knuckles', 'weapon', 'Brass Knuckles', 'common', 6, 3, 450, 0),
  it('revolver', 'weapon', '.38 Snub-Nose Revolver', 'uncommon', 10, 5, 900, 0),
  it('shotgun', 'weapon', 'Sawed-Off Shotgun', 'rare', 16, 8, 2400, 5),
  it('pistol45', 'weapon', '.45 Pistol', 'rare', 22, 12, 4800, 10),
  it('molotov', 'weapon', 'Molotov Cocktail', 'rare', 28, 6, 6000, 10),
  it('grenade', 'weapon', 'Grenade', 'epic', 36, 10, 11000, 25),
  it('sniper', 'weapon', 'Sniper Rifle', 'legendary', 48, 25, 24000, 50),
  it('trench', 'armor', 'Trench Coat', 'common', 1, 4, 300, 0),
  it('leather', 'armor', 'Leather Jacket', 'uncommon', 3, 9, 1100, 0),
  it('kevlar', 'armor', 'Kevlar Vest', 'uncommon', 4, 18, 4000, 10),
  it('gasmask', 'armor', 'Gas Mask', 'rare', 6, 24, 6500, 12),
  it('riotshield', 'armor', 'Riot Shield', 'rare', 5, 32, 9500, 20),
  it('limodoor', 'armor', 'Bulletproof Limo Door', 'epic', 8, 42, 15000, 30),
  it('nvg', 'armor', 'Night Vision Goggles', 'epic', 18, 35, 18500, 35),
  it('tacsuit', 'armor', 'Armored Tactical Suit', 'legendary', 22, 55, 32000, 65),
  it('modelt', 'vehicle', 'Model T Ford', 'common', 3, 3, 900, 5),
  it('pickup', 'vehicle', 'Pickup Truck', 'uncommon', 8, 8, 2800, 10),
  it('motorcycle', 'vehicle', 'Motorcycle', 'uncommon', 14, 6, 3600, 12),
  it('musclecar', 'vehicle', 'Muscle Car', 'rare', 20, 14, 7200, 20),
  it('armoredsedan', 'vehicle', 'Armored Sedan', 'epic', 22, 28, 13500, 40),
  it('hearse', 'vehicle', 'Hearse', 'epic', 26, 34, 19000, 50),
  it('speedboat', 'vehicle', 'Speedboat', 'epic', 35, 25, 22000, 60),
  it('helicopter', 'vehicle', 'Attack Helicopter', 'legendary', 55, 50, 65000, 150),
]
export const getItem = (id) => ITEMS.find((i) => i.id === id)

// ---- Contraband & Collections ----
export const CONTRABAND = [
  { id: 'cigarettes', name: 'Cigarette Crate', rarity: 'common' },
  { id: 'alcohol', name: 'Alcohol Shipment', rarity: 'common' },
  { id: 'plates', name: 'Counterfeit Plates', rarity: 'rare' },
  { id: 'jewels', name: 'Stolen Jewels', rarity: 'rare' },
  { id: 'bullion', name: 'Gold Bullion', rarity: 'epic' },
  { id: 'evidence', name: 'Evidence File', rarity: 'uncommon' },
  { id: 'briefcase', name: 'Briefcase of Drugs', rarity: 'rare' },
  { id: 'firearms', name: 'Illegal Firearms Shipment', rarity: 'epic' },
]
export const getContraband = (id) => CONTRABAND.find((c) => c.id === id)

// Collection parts reference contraband ids, or `item:<id>` for arsenal items (consumed on vaulting).
export const COLLECTIONS = [
  { id: 'smuggler', name: "Smuggler's Crate Set", parts: ['cigarettes', 'alcohol', 'plates'], reward: { maxEnergy: 5 }, rewardText: '+5 Max Energy' },
  { id: 'heist', name: 'Heist Vault Set', parts: ['jewels', 'bullion', 'evidence'], reward: { attack: 15 }, rewardText: '+15 Attack' },
  { id: 'blackmarket', name: 'Black Market Arms Set', parts: ['briefcase', 'firearms', 'item:riotshield'], reward: { defense: 15 }, rewardText: '+15 Defense' },
]

// ---- Real Estate ----
export const PROPERTIES = [
  { id: 'newsstand', name: 'Corner Newsstand', cost: 500, income: 25, level: 1 },
  { id: 'laundromat', name: 'Back-Alley Laundromat', cost: 2500, income: 140, level: 3 },
  { id: 'speakeasy', name: 'Underground Speakeasy', cost: 10000, income: 600, level: 6 },
  { id: 'nightclub', name: 'Club Paradise (Nightclub)', cost: 45000, income: 2800, level: 10 },
  { id: 'casino', name: 'Grand Hotel & Casino', cost: 200000, income: 13500, level: 15 },
  { id: 'shipping', name: 'Global Shipping Syndicate', cost: 850000, income: 60000, level: 22 },
]

// ---- Districts & Jobs ----
export const DISTRICTS = [
  { id: 'docks', name: 'The Docks', city: 'New York', level: 1, tint: '#1D3557' },
  { id: 'midtown', name: 'Midtown', city: 'New York', level: 3, tint: '#2B3A55' },
  { id: 'eastend', name: 'East End', city: 'London', level: 6, tint: '#333533' },
  { id: 'downtown', name: 'Downtown', city: 'London', level: 9, tint: '#4A1C1C' },
  { id: 'shinjuku', name: 'Shinjuku', city: 'Tokyo', level: 13, tint: '#3A0D16' },
  { id: 'kowloon', name: 'Kowloon Harbor', city: 'Hong Kong', level: 17, tint: '#00513D' },
  { id: 'jozi', name: 'Jozi', city: 'Johannesburg', level: 22, tint: '#5C5346' },
  { id: 'border', name: 'The Border', city: 'Sinaloa', level: 28, tint: '#5E0B22' },
]

// req: { items: { itemId: qty }, family: n }   drops: [{ kind: 'item'|'contraband', id, chance }]
// mastery: reward granted at each mastery star
const job = (id, district, name, energy, cashMin, cashMax, xp, req, drops, mastery, spec = false) =>
  ({ id, district, name, energy, cashMin, cashMax, xp, req, drops, mastery, spec })

export const JOBS = [
  job('hustle', 'docks', 'Street Corner Hustle', 2, 50, 90, 4, {}, [{ kind: 'item', id: 'knuckles', chance: 0.10 }], 'attack', true),
  job('unload', 'docks', 'Unload a Stolen Shipment', 3, 80, 140, 6, {}, [{ kind: 'contraband', id: 'cigarettes', chance: 0.08 }], 'defense'),
  job('collect', 'docks', 'Collect Protection Money', 4, 120, 200, 8, { items: { bat: 1 } }, [{ kind: 'item', id: 'switchblade', chance: 0.08 }], 'energy'),

  job('smuggle', 'midtown', 'Docks Smuggling Run', 6, 250, 400, 13, { items: { switchblade: 1 } }, [{ kind: 'contraband', id: 'cigarettes', chance: 0.15 }], 'attack', true),
  job('numbers', 'midtown', 'Run the Numbers Racket', 7, 300, 480, 15, { family: 3 }, [{ kind: 'contraband', id: 'alcohol', chance: 0.08 }], 'defense'),
  job('fixfight', 'midtown', 'Fix a Prize Fight', 8, 380, 560, 18, { items: { revolver: 1 } }, [{ kind: 'item', id: 'revolver', chance: 0.06 }], 'energy'),

  job('extort', 'eastend', 'Extort Local Business', 10, 600, 950, 22, { items: { shotgun: 2 } }, [{ kind: 'contraband', id: 'alcohol', chance: 0.15 }], 'attack', true),
  job('pubbrawl', 'eastend', 'Win a Bare-Knuckle Bout', 11, 650, 1000, 24, { family: 5 }, [{ kind: 'item', id: 'leather', chance: 0.08 }], 'defense'),
  job('bookie', 'eastend', 'Rob the Bookmaker', 12, 750, 1150, 27, { items: { leather: 3 } }, [{ kind: 'contraband', id: 'evidence', chance: 0.06 }], 'energy'),

  job('bribe', 'downtown', 'Bribe the City Official', 15, 1100, 1600, 35, { items: { kevlar: 5 } }, [{ kind: 'contraband', id: 'evidence', chance: 0.15 }], 'attack', true),
  job('heistbank', 'downtown', 'Tunnel into a Bank Vault', 16, 1200, 1750, 38, { family: 8 }, [{ kind: 'contraband', id: 'jewels', chance: 0.06 }], 'defense'),
  job('fence', 'downtown', 'Fence Art from a Gallery', 17, 1300, 1900, 41, { items: { musclecar: 2 } }, [{ kind: 'item', id: 'gasmask', chance: 0.06 }], 'energy'),

  job('speakeasy', 'shinjuku', 'Run the Underground Speakeasy', 20, 1800, 2500, 48, { family: 10 }, [{ kind: 'contraband', id: 'plates', chance: 0.15 }], 'attack', true),
  job('pachinko', 'shinjuku', 'Rig the Pachinko Parlors', 21, 1900, 2700, 51, { items: { motorcycle: 3 } }, [{ kind: 'contraband', id: 'briefcase', chance: 0.06 }], 'defense'),
  job('corporate', 'shinjuku', 'Shake Down a Shareholder Meeting', 22, 2100, 2900, 54, { family: 12 }, [{ kind: 'item', id: 'nvg', chance: 0.04 }], 'energy'),

  job('armored', 'kowloon', 'Hijack an Armored Truck', 25, 3200, 4500, 65, { items: { speedboat: 5 } }, [{ kind: 'contraband', id: 'jewels', chance: 0.15 }], 'attack', true),
  job('mahjong', 'kowloon', 'Run a Mahjong Gambling Den', 26, 3400, 4700, 68, { family: 15 }, [{ kind: 'contraband', id: 'plates', chance: 0.08 }], 'defense'),
  job('counterfeit', 'kowloon', 'Move Counterfeit Watches', 28, 3700, 5100, 74, { items: { armoredsedan: 3 } }, [{ kind: 'contraband', id: 'briefcase', chance: 0.08 }], 'energy'),

  job('cit', 'jozi', 'Cash-in-Transit Highway Heist', 35, 6000, 8500, 95, { items: { armoredsedan: 10 } }, [{ kind: 'contraband', id: 'bullion', chance: 0.15 }], 'attack', true),
  job('diamonds', 'jozi', 'Smuggle Uncut Diamonds', 37, 6500, 9000, 100, { family: 20 }, [{ kind: 'contraband', id: 'jewels', chance: 0.10 }], 'defense'),
  job('minerobbery', 'jozi', 'Raid a Gold Mine Payroll', 40, 7200, 10000, 108, { items: { tacsuit: 3 } }, [{ kind: 'contraband', id: 'bullion', chance: 0.08 }], 'energy'),

  job('airfield', 'border', 'Airfield Cartel Run', 50, 15000, 22000, 140, { family: 30, items: { sniper: 15 } }, [{ kind: 'contraband', id: 'firearms', chance: 0.15 }], 'attack', true),
  job('tunnel', 'border', 'Dig a Border Tunnel', 45, 12000, 18000, 125, { family: 25 }, [{ kind: 'contraband', id: 'briefcase', chance: 0.12 }], 'defense'),
  job('generals', 'border', 'Buy Off a General', 55, 17000, 25000, 155, { family: 35, items: { helicopter: 5 } }, [{ kind: 'contraband', id: 'firearms', chance: 0.10 }], 'energy'),
]

export const MASTERY_REWARD = {
  attack: { attack: 2, text: '+2 Attack' },
  defense: { defense: 2, text: '+2 Defense' },
  energy: { maxEnergy: 5, text: '+5 Max Energy' },
}
export const STARS = ['None', 'Bronze', 'Silver', 'Gold']

// ---- Boss trophies (unique, not sold in the Black Market) ----
// `sprite` reuses a built-in item drawing; `unique` keeps them out of the shop.
const trophy = (id, category, name, atk, def, sprite) => ({ id, category, name, rarity: 'legendary', atk, def, price: 0, upkeep: 0, unique: true, sprite })
ITEMS.push(
  trophy('t_hook', 'weapon', "Dockmaster's Cargo Hook", 30, 14, 'switchblade'),
  trophy('t_cane', 'weapon', "Boss Tweed's Sword Cane", 42, 20, 'bat'),
  trophy('t_bowler', 'armor', 'Steel-Lined Bowler Coat', 16, 48, 'trench'),
  trophy('t_bentley', 'vehicle', 'Armoured Bentley', 40, 46, 'armoredsedan'),
  trophy('t_tanto', 'weapon', 'Oyabun\'s Tantō', 62, 26, 'switchblade'),
  trophy('t_junk', 'vehicle', 'Smuggler\'s Junk Boat', 58, 52, 'speedboat'),
  trophy('t_vest', 'armor', 'Gold-Plated Plate Carrier', 34, 78, 'tacsuit'),
  trophy('t_gunship', 'vehicle', 'Cartel Gunship', 90, 70, 'helicopter'),
)

// ---- District bosses: unlock once every job in the district has Bronze mastery ----
export const BOSSES = {
  docks: { name: 'Big Sal, the Dockmaster', level: 6, energy: 5, reward: { gold: 10, cash: 3000, item: 't_hook' } },
  midtown: { name: 'Alderman "Boss" Tweedy', level: 9, energy: 8, reward: { gold: 12, cash: 8000, item: 't_cane' } },
  eastend: { name: 'Reggie "The Razor" Crane', level: 13, energy: 12, reward: { gold: 14, cash: 20000, item: 't_bowler' } },
  downtown: { name: 'Lord Hollis of the City', level: 17, energy: 16, reward: { gold: 16, cash: 45000, item: 't_bentley' } },
  shinjuku: { name: 'Oyabun Kuroda', level: 21, energy: 22, reward: { gold: 18, cash: 90000, item: 't_tanto' } },
  kowloon: { name: 'Dragon Head Wong', level: 26, energy: 27, reward: { gold: 20, cash: 160000, item: 't_junk' } },
  jozi: { name: 'Grootbaas Venter', level: 32, energy: 38, reward: { gold: 25, cash: 300000, item: 't_vest' } },
  border: { name: 'El Escorpión', level: 40, energy: 52, reward: { gold: 30, cash: 600000, item: 't_gunship' } },
}

// ---- Daily login reward (7-day streak, then repeats) ----
export const DAILY_GOLD = [2, 2, 3, 3, 4, 5, 10]

// ---- Missions & achievements ----
// value(s) returns current progress; claimed once progress >= target.
const ach = (id, title, desc, target, value, reward, mentor = false) => ({ id, title, desc, target, value, reward, mentor })
const stars = (s) => Object.values(s.mastery).reduce((t, m) => t + m.star, 0)
const propCount = (s) => Object.values(s.properties).reduce((t, n) => t + n, 0)
const bossCount = (s) => Object.values(s.bosses || {}).filter((b) => b.defeated).length
const vaulted = (s) => Object.values(s.collections).reduce((t, n) => t + n, 0)
export const ACHIEVEMENTS = [
  ach('m_job', 'First Score', 'Complete any job.', 1, (s) => s.stats.jobs, { gold: 2, cash: 200 }, true),
  ach('m_buy', 'Tooled Up', 'Own a weapon, armor or vehicle (buy one in the Black Market).', 1, (s) => Object.entries(s.inventory).some(([id, n]) => n > 0 && !id.startsWith('t_')) ? 1 : 0, { gold: 2, cash: 300 }, true),
  ach('m_prop', 'Property Owner', 'Buy your first property.', 1, propCount, { gold: 3, cash: 500 }, true),
  ach('m_bank', 'Clean Money', 'Launder cash into the Bank.', 1, (s) => (s.bank > 0 ? 1 : 0), { gold: 2, cash: 300 }, true),
  ach('m_crew', 'Made a Family', 'Grow your Family to 5.', 5, (s) => s.family, { gold: 3, cash: 1000 }, true),
  ach('m_fight', 'Bloodied Knuckles', 'Win a fight in the Fight Club.', 1, (s) => s.stats.fightsWon, { gold: 3, cash: 500 }, true),
  ach('m_star', 'Know the Streets', 'Earn a Bronze mastery star.', 1, stars, { gold: 3, cash: 800 }, true),
  ach('m_forge', 'Forged in Fire', 'Upgrade your signature weapon.', 2, (s) => s.sigTier, { gold: 5 }, true),
  ach('m_boss', 'Bring Me His Head', 'Defeat a district boss.', 1, bossCount, { gold: 10, cash: 5000 }, true),
  ach('jobs100', 'Workhorse', 'Complete 100 jobs.', 100, (s) => s.stats.jobs, { gold: 10 }),
  ach('jobs1000', 'Career Criminal', 'Complete 1,000 jobs.', 1000, (s) => s.stats.jobs, { gold: 30 }),
  ach('lvl10', 'Rising Name', 'Reach Level 10.', 10, (s) => s.level, { gold: 10 }),
  ach('lvl25', 'Feared', 'Reach Level 25.', 25, (s) => s.level, { gold: 20 }),
  ach('lvl50', 'Legend of the Underworld', 'Reach Level 50.', 50, (s) => s.level, { gold: 40 }),
  ach('fights100', 'Brawler', 'Win 100 fights.', 100, (s) => s.stats.fightsWon, { gold: 15 }),
  ach('fights1000', 'Untouchable', 'Win 1,000 fights.', 1000, (s) => s.stats.fightsWon, { gold: 40 }),
  ach('fam50', 'Small Army', 'Grow your Family to 50.', 50, (s) => s.family, { gold: 20 }),
  ach('fam200', 'Empire of Men', 'Grow your Family to 200.', 200, (s) => s.family, { gold: 40 }),
  ach('props25', 'Landlord', 'Own 25 properties.', 25, propCount, { gold: 15 }),
  ach('props100', 'Real Estate Mogul', 'Own 100 properties.', 100, propCount, { gold: 35 }),
  ach('bank1m', 'Offshore Account', 'Have $1,000,000 in the Bank.', 1000000, (s) => s.bank, { gold: 25 }),
  ach('stars24', 'Master of the City', 'Earn 24 mastery stars.', 24, stars, { gold: 25 }),
  ach('bosses8', 'King of Every District', 'Defeat all 8 district bosses.', 8, bossCount, { gold: 50 }),
  ach('sets3', 'Collector', 'Vault 3 collection sets.', 3, vaulted, { gold: 15 }),
  ach('mk10', 'Mythic Arsenal', 'Forge your signature weapon to Mk. X.', 10, (s) => s.sigTier, { gold: 50 }),
]

// ---- Gold Exclusives (bought with Gold Bars in the Arsenal; not sellable) ----
// `sprite` is a stand-in drawing until custom art is added via ASSET_MAP.items[id].
const excl = (id, category, name, atk, def, gold, level, sprite) => ({ id, category, name, rarity: 'exclusive', atk, def, price: 0, upkeep: 0, exclusive: true, gold, level, sprite })
export const EXCLUSIVES = [
  excl('x_tommy', 'weapon', 'Gilded Tommy Gun', 40, 18, 12, 8, 'shotgun'),
  excl('x_machete', 'weapon', 'Dragon Bone Machete', 55, 22, 20, 15, 'switchblade'),
  excl('x_eagle', 'weapon', 'Solid Gold Desert Eagle', 70, 30, 30, 22, 'pistol45'),
  excl('x_rpg', 'weapon', 'Shoulder Rocket Launcher', 95, 35, 50, 32, 'sniper'),
  excl('x_mink', 'armor', 'Mink Fur Overcoat', 14, 40, 10, 8, 'trench'),
  excl('x_weave', 'armor', 'Titanium Weave Suit', 20, 60, 18, 15, 'leather'),
  excl('x_tux', 'armor', 'Bulletproof Tuxedo', 28, 80, 30, 22, 'kevlar'),
  excl('x_jugg', 'armor', 'Juggernaut Bomb Suit', 35, 110, 50, 32, 'tacsuit'),
  excl('x_roadster', 'vehicle', 'Gold Leaf Roadster', 35, 30, 12, 8, 'musclecar'),
  excl('x_limo', 'vehicle', 'Armored Presidential Limo', 45, 60, 22, 15, 'armoredsedan'),
  excl('x_yacht', 'vehicle', 'Midnight Mega Yacht', 70, 65, 35, 22, 'speedboat'),
  excl('x_jet', 'vehicle', 'Private Smuggling Jet', 100, 90, 55, 32, 'helicopter'),
]
ITEMS.push(...EXCLUSIVES)

// ---- Perk Shop (bought with Gold) ----
// Passive perks: permanent, 5 levels each. `per` is the bonus per level (same keys as faction perks,
// plus flat keys maxEnergyFlat / maxStaminaFlat / maxHealthFlat and bankFeeCut).
// Cost of level n = base * n (5 levels => base * 15 Gold total).
const passive = (id, name, desc, key, per, base, unit) => ({ id, name, desc, key, per, base, unit, max: 5 })
export const PASSIVE_PERKS = [
  passive('p_lungs', 'Iron Lungs', 'More maximum Energy.', 'maxEnergyFlat', 5, 4, 'flat'),
  passive('p_wind', 'Second Wind', 'Energy refills faster.', 'energyRegen', 0.04, 6, 'pct'),
  passive('p_stamina', 'Brawler\'s Stamina', 'More maximum Stamina.', 'maxStaminaFlat', 1, 6, 'flat'),
  passive('p_skin', 'Thick Skin', 'More maximum Health.', 'maxHealthFlat', 15, 4, 'flat'),
  passive('p_racket', 'Racketeer', 'Jobs pay more cash.', 'jobCash', 0.04, 5, 'pct'),
  passive('p_smarts', 'Street Smarts', 'Jobs give more XP.', 'jobXp', 0.03, 7, 'pct'),
  passive('p_ledger', 'Landlord\'s Ledger', 'Properties earn more per hour.', 'propertyIncome', 0.05, 5, 'pct'),
  passive('p_fence', 'Fence Network', 'Better odds of loot and contraband drops.', 'loot', 0.05, 4, 'pct'),
  passive('p_killer', 'Killer Instinct', 'Higher critical strike chance in fights.', 'crit', 0.02, 6, 'pct'),
  passive('p_partner', 'Silent Partner', 'Lower bank laundering fee (never below 1%).', 'bankFeeCut', 0.01, 5, 'pctFee'),
  passive('p_recruit', 'Recruiter', 'Hiring crew costs less.', 'crewCost', 0.04, 5, 'pctCut'),
  passive('p_fingers', 'Sticky Fingers', 'Steal more cash when you win a fight.', 'pvpCash', 0.04, 5, 'pct'),
]
export const perkCost = (perk, nextLevel) => perk.base * nextLevel

// Active boosts: timed, bought and switched on instantly. Buying again extends the timer.
const boost = (id, name, desc, effects, minutes, gold, extra = {}) => ({ id, name, desc, effects, minutes, gold, ...extra })
export const ACTIVE_BOOSTS = [
  boost('b_double', 'Double Down', 'Double cash from jobs.', { jobCash: 1 }, 30, 15),
  boost('b_adrenaline', 'Adrenaline', 'Double XP from jobs.', { jobXp: 1 }, 30, 18),
  boost('b_warpaint', 'War Paint', '+25% Attack in fights and boss battles.', { attack: 0.25 }, 30, 12),
  boost('b_bodyguards', 'Bodyguards', '+25% Defense and rivals can\'t raid you.', { defense: 0.25, raidShield: 1 }, 120, 10),
  boost('b_lucky', 'Lucky Charm', 'Double loot and contraband drop chance.', { loot: 1 }, 60, 10),
  boost('b_rush', 'Rush Hour', 'Energy refills twice as fast.', { energyRegen: 1 }, 60, 15),
  boost('b_medic', 'Medic on Call', 'Instant full heal, then Health refills 3x faster.', { healthRegen: 2 }, 60, 8, { heal: true }),
]

// ---- World Enemies: roaming crews anyone can attack (Fight Club) ----
export const WORLD = {
  unlockLevel: 4, lifetimeHours: 12, moveEveryHours: 2, cooldownMinutes: 30,
  npcPctPerHour: 0.05, // other bosses chip away this share of total HP per hour
  energy: 5, stamina: 1, turfBonus: 0.15,
}
const wtrophy = (id, category, name, atk, def, sprite, source) => ({ id, category, name, rarity: 'legendary', atk, def, price: 0, upkeep: 0, unique: true, sprite, source })
export const WORLD_ENEMIES = [
  { id: 'blackhand', name: 'The Black Hand', faction: 'families', size: 5, leader: 'Don Vittorio "The Black Hand"', blurb: 'An old-world extortion ring sending threat letters across every city.', trophy: 'w_blackhand' },
  { id: 'ironcrown', name: 'The Iron Crown Firm', faction: 'firm', size: 4, leader: 'The Iron Duke', blurb: 'Bare-knuckle enforcers who rob banks in broad daylight.', trophy: 'w_ironcrown' },
  { id: 'redlotus', name: 'Red Lotus Assassins', faction: 'yakuza', size: 5, leader: 'Lady Kurenai', blurb: 'Silent killers for hire, leaving a red lotus at every job.', trophy: 'w_redlotus' },
  { id: 'ninedragons', name: 'The Nine Dragons', faction: 'triad', size: 6, leader: 'Grandmaster Long', blurb: 'A secret society flooding the streets with counterfeit gold.', trophy: 'w_ninedragons' },
  { id: 'goldreef', name: 'Gold Reef Mercenaries', faction: 'syndicate', size: 5, leader: 'Colonel Botha', blurb: 'A private army hijacking bullion convoys on every continent.', trophy: 'w_goldreef' },
  { id: 'fantasmas', name: 'Los Fantasmas', faction: 'sinaloa', size: 6, leader: 'El Fantasma', blurb: 'A ghost cartel that strikes at night and vanishes by dawn.', trophy: 'w_fantasmas' },
]
ITEMS.push(
  wtrophy('w_blackhand', 'weapon', "Don Vittorio's Lupara", 70, 34, 'shotgun', 'Defeat The Black Hand (World Enemy)'),
  wtrophy('w_ironcrown', 'armor', 'Iron Crown Greatcoat', 26, 88, 'trench', 'Defeat The Iron Crown Firm (World Enemy)'),
  wtrophy('w_redlotus', 'weapon', 'Red Lotus Kunai Set', 82, 28, 'switchblade', 'Defeat the Red Lotus Assassins (World Enemy)'),
  wtrophy('w_ninedragons', 'vehicle', 'Nine Dragons War Junk', 72, 70, 'speedboat', 'Defeat The Nine Dragons (World Enemy)'),
  wtrophy('w_goldreef', 'vehicle', 'Gold Reef Armored Truck', 64, 92, 'armoredsedan', 'Defeat the Gold Reef Mercenaries (World Enemy)'),
  wtrophy('w_fantasmas', 'armor', 'Ghost Cartel Night Suit', 40, 96, 'tacsuit', 'Defeat Los Fantasmas (World Enemy)'),
)
ACHIEVEMENTS.push(
  ach('world1', 'Public Enemy Hunter', 'Take down a World Enemy leader.', 1, (s) => s.stats.worldKills || 0, { gold: 10, cash: 10000 }),
  ach('world10', 'Scourge of the Underworld', 'Take down 10 World Enemy leaders.', 10, (s) => s.stats.worldKills || 0, { gold: 40 }),
)
