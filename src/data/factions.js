// The 6 Global Factions — rank ladders, perks and avatar evolution (GDD §2).
// Perk values are fractions (0.05 = +5%). `bankFee` is an absolute laundering fee.

export const RANK_LEVELS = [1, 5, 10, 15, 20, 25, 30, 35, 40, 50]

// Perk keys and how they render in the UI.
export const PERK_LABELS = {
  attack: 'Attack',
  defense: 'Defense',
  maxHealth: 'Max Health',
  crewCost: 'Crew Hire Cost',
  bankFee: 'Bank Fee',
  pvpCash: 'PvP Cash Stolen',
  staminaRegen: 'Stamina Regen Speed',
  energyRegen: 'Energy Regen Speed',
  healthRegen: 'Health Regen',
  crit: 'Crit Chance',
  propertyIncome: 'Property Income',
  loot: 'Loot Drop Rate',
  jobCash: 'Job Cash Payout',
  vehicle: 'Vehicle Stats',
  weapon: 'Weapon Stats',
  jobXp: 'Job XP',
}

export function formatPerk(key, value) {
  const pct = Math.round(value * 100)
  if (key === 'bankFee') return `${pct}% Bank Fee`
  if (key === 'crewCost') return `-${pct}% ${PERK_LABELS[key]}`
  return `+${pct}% ${PERK_LABELS[key]}`
}

const r = (title, look, perks) => ({ title, look, perks })

