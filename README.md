# Syndicate City

A 2D browser crime-syndicate RPG. Pick one of six global factions, work jobs, build a family, buy property, fight rival bosses, and rise through your faction's 10-rank criminal hierarchy. Your portrait, frame, and perks evolve at every rank.

Built from `syndicate_city_master_gdd_art_spec.md` (the master GDD in the project's Google Drive folder).

## Play locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173). `npm run build` makes a static build in `dist/` that you can host anywhere, including GitHub Pages.

## What's in

- **Faction select**: 6 cards (Five Families, The Firm, Yakuza, Triad, Syndicate, Sinaloa) with banner, mentor, rookie → supreme boss avatar preview, and exclusive signature weapon.
- **10-tier rank ladders** per faction (levels 1, 5, 10 … 40, 50) with scaling perks, evolving SVG portraits, and frame tiers (Iron → Steel → Enamel → Gold & Diamond). A promotion modal compares old and new rank.
- **Meters** on a 1-second tick: Energy (180s), Stamina (300s), Health (+2/180s), each sped up by faction perks. Offline time is applied on load.
- **Jobs**: 8 districts and 24 jobs (the 8 from the GDD plus 16 more), item and family requirements, loot and contraband drops, and Bronze/Silver/Gold mastery (+3 Gold plus a stat bonus each).
- **Leveling**: XP = ⌊50 × L^1.65⌋. Each level gives +2 Gold and 5 Skill Points, and refills your meters.
- **Family**: recruit up to 500 crew. Combat follows the GDD formula: the boss uses the signature weapon, and the crew uses your best N−1 weapons plus N armor and N vehicles.
- **Arsenal**: a signature weapon forge (Mk. I → Mk. X with Gold: crit, armor pen, cash-stolen passives) and a Black Market with all 25 GDD items, including upkeep.
- **Real Estate**: 6 properties, price ×1.15 per property owned, hourly income net of gear upkeep (holds up to 24h).
- **Bank**: 10% laundering fee (The Firm lowers it to 2%). Banked cash is safe.
- **Fight Club**: an AI rival generator covering all 6 factions, crits, armor pen, a hospital rule (<20 HP), a Street Doctor, a leaderboard, and asynchronous rival raids on your unbanked cash.
- **Contraband Vault**: 3 collection sets with permanent bonuses, plus Gold crates.
- **Gold Store** with dev test tools (+5 Levels, +50 Gold, +$100k).
- Saves to `localStorage`. Reset is under Settings.

## Adding art

All art slots live in [`src/assetMap.js`](src/assetMap.js) (`factionBanners`, `rankAvatars[faction][1..10]`, `signatureWeapons`, `items`, `contraband`, `jobBanners`, `districts`, `properties`). Put images in `public/art/...` and set the slot to e.g. `'./art/yakuza/rank-03.png'`. Any empty slot falls back to the built-in SVG art.

## Code map

| Path | What |
| --- | --- |
| `src/data/factions.js` | Factions, rank ladders, perks, rival name pools |
| `src/data/content.js` | Items, jobs, districts, properties, contraband, signature tiers |
| `src/game/engine.js` | Pure game logic: formulas, tick, actions, combat, rivals |
| `src/game/useGame.js` | React reducer, 1s loop, autosave |
| `src/components/` | HUD, sidebar, avatar, banners, modals, and one file per tab |
