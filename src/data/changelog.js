// Player-facing update history, newest first. Add a new entry at the top for each release;
// players see a "What's New" popup once when the top entry's id changes.
export const CHANGELOG = [
  {
    id: '1.11',
    date: '2026-11-21',
    title: 'Update History & Easier Updates',
    items: [
      'New: this update history. Open it any time from the scroll icon at the top.',
      'The game now tells you when a new version is out, with an "Update now" button.',
      'A red World Enemy alert bar shows on every screen while one is roaming.',
      'Your version number is shown in Settings.',
    ],
  },
  {
    id: '1.10',
    date: '2026-11-21',
    title: 'World Enemies',
    items: [
      'Roaming gangs now hunt the city from Level 4: a crew of 4–6 lieutenants and a heavily armoured leader.',
      'Each attack costs 1 Stamina and 5 Energy. Lieutenants fall first, then the leader is exposed.',
      'They move to a new district every 2 hours and escape after 12. Beat a district boss to get a home-turf damage bonus there.',
      'Six gangs to hunt, each with a one-of-a-kind trophy. Two new achievements.',
    ],
  },
  {
    id: '1.9',
    date: '2026-11-21',
    title: 'Perks & Boosts',
    items: [
      'New Perks tab. Spend Gold on 12 passive perks (5 levels each) that stack with your rank perks.',
      'Seven timed boosts: Double Down, Adrenaline, War Paint, Bodyguards, Lucky Charm, Rush Hour and Medic on Call.',
      'Running boosts show under your stats with the time left.',
    ],
  },
  {
    id: '1.8',
    date: '2026-11-21',
    title: 'Gold Exclusives',
    items: [
      'New Arsenal tab: 12 premium weapons, armor and vehicles you can only buy with Gold.',
      'Stronger than anything on the Black Market, with no upkeep.',
    ],
  },
  {
    id: '1.7',
    date: '2026-11-21',
    title: 'City Scenery',
    items: [
      'Every faction now has its own city background, header banner and faction card: New York, London, Tokyo, Hong Kong, Johannesburg and Sinaloa.',
      'All 8 districts have illustrated scenes on their cards and job rows.',
    ],
  },
  {
    id: '1.6',
    date: '2026-11-21',
    title: 'Revenge, Backups & Sound',
    items: [
      'Revenge list: rivals who raid you can be hit back for 50% more cash and XP for 24 hours.',
      'Save backups: copy a backup code in Settings and restore your boss on any device.',
      'Sound effects, with a mute switch in Settings.',
      'Add the game to your phone\'s home screen and play offline.',
      'Late-game rivals hit harder.',
    ],
  },
  {
    id: '1.5',
    date: '2026-11-21',
    title: 'Bosses, Missions & Daily Tribute',
    items: [
      'District bosses: Bronze every job in a district to call out its boss and win a unique trophy.',
      'New Missions tab with your mentor\'s orders and 25 achievements paying Gold and cash.',
      'Daily Tribute: log in each day for a 7-day Gold streak.',
      'x5 button to repeat a job.',
    ],
  },
  {
    id: '1.4',
    date: '2026-11-20',
    title: 'Classic Look & Roster Art',
    items: [
      'New classic layout: title banner, stat strip, tab bar and compact job, fight and shop lists.',
      'Hand-painted rank portraits and weapon art for the Five Families, The Firm, The Triad and The Syndicate.',
      'Faction weapons are named after their art (Triad: Dragon Cleaver → Dragon Butterfly Knife).',
      'New drawings for every item, contraband piece, property and district.',
    ],
  },
  {
    id: '1.1',
    date: '2026-11-20',
    title: 'Balance Pass',
    items: [
      'Faster levelling early on, fairer fights, and Gold from rank promotions so the Mk. X weapon is reachable.',
      'The game goes live on the web.',
    ],
  },
  {
    id: '1.0',
    date: '2026-11-20',
    title: 'Syndicate City Opens',
    items: [
      'Six global factions, each with a 10-rank ladder and an exclusive signature weapon.',
      'Jobs, crew, real estate, the bank, Fight Club and the Contraband Vault.',
    ],
  },
]

export const LATEST_UPDATE = CHANGELOG[0].id
