import { Users, Briefcase, Building2, Sword, Swords, Vault } from 'lucide-react'

export const TABS = [
  { id: 'family', label: 'The Family & Ranks', short: 'Family', icon: Users },
  { id: 'jobs', label: 'The Jobs', short: 'Jobs', icon: Briefcase },
  { id: 'realestate', label: 'Real Estate', short: 'Estate', icon: Building2 },
  { id: 'arsenal', label: 'The Arsenal', short: 'Arsenal', icon: Sword },
  { id: 'fight', label: 'Fight Club', short: 'Fight', icon: Swords },
  { id: 'vault', label: 'Contraband Vault', short: 'Vault', icon: Vault },
]

export function Sidebar({ tab, setTab, badges = {} }) {
  return (
    <nav className="rivets sticky top-[92px] hidden h-fit w-60 shrink-0 rounded-xl border border-line bg-side p-3 pt-6 md:block">
      {TABS.map((t) => {
        const active = tab === t.id
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${active ? 'text-ink' : 'text-stone-300 hover:bg-white/5'}`}
            style={active ? { background: 'var(--accent)' } : undefined}
          >
            <t.icon size={20} />
            <span className="flex-1">{t.label}</span>
            {badges[t.id] > 0 && <span className={`chip ${active ? 'bg-ink/80 text-gold' : 'bg-gold/20 text-gold'}`}>{badges[t.id]}</span>}
          </button>
        )
      })}
    </nav>
  )
}

export function BottomNav({ tab, setTab, badges = {} }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-line bg-side/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      {TABS.map((t) => {
        const active = tab === t.id
        return (
          <button key={t.id} onClick={() => setTab(t.id)} className="relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold"
            style={{ color: active ? 'var(--accent)' : '#A8A29E' }}>
            <t.icon size={20} />
            {t.short}
            {badges[t.id] > 0 && <span className="absolute right-3 top-1 h-2 w-2 rounded-full bg-gold" />}
          </button>
        )
      })}
    </nav>
  )
}
