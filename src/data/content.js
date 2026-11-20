// Game content tables (GDD §3, §6). Jobs marked `spec: true` come straight from the GDD;
// the others were added so every district has a short job chain.

export const RARITY = {
  common: { label: 'Common', color: '#9CA3AF' },
  uncommon: { label: 'Uncommon', color: '#34D399' },
  rare: { label: 'Rare', color: '#60A5FA' },
  epic: { label: 'Epic', color: '#C084FC' },
  legendary: { label: 'Legendary', color: '#D4AF37' },
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
