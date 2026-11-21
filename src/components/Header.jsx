import { Banknote, Coins, Zap, Grab, Cross, Star, Landmark, Mail, Settings, Plus, Skull, ScrollText } from 'lucide-react'
import { getFaction } from '../data/factions'
import { xpForNext, fmt, money, cityRank, HOSPITAL_THRESHOLD, activeBoosts, worldTemplate } from '../game/engine'
import { DISTRICTS } from '../data/content'
import { fmtLeft } from './tabs/PerksTab'
import FactionBanner from './FactionBanner'
import Avatar from './Avatar'
import { TABS } from './tabs.js'
import { fmtTime } from './ui'

function Stat({ icon: Icon, color, label, value, max, sub, action }) {
  const pct = max ? Math.max(0, Math.min(100, (value / max) * 100)) : null
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5 border-b border-r border-black/50 px-1.5 py-1 last:border-r-0 sm:gap-2 sm:border-b-0 sm:px-2.5 sm:py-1.5">
      <Icon size={16} color={color} className="hidden shrink-0 min-[400px]:block sm:block" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{label}</span>
          {action}
        </div>
        <div className="truncate text-[14px] font-bold leading-tight tabular-nums" style={{ color }}>
          {typeof value === 'number' ? fmt(value) : value}{max !== undefined && <span className="text-stone-400">/{fmt(max)}</span>}
        </div>
        {pct !== null && <div className="mt-0.5 h-1 overflow-hidden rounded-sm bg-black/60"><div className="h-full" style={{ width: `${pct}%`, background: color }} /></div>}
        {sub && <div className="truncate text-[10px] tabular-nums text-stone-500">{sub}</div>}
      </div>
    </div>
  )
}