export const FACTIONS = [
  {
    id: 'families',
    name: 'The Five Families',
    subtitle: 'La Cosa Nostra',
    city: 'New York, USA',
    mentor: 'Don Lorenzo',
    vibe: '1930s–1950s classic American Mafia. Pinstripe suits, speakeasies, union rackets, and old-school loyalty.',
    deep: '#1D3557',
    accent: '#C5A059',
    weapon: 'Chicago Typewriter',
    weaponDesc: 'Thompson SMG',
    specialty: 'Defense, Crew Cost Reduction & Health',
    enamel: '#8E1B2B',
    style: { hats: ['newsboy', 'newsboy', 'fedora', 'none', 'none', 'fedora', 'fedora', 'none', 'none', 'none'], scar: 1, tie: 2, suit: 4, pinstripe: 6, glasses: 7, cigar: 8, rose: 9, grey: 7 },
    ranks: [
      r('Outsider', 'Newsboy cap, worn wool jacket, bruised knuckles, rainy alley.', { defense: 0.01, crewCost: 0.02 }),
      r('Street Tough', 'Rolled-up sleeves, suspenders, switchblade scar, brick tenement.', { defense: 0.02, maxHealth: 0.02, crewCost: 0.04 }),
      r('Associate', 'Cheap grey suit, loosened tie, fedora hat, smoky pool hall.', { defense: 0.04, maxHealth: 0.03, crewCost: 0.06 }),
      r('Enforcer', 'Heavy dark overcoat, leather gloves, stern glare, dockyard at night.', { defense: 0.06, maxHealth: 0.05, crewCost: 0.08 }),
      r('Soldier', 'Tailored charcoal suit, silk pocket square, classic sedan.', { defense: 0.08, maxHealth: 0.07, crewCost: 0.10 }),
      r('Button Man', 'Black trench coat, tilted brim fedora, dim speakeasy bar.', { defense: 0.10, maxHealth: 0.09, crewCost: 0.12 }),
      r('Capo', 'Double-breasted pinstripe suit, gold pinky ring, restaurant booth.', { defense: 0.12, maxHealth: 0.11, crewCost: 0.14 }),
      r('Consigliere', 'Silver-streaked hair, sharp spectacles, velvet smoking jacket.', { defense: 0.14, maxHealth: 0.13, crewCost: 0.16 }),
      r('Underboss', 'Custom Italian silk suit, lit Cuban cigar, Manhattan penthouse.', { defense: 0.16, maxHealth: 0.15, crewCost: 0.18 }),
      r('Godfather', 'Tuxedo with red rose boutonniere, regal armchair, golden frame.', { defense: 0.20, maxHealth: 0.18, crewCost: 0.20 }),
    ],
  },
  {
    id: 'firm',
    name: 'The Firm',
    subtitle: 'East End Crew',
    city: 'London, United Kingdom',
    mentor: 'Arthur',
    vibe: 'East End gangsters, smoky pubs, bare-knuckle boxing rings, tailored Savile Row coats, and covert operations.',
    deep: '#333533',
    accent: '#C8272D',
    weapon: 'Walther PPK',
    weaponDesc: 'Pocket Pistol',
    specialty: 'Lower Bank Fees, PvP Cash Stolen & Defense',
    enamel: '#A4161A',
    style: { hats: ['flatcap', 'none', 'none', 'flatcap', 'none', 'none', 'none', 'none', 'none', 'none'], scar: 2, tie: 5, suit: 5, pinstripe: 6, glasses: 99, cigar: 99, ring: 9, grey: 99 },
    ranks: [
      r('Runner', 'Flat cap, scruffy turtleneck sweater, foggy East End cobblestones.', { bankFee: 0.09, pvpCash: 0.01 }),
      r('Footpad', 'Dark bomber jacket, taped knuckles, dimly lit pub alleyway.', { bankFee: 0.08, pvpCash: 0.03, defense: 0.01 }),
      r('Bruiser', 'Open-collar shirt, scar across eyebrow, boxing ring ropes.', { bankFee: 0.08, pvpCash: 0.05, defense: 0.03 }),
      r('Wheeler-Dealer', 'Tweed waistcoat, pocket watch chain, smoky betting shop.', { bankFee: 0.07, pvpCash: 0.07, defense: 0.05 }),
      r('Heavy', 'Heavy wool crombie overcoat, leather driving gloves, rainy Thames bridge.', { bankFee: 0.06, pvpCash: 0.09, defense: 0.07 }),
      r('Fixer', 'Sharp three-piece charcoal suit, dark tie, private members\' club.', { bankFee: 0.06, pvpCash: 0.11, defense: 0.09 }),
      r('Lieutenant', 'Savile Row pinstripe coat, silver cufflinks, luxury Jaguar interior.', { bankFee: 0.05, pvpCash: 0.13, defense: 0.11 }),
      r('Governor', 'Velvet-collared Chesterfield coat, cold steel gaze, Tower Bridge skyline.', { bankFee: 0.04, pvpCash: 0.15, defense: 0.13 }),
      r('Guv\'nor', 'Bespoke black suit, crimson silk tie, mahogany boardroom.', { bankFee: 0.03, pvpCash: 0.17, defense: 0.15 }),
      r('Kingpin', 'Regal dark attire, heavy gold signet ring, crimson & gold crest frame.', { bankFee: 0.02, pvpCash: 0.20, defense: 0.18 }),
    ],
  },
  {
    id: 'yakuza',
    name: 'The Yakuza Clan',
    subtitle: 'Shinjuku-gumi',
    city: 'Tokyo, Japan',
    mentor: 'Kenji',
    vibe: 'Neon-lit Shinjuku alleys, traditional Irezumi tattoos, strict honor codes, high-tech smuggling, and corporate extortion.',
    deep: '#1A1A1D',
    accent: '#EF233C',
    weapon: 'Masterwork Forged Katana',
    weaponDesc: 'Hand-folded Blade',
    specialty: 'Attack Power, Stamina Regen & Crit Damage',
    enamel: '#B3121F',
    style: { hats: ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'], tattoo: 1, tie: 2, suit: 2, glasses: 4, whiteSuit: 6, kimono: 5, grey: 99 },
    ranks: [
      r('Shatei (Junior)', 'Simple black street jacket, shaved sides, rainy neon convenience store alley.', { attack: 0.02, staminaRegen: 0.02 }),
      r('Chinpirā (Thug)', 'Open-collar patterned shirt, wrist tattoo peeking out, arcade street.', { attack: 0.03, staminaRegen: 0.04 }),
      r('Kyōdai (Brother)', 'Dark tailored suit with lapel clan pin, slicked-back hair, izakaya bar.', { attack: 0.05, staminaRegen: 0.06 }),
      r('Shateigashira', 'Unbuttoned dress shirt revealing Irezumi tattoos, Shinjuku neon glow.', { attack: 0.07, staminaRegen: 0.08 }),
      r('Wakagashira-hosa', 'Sharp black suit, tinted aviator sunglasses, rain-slicked highway.', { attack: 0.09, staminaRegen: 0.10, crit: 0.02 }),
      r('Saiko-komon', 'Dark kimono over modern trousers, stoic expression, dojo screen.', { attack: 0.11, staminaRegen: 0.12, crit: 0.04 }),
      r('Wakagashira', 'White designer suit with crimson pocket square, sleeve tattoos.', { attack: 0.13, staminaRegen: 0.15, crit: 0.05 }),
      r('Oyabun', 'Full-body dragon Irezumi draped in a black silk haori.', { attack: 0.15, staminaRegen: 0.18, crit: 0.07 }),
      r('Kaichō', 'Bespoke obsidian suit, gold clan crest, Ginza glass office at night.', { attack: 0.17, staminaRegen: 0.21, crit: 0.08 }),
      r('Kumichō', 'Ceremonial black silk hakama, masterwork katana hilt, neon crimson frame.', { attack: 0.20, staminaRegen: 0.25, crit: 0.10 }),
    ],
  },
  {
    id: 'triad',
    name: 'The Triad Society',
    subtitle: 'Harbor Lodge',
    city: 'Hong Kong, China',
    mentor: 'Madam Li',
    vibe: 'Harbor smuggling, underground gambling dens, counterfeit rings, and sprawling real estate empires.',
    deep: '#007F5F',
    accent: '#FFD700',
    weapon: 'Dragon Cleaver',
    weaponDesc: 'Dragon Cleaver (Mk. I–V) → Dragon Butterfly Knife (Mk. VI–X)',
    // Weapon name changes with forge tier, matching the roster art
    weaponTiers: { 1: 'Dragon Cleaver', 6: 'Dragon Butterfly Knife' },
    specialty: 'Property Income, Loot Drop Rate & Health Regen',
    enamel: '#0B7A55',
    style: { hats: ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'], pendant: 1, mandarin: 1, suit: 3, glasses: 4, robe: 9, grey: 99 },
    ranks: [
      r('Lantern Boy', 'Worn canvas dockworker jacket, damp hair, misty Victoria Harbour pier.', { propertyIncome: 0.02, loot: 0.02 }),
      r('Blue Lantern', 'Dark mandarin-collar shirt, jade pendant, bustling night market.', { propertyIncome: 0.04, loot: 0.04 }),
      r('Grass Sandal', 'Sleek leather jacket, earpiece, neon-lit Kowloon alleyway.', { propertyIncome: 0.06, loot: 0.06, healthRegen: 0.02 }),
      r('Straw Sandal', 'Tailored grey blazer over dark turtleneck, smoky mahjong parlor.', { propertyIncome: 0.08, loot: 0.08, healthRegen: 0.04 }),
      r('White Paper Fan', 'Rimless glasses, sharp dark suit, gold watch, financial district.', { propertyIncome: 0.11, loot: 0.10, healthRegen: 0.06 }),
      r('Red Pole', 'Embroidered dark silk Tang jacket, battle-hardened gaze, temple lanterns.', { propertyIncome: 0.14, loot: 0.12, healthRegen: 0.08 }),
      r('Vanguard', 'Emerald-lined overcoat, gold rings, private yacht deck at night.', { propertyIncome: 0.17, loot: 0.15, healthRegen: 0.10 }),
      r('Incense Master', 'High-collar imperial black & jade silk attire, ornate gilded hall.', { propertyIncome: 0.20, loot: 0.17, healthRegen: 0.12 }),
      r('Deputy Master', 'Bespoke tuxedo with jade cufflinks, panoramic Hong Kong skyline.', { propertyIncome: 0.22, loot: 0.20, healthRegen: 0.15 }),
      r('Dragon Head', 'Imperial dragon-embroidered silk robe, jade & gold crest frame.', { propertyIncome: 0.25, loot: 0.25, healthRegen: 0.20 }),
    ],
  },
  {
    id: 'syndicate',
    name: 'The Syndicate',
    subtitle: 'Jozi Gold Crew',
    city: 'Johannesburg, South Africa',
    mentor: 'Piet',
    vibe: 'Gritty Jozi gold & diamond smuggling, armored cash-in-transit heists, private paramilitary networks, and ruthless street crews.',
    deep: '#5C5346',
    accent: '#D4AF37',
    weapon: 'R4 Assault Rifle',
    weaponDesc: 'Battle Rifle',
    specialty: 'Job Cash, Vehicle Combat & Max Health',
    enamel: '#7A5C12',
    style: { hats: ['cap', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'], chain: 2, glasses: 4, suit: 6, scar: 5, diamond: 7, grey: 99 },
    ranks: [
      r('Laaitie (Rookie)', 'Dusty denim jacket, baseball cap, weathered mining warehouse.', { jobCash: 0.02, vehicle: 0.03 }),
      r('Runner', 'Tactical cargo vest, rugged stubble, Jozi industrial rail yard.', { jobCash: 0.04, vehicle: 0.06 }),
      r('Tsotsi', 'Leather bomber jacket, gold chain, neon-lit Hillbrow street corner.', { jobCash: 0.06, vehicle: 0.09, maxHealth: 0.02 }),
      r('Hitman', 'Black tactical turtleneck, shoulder holster, armored SUV headlights.', { jobCash: 0.08, vehicle: 0.12, maxHealth: 0.04 }),
      r('Nduna (Captain)', 'Khaki safari-cut jacket, aviator sunglasses, open-pit gold mine.', { jobCash: 0.10, vehicle: 0.15, maxHealth: 0.06 }),
      r('Generaal', 'Dark paramilitary overcoat, scarred jaw, private airfield hangar.', { jobCash: 0.12, vehicle: 0.18, maxHealth: 0.08 }),
      r('Syndicate Boss', 'Charcoal suit with open collar, heavy gold watch, Sandton penthouse.', { jobCash: 0.14, vehicle: 0.21, maxHealth: 0.10 }),
      r('Baron', 'Bespoke tan linen suit, diamond lapel pin, luxury game-lodge terrace.', { jobCash: 0.16, vehicle: 0.24, maxHealth: 0.12 }),
      r('Grootbaas', 'Black & gold-trimmed coat, cold authoritative stare, vault of bullion.', { jobCash: 0.18, vehicle: 0.27, maxHealth: 0.15 }),
      r('Diamond Kingpin', 'Opulent dark suit, diamond rings, bullion vault & safari gold frame.', { jobCash: 0.22, vehicle: 0.30, maxHealth: 0.18 }),
    ],
  },
  {
    id: 'sinaloa',
    name: 'Sinaloa Cartel',
    subtitle: 'La Federación',
    city: 'Sinaloa, Mexico',
    mentor: 'El Chapo',
    vibe: 'Jungle airstrips, border tunnels, heavy military firepower, corrupt politicians, and massive cash flow.',
    deep: '#800F2F',
    accent: '#C89F65',
    weapon: 'Gold-Engraved Desert AK-47',
    weaponDesc: 'Engraved Rifle',
    specialty: 'Energy Regen, Bonus XP & Weapon Attack',
    enamel: '#800F2F',
    style: { hats: ['none', 'bandana', 'none', 'cowboy', 'none', 'none', 'none', 'cowboy', 'none', 'none'], chain: 4, glasses: 6, suit: 7, scar: 2, diamond: 9, grey: 99 },
    ranks: [
      r('Halcón (Lookout)', 'Worn plaid shirt, binoculars strap, dusty desert highway outpost.', { energyRegen: 0.02, weapon: 0.02 }),
      r('Mula', 'Dusty canvas jacket, bandana around neck, moonlit border canyon.', { energyRegen: 0.04, weapon: 0.04 }),
      r('Sicario', 'Black tactical vest over button-down shirt, compound gate.', { energyRegen: 0.06, weapon: 0.06, jobXp: 0.02 }),
      r('Pistolero', 'Embroidered western shirt, leather belt buckle, cantina courtyard.', { energyRegen: 0.08, weapon: 0.09, jobXp: 0.04 }),
      r('Comandante', 'Olive tactical jacket, gold crucifix chain, jungle airstrip.', { energyRegen: 0.10, weapon: 0.12, jobXp: 0.06 }),
      r('Jefe de Plaza', 'Crisp white guayabera, gold wristwatch, colonial plaza balcony.', { energyRegen: 0.12, weapon: 0.15, jobXp: 0.08 }),
      r('Lugarteniente', 'Silk patterned designer shirt, tinted sunglasses, hacienda estate.', { energyRegen: 0.15, weapon: 0.18, jobXp: 0.10 }),
      r('Narco-Baron', 'Cream linen suit, gold-plated belt, private ranch in the mountains.', { energyRegen: 0.18, weapon: 0.21, jobXp: 0.12 }),
      r('Padrino', 'Bespoke burgundy & black suit, heavy gold rings, fortress study.', { energyRegen: 0.20, weapon: 0.24, jobXp: 0.13 }),
      r('El Jefe Supremo', 'Silk dress shirt, diamond watch, gilded hacienda & burgundy frame.', { energyRegen: 0.25, weapon: 0.28, jobXp: 0.15 }),
    ],
  },
]

// Signature weapon name at a forge tier (some factions' weapons change form as they're forged).
export function weaponName(factionOrId, tier = 1) {
  const f = typeof factionOrId === 'string' ? getFaction(factionOrId) : factionOrId
  if (!f.weaponTiers) return f.weapon
  let name = f.weapon
  for (const [t, n] of Object.entries(f.weaponTiers)) if (tier >= Number(t)) name = n
  return name
}

export const getFaction = (id) => FACTIONS.find((f) => f.id === id) || FACTIONS[0]

export function rankIndexForLevel(level) {
  let idx = 0
  RANK_LEVELS.forEach((lv, i) => { if (level >= lv) idx = i })
  return idx
}

// Rival name pools for the AI Rival Generator.
export const RIVAL_NAMES = {
  families: { first: ['Vito', 'Sal', 'Carmine', 'Tommy', 'Frankie', 'Nicky', 'Joey', 'Lucia', 'Rosa', 'Sonny'], last: ['Moretti', 'Bianchi', 'Gallo', 'Russo', 'DeLuca', 'Marino', 'Costa', 'Ferraro'], tag: ['"The Knife"', '"Two-Times"', '"Fingers"', '"The Saint"', '"Big Ears"'] },
  firm: { first: ['Reggie', 'Ronnie', 'Charlie', 'Harry', 'Eddie', 'Mickey', 'Ivy', 'Mags', 'Alfie', 'Dougie'], last: ['Crane', 'Hollis', 'Blackwood', 'Pike', 'Fletcher', 'Marsh', 'Kemp', 'Shaw'], tag: ['"Mad Dog"', '"The Razor"', '"Bulldog"', '"Gentleman"', '"Smiler"'] },
  yakuza: { first: ['Ryo', 'Takeshi', 'Daisuke', 'Hiro', 'Sora', 'Akira', 'Yumi', 'Rin', 'Kaito', 'Jun'], last: ['Kuroda', 'Matsuda', 'Shimizu', 'Fujita', 'Ishikawa', 'Mori', 'Okada', 'Saito'], tag: ['"Ghost"', '"Steel Fan"', '"Red Crane"', '"Silent"', '"Neon"'] },
  triad: { first: ['Wai', 'Ming', 'Ka-Ho', 'Siu', 'Fei', 'Lok', 'Mei', 'Jade', 'Kwan', 'Bo'], last: ['Chan', 'Leung', 'Wong', 'Ho', 'Tsang', 'Lam', 'Fung', 'Cheung'], tag: ['"Golden Fan"', '"Ten Dragons"', '"Jade Eye"', '"Mahjong"', '"Typhoon"'] },
  syndicate: { first: ['Sipho', 'Johan', 'Thabo', 'Riaan', 'Bongani', 'Kobus', 'Lerato', 'Naledi', 'Dries', 'Mandla'], last: ['Venter', 'Dlamini', 'Botha', 'Nkosi', 'Pretorius', 'Mokoena', 'Steyn', 'Khumalo'], tag: ['"Gatvol"', '"Diamond"', '"Rooinek"', '"Ou Baas"', '"Jackal"'] },
  sinaloa: { first: ['Chuy', 'Beto', 'Memo', 'Nacho', 'Rafa', 'Lalo', 'Lupe', 'Marisol', 'Tito', 'Paco'], last: ['Guerrero', 'Salazar', 'Fuentes', 'Ochoa', 'Treviño', 'Castillo', 'Rojas', 'Mendoza'], tag: ['"El Güero"', '"La Sombra"', '"El Flaco"', '"Escorpión"', '"El Toro"'] },
}
