import { Users, Briefcase, Building2, Sword, Swords, Vault, Trophy, Sparkles, Castle, Home, Map } from 'lucide-react'

export const TABS = [
  { id: 'family', label: 'Boss & Ranks', short: 'Boss', icon: Users },
  { id: 'jobs', label: 'The Jobs', short: 'Jobs', icon: Briefcase },
  { id: 'realestate', label: 'Real Estate', short: 'Estate', icon: Building2 },
  { id: 'arsenal', label: 'The Arsenal', short: 'Arsenal', icon: Sword },
  { id: 'fight', label: 'Fight Club', short: 'Fight', icon: Swords },
  { id: 'hq', label: 'Headquarters', short: 'HQ', icon: Home },
  { id: 'turf', label: 'Turf Wars', short: 'Turf', icon: Map },
  { id: 'clan', label: 'Family', short: 'Family', icon: Castle },
  { id: 'vault', label: 'Contraband Vault', short: 'Vault', icon: Vault },
  { id: 'perks', label: 'Perks & Boosts', short: 'Perks', icon: Sparkles },
  { id: 'missions', label: 'Missions & Rewards', short: 'Missions', icon: Trophy },
]
