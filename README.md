# Syndicate City

A 2D browser crime-syndicate RPG. Pick one of six global factions, work jobs, build a family, buy property, fight rival bosses, and rise through your faction's 10-rank criminal hierarchy. Your portrait, frame, and perks evolve at every rank.

Built from `syndicate_city_master_gdd_art_spec.md` (the master GDD in the project's Google Drive folder).

## Play locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173). `npm run build` makes a static build in `dist/`.

## Publish on GitHub Pages

`.github/workflows/deploy.yml` builds and deploys on every push to `main`. One-time setup:

1. Pages on a **private** repo needs GitHub Pro. Otherwise make the repo public (Settings → General → Danger Zone → Change visibility).
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Re-run the latest "Deploy to GitHub Pages" run (Actions tab) or push any commit.

The game will then be live at `https://ajspidrr.github.io/syndicate-city/`.

## What's in

- **Faction select**: 6 cards (Five Families, The Firm, Yakuza, Triad, Syndicate, Sinaloa) with banner, mentor, rookie → supreme boss avatar preview, and exclusive signature weapon.
- **10-tier rank ladders** per faction (levels 1, 5, 10 … 40, 50) with scaling perks, evolving SVG portraits, and frame tiers (Iron → Steel → Enamel → Gold & Diamond). A promotion modal compares old and new rank.
- **Meters** on a 1-second tick: Energy (180s), Stamina (300s), Health (+2/180s), each sped up by faction perks. Offline time is applied on load.
- **Jobs**: 8 districts and 24 jobs (the 8 from the GDD plus 16 more), item and family requirements, loot and contraband drops, and Bronze/Silver/Gold mastery (+3 Gold plus a stat bonus each).
- **Leveling**: XP = ⌊30 × L^1.35⌋ (retuned from the GDD's 50 × L^1.65, see Balance). Each level gives +2 Gold and 5 Skill Points, and refills your meters. Each rank promotion pays 5 × the new rank number in Gold.
- **Family**: recruit up to 500 crew. Combat follows the GDD formula: the boss uses the signature weapon, and the crew uses your best N−1 weapons plus N armor and N vehicles.
- **Arsenal**: Gold Exclusives (12 premium items bought with Gold, level-gated, not sellable), a signature weapon forge (Mk. I → Mk. X with Gold: crit, armor pen, cash-stolen passives) and a Black Market with all 25 GDD items, including upkeep.
- **Real Estate**: 6 properties, price ×1.15 per property owned, hourly income net of gear upkeep (holds up to 24h).
- **Bank**: 10% laundering fee (The Firm lowers it to 2%). Banked cash is safe.
- **Fight Club**: an AI rival generator covering all 6 factions, crits, armor pen, a hospital rule (<20 HP), a Street Doctor, a leaderboard, and asynchronous rival raids on your unbanked cash.
- **Contraband Vault**: 3 collection sets with permanent bonuses, plus Gold crates.
- **District bosses**: Bronze every job in a district to unlock its boss; wear them down over several hits for Gold, cash and a unique trophy item.
- **Perks & Boosts** (Gold): 12 passive perks with 5 levels each that stack on faction rank perks, and 7 timed active boosts (double cash/XP, +25% attack/defense, raid shield, loot, fast energy, medic).
- **Missions & Rewards**: a 7-day daily tribute streak, mentor orders for new players, and 25 achievements paying Gold and cash.
- **Repeat jobs**: x5 button on every unlocked job.
- **Clans**: found a crime family (Lv 5) with a custom crest; recruit AI members (Earner/Enforcer/Smuggler/Strategist) with skill, loyalty and wages who chat in a clan feed; appoint 5 positions for personal bonuses; treasury, clan levels and 6 upgrades; 8-district turf map vs 5 rival clans; 24h clan wars; timed crew heists; daily contracts. Code: `src/game/clan.js`, data: `src/data/clan.js`.
- **World Enemy**: a roaming crew (4–6 lieutenants + a leader with a huge health pool) that moves district every 2h and escapes after 12h. Each attack costs 1 Stamina + 5 Energy; rival bosses chip in, but only you can finish the leader. Home-turf bonus where you've beaten the district boss. Cash/Gold per lieutenant, big payout + one-off trophy per gang.
- **Revenge list**: rivals who raid you appear in the Fight Club for 24h; beating them pays +50% cash and XP.
- **Save backup**: copy a backup code in Settings and restore it on any device (also from the start screen).
- **Sound effects** (WebAudio, no files) with a mute switch in Settings.
- **Installable**: add to your phone's home screen; plays offline after the first visit.
- **What's New**: in-game update history (scroll icon in the header), shown once after each update. Add releases at the top of `src/data/changelog.js`.
- **Gold Store** with dev test tools (+5 Levels, +50 Gold, +$100k).
- Saves to `localStorage`. Reset is under Settings.

## Balance

All tuning numbers that differ from the GDD are in `BALANCE` at the top of [`src/game/engine.js`](src/game/engine.js). `npm run sim -- <faction> <hours> <checkInMinutes>` runs a greedy bot through the real engine and prints hours-to-level and PvP win rates per level band, e.g. `npm run sim -- yakuza 336 10`.

Current pacing for a bot that spends all its energy every 10 minutes: Level 10 ≈ 2h, Level 20 ≈ 16h, Level 30 ≈ 45h, Level 50 ≈ 130–190h. A player checking in a few times a day is several times slower. Changes from the GDD:

| Knob | GDD | Now | Why |
| --- | --- | --- | --- |
| XP curve | 50 × L^1.65 | 30 × L^1.35 | With 20 energy/hr, the GDD curve put Level 10 at ~13h and made jobs nearly pointless |
| PvP win XP | 10 + 2 × level | 4 + level | Fights were giving ~13× more XP per point than jobs |
| Rival strength | — | sublinear in level | PvP win rate lands around 65% early and 70–90% mid/late against the easiest of 6 rivals |
| Promotion Gold | — | 5 × rank | Mk. X costs 762 Gold; free players reached only ~370 by Level 75 |
| Collection vault | — | +5 Gold | Same reason |

## Adding art

All art slots live in [`src/assetMap.js`](src/assetMap.js) (`factionBanners`, `rankAvatars[faction][1..10]`, `signatureWeapons`, `items`, `contraband`, `jobBanners`, `districts`, `properties`). Put images in `public/art/...` and set the slot to e.g. `'./art/yakuza/rank-03.png'`. Any empty slot falls back to the built-in SVG art.

## Code map

| Path | What |
| --- | --- |
| `src/data/factions.js` | Factions, rank ladders, perks, rival name pools |
| `src/data/content.js` | Items, jobs, districts, properties, contraband, signature tiers |
| `src/game/engine.js` | Pure game logic: formulas, tick, actions, combat, rivals |
| `src/game/useGame.js` | React reducer, 1s loop, autosave |
| `src/components/` | Header (title banner, stat strip, tab bar), avatar, banners, modals, one file per tab |
| `src/art/` | Built-in SVG art: items, contraband, signature weapons, district and property scenes |