export default function Header({ s, d, tab, setTab, onOpen, badges, newUpdate }) {
  const f = getFaction(s.factionId)
  const need = xpForNext(s.level)
  const timer = (m, max) => (s[m] >= max ? 'Full' : `+${m === 'health' ? 2 : 1} in ${fmtTime(d.intervals[m] - s.regen[m])}`)
  const injured = s.health < HOSPITAL_THRESHOLD

  return (
    <header className="sticky top-0 z-30 shadow-[0_4px_12px_rgba(0,0,0,.6)]">
      {/* Title banner */}
      <div className="hidden sm:block">
        <FactionBanner factionId={s.factionId} height={76} header>
          <div className="mx-auto flex h-full max-w-[1000px] items-center gap-4 px-3">
            <div className="font-display text-3xl font-extrabold tracking-[0.12em] gold-shine drop-shadow">SYNDICATE CITY</div>
            <div className="hidden text-xs uppercase tracking-widest text-stone-300 md:block">{f.city} · {f.name}</div>
            <div className="ml-auto flex items-center gap-1">
              <div className="mr-1 flex items-center gap-1 rounded border border-gold/40 bg-black/50 px-2 py-1 text-sm font-bold text-gold" title="Global City Rank">
                <Star size={14} fill="#D4AF37" /> #{cityRank(s)}
              </div>
              <HeadBtn label="Bank" onClick={() => onOpen('bank')}><Landmark size={17} /></HeadBtn>
              <HeadBtn label="What's New" onClick={() => onOpen('updates')} dot={newUpdate}><ScrollText size={17} /></HeadBtn>
              <HeadBtn label="Messages" onClick={() => onOpen('log')} badge={s.unread}><Mail size={17} /></HeadBtn>
              <HeadBtn label="Settings" onClick={() => onOpen('settings')}><Settings size={17} /></HeadBtn>
            </div>
          </div>
        </FactionBanner>
      </div>

      {/* Mobile top bar */}
      <div className="flex items-center gap-2 border-b border-black px-2 py-1.5 sm:hidden" style={{ background: `linear-gradient(90deg, ${f.deep}, #0B0C0E)` }}>
        <button onClick={() => setTab('family')} aria-label="Open Boss & Ranks"><Avatar factionId={s.factionId} rank={d.rank} size={38} /></button>
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm font-extrabold tracking-widest gold-shine">SYNDICATE CITY</div>
          <div className="truncate text-[11px] font-semibold" style={{ color: f.accent }}>{s.bossName} · {f.ranks[d.rank].title} · Lv {s.level}</div>
        </div>
        <div className="flex items-center gap-1 rounded border border-gold/40 bg-black/50 px-1.5 py-0.5 text-[11px] font-bold text-gold"><Star size={11} fill="#D4AF37" /> #{cityRank(s)}</div>
        <HeadBtn label="Bank" onClick={() => onOpen('bank')}><Landmark size={15} /></HeadBtn>
        <HeadBtn label="What's New" onClick={() => onOpen('updates')} dot={newUpdate}><ScrollText size={15} /></HeadBtn>
        <HeadBtn label="Messages" onClick={() => onOpen('log')} badge={s.unread}><Mail size={15} /></HeadBtn>
        <HeadBtn label="Settings" onClick={() => onOpen('settings')}><Settings size={15} /></HeadBtn>
      </div>

      {/* Stat strip */}
      <div className="border-y border-black bg-gradient-to-b from-[#2A2D33] to-[#17191D]">
        <div className="mx-auto flex max-w-[1000px] items-stretch">
          <button onClick={() => setTab('family')} className="hidden shrink-0 items-center gap-2 border-r border-black/50 py-1 pl-2 pr-3 text-left sm:flex" aria-label="Open Boss & Ranks">
            <Avatar factionId={s.factionId} rank={d.rank} size={46} />
            <div className="min-w-0">
              <div className="max-w-[140px] truncate text-[13px] font-bold text-stone-100">{s.bossName}</div>
              <div className="max-w-[140px] truncate text-[11px] font-semibold" style={{ color: f.accent }}>{f.ranks[d.rank].title}</div>
              <div className="text-[10px] font-bold text-stone-400">LEVEL {s.level}</div>
            </div>
          </button>
          <div className="grid min-w-0 flex-1 grid-cols-3 sm:flex">
            <Stat icon={Banknote} color="#4ADE80" label="Cash" value={money(s.cash)} sub={s.bank > 0 ? `Bank ${money(s.bank)}` : 'Unbanked'} />
            <Stat icon={Cross} color={injured ? '#F87171' : '#4ADE80'} label="Health" value={s.health} max={d.maxHealth} sub={timer('health', d.maxHealth)}
              action={s.health < d.maxHealth && <button onClick={() => onOpen('doctor')} className="rounded bg-red-600/80 px-1 text-[9px] font-bold uppercase leading-4 text-white">Heal</button>} />
            <Stat icon={Zap} color="#60A5FA" label="Energy" value={s.energy} max={d.maxEnergy} sub={timer('energy', d.maxEnergy)} />
            <Stat icon={Grab} color="#FB923C" label="Stamina" value={s.stamina} max={d.maxStamina} sub={timer('stamina', d.maxStamina)} />
            <Stat icon={Star} color={f.accent} label="Exp" value={s.xp} max={need} sub={`${fmt(need - s.xp)} to level`} />
            <Stat icon={Coins} color="#D4AF37" label="Gold" value={s.gold}
              action={<button onClick={() => onOpen('store')} className="rounded bg-gold/25 p-0.5 text-gold" aria-label="Gold Store"><Plus size={10} /></button>} />
          </div>
        </div>
      </div>

      {/* World Enemy alert */}
      {s.world && !s.world.defeated && !s.world.escaped && tab !== 'fight' && (
        <button onClick={() => setTab('fight')} className="block w-full border-b border-black bg-gradient-to-r from-[#5A0F0F] via-[#3A0A0A] to-[#5A0F0F] text-left">
          <div className="mx-auto flex max-w-[1000px] items-center gap-2 px-2 py-1 text-[12px]">
            <Skull size={14} className="shrink-0 animate-pulse text-red-400" />
            <span className="hidden font-bold uppercase tracking-wider text-red-300 sm:inline">World Enemy</span>
            <span className="truncate text-stone-200">{worldTemplate(s.world).name} spotted in {DISTRICTS.find((x) => x.id === s.world.location).name}</span>
            <span className="ml-auto shrink-0 rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold uppercase text-white">Attack ›</span>
          </div>
        </button>
      )}

      {/* Active boosts */}
      {activeBoosts(s).length > 0 && (
        <div className="border-b border-black bg-[#1A160B]">
          <div className="mx-auto flex max-w-[1000px] flex-wrap items-center gap-1.5 px-2 py-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Boosts</span>
            {activeBoosts(s).map((b) => (
              <button key={b.id} onClick={() => setTab('perks')} className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] font-semibold text-gold">
                {b.name} · {fmtLeft(s.boosts[b.id] - Date.now())}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <nav className="bg-[#0E0F12]">
        <div className="mx-auto flex max-w-[1000px] gap-1 overflow-x-auto px-2 pt-1.5">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex shrink-0 items-center gap-1.5 rounded-t-md border border-b-0 px-3.5 py-2 text-[12px] font-bold uppercase tracking-wide transition ${active ? 'border-transparent text-ink' : 'border-[#2A2E35] bg-gradient-to-b from-[#2A2D33] to-[#1A1C20] text-stone-300 hover:text-white'}`}
                style={active ? { background: `linear-gradient(180deg, color-mix(in srgb, ${f.accent} 75%, white), ${f.accent})` } : undefined}
              >
                <t.icon size={15} />
                {t.short}
                {badges[t.id] > 0 && <span className={`ml-0.5 rounded-full px-1.5 text-[10px] ${active ? 'bg-ink text-gold' : 'bg-gold text-ink'}`}>{badges[t.id]}</span>}
              </button>
            )
          })}
        </div>
        <div className="h-[3px]" style={{ background: f.accent }} />
      </nav>
    </header>
  )
}

function HeadBtn({ label, onClick, badge, dot, children }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="relative rounded border border-black/40 bg-black/40 p-1.5 text-stone-200 hover:bg-black/70 hover:text-white">
      {children}
      {dot && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-black bg-gold" />}
      {badge > 0 && <span className="absolute -right-1 -top-1 min-w-[15px] rounded-full bg-red-600 px-1 text-center text-[9px] font-bold text-white">{badge > 9 ? '9+' : badge}</span>}
    </button>
  )
}
