// ART ASSET CONFIG (GDD §8.2)
// Drop image URLs here (e.g. '/art/families/rank-1.png' placed in /public/art/...).
// Any slot left as null falls back to the built-in SVG/CSS art, so the game is fully playable without art.
//
// Example:
//   rankAvatars.families[1] = './art/families/rank-01.png'
//   signatureWeapons.yakuza = './art/weapons/katana.png'

const tenSlots = () => Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i + 1, null]))
const factionIds = ['families', 'firm', 'yakuza', 'triad', 'syndicate', 'sinaloa']
const perFaction = (fn) => Object.fromEntries(factionIds.map((id) => [id, fn(id)]))

export const ASSET_MAP = {
  pageBackgrounds: perFaction(() => null), // 1920x1080, behind the whole game (darkened automatically)
  headerBanners: perFaction(() => null), // 2400x240, the title strip at the top (falls back to factionBanners)
  factionBanners: perFaction(() => null), // 1200x360, faction select cards
  mentors: perFaction(() => null), // 512x512 square
  bosses: {}, // [districtId] 512x512 square boss portraits
  rankAvatars: perFaction(() => tenSlots()), // [factionId][1..10], square portraits
  signatureWeapons: perFaction(() => null), // 128x128, used for every tier unless signatureWeaponTiers has one
  signatureWeaponTiers: perFaction(() => tenSlots()), // [factionId][1..10], one image per forge tier
  items: {}, // [itemId] 128x128
  contraband: {}, // [contrabandId] 128x128
  jobBanners: {}, // [jobId] 400x150
  districts: {}, // [districtId]
  properties: {}, // [propertyId]
}

// Roster art cut from the Drive atlases (public/art/<faction>/rank-NN.jpg, weapon-NN.jpg)
const fill = (faction, kind, slot) => { for (let i = 1; i <= 10; i++) slot[faction][i] = `./art/${faction}/${kind}-${String(i).padStart(2, '0')}.jpg` }
for (const f of ['families', 'syndicate', 'firm', 'triad']) fill(f, 'rank', ASSET_MAP.rankAvatars)
for (const f of ['families', 'syndicate', 'firm']) fill(f, 'weapon', ASSET_MAP.signatureWeaponTiers)
fill('triad', 'blade', ASSET_MAP.signatureWeaponTiers) // cleaver Mk I–V, butterfly knife Mk VI–X

export const sigWeaponUrl = (factionId, tier) => ASSET_MAP.signatureWeaponTiers[factionId]?.[tier] || ASSET_MAP.signatureWeapons[factionId] || null

export const avatarUrl = (factionId, rank /* 0-based */) => ASSET_MAP.rankAvatars[factionId]?.[rank + 1] || null
