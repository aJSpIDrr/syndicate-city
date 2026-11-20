import { Banknote, Coins, Zap, Grab, Cross, Star, Landmark, Mail, Settings, Plus } from 'lucide-react'
import { getFaction, formatPerk } from '../data/factions'
import { xpForNext, fmt, money, cityRank, HOSPITAL_THRESHOLD } from '../game/engine'
import Avatar from './Avatar'
import { Bar, fmtTime } from './ui'

function Meter({ icon: Icon, color, label, value, max, timer, action, below, wide }) {
  return (
    <div className={`${wide ? 'col-span-3' : 'col-span-2'} sm:col-span-1 min-w-0 rounded-lg border border-line bg-black/25 px-2.5 py-1.5`}>
      <div className="flex items-center gap-1.5">
        <Icon size={15} color={color} className="shrink-0" />
        <span className="sr-only">{label}</span>
        <span className="truncate text-sm font-bold tabular-nums text-stone-100">{value}{max !== undefined && <span className="font-medium text-stone-400">/{max}</span>}</span>
        {action}
      </div>
      {max !== undefined && <div className="mt-1"><Bar value={typeof value === 'number' ? value : 0} max={max} color={color} height={4} /></div>}
      {timer !== undefined && <div className="mt-0.5 flex items-center text-[10px] tabular-nums text-stone-500"><span className="truncate">{timer}</span>{below}</div>}
    </div>
  )
}

export default function HUD({ s, d, onOpen }) {
  const f = getFaction(s.factionId)
  const rank = f.ranks[d.rank]
  const need = xpForNext(s.level)
  const timer = (m, max) => (s[m] >= max ? 'Full' : `+${m === 'health' ? 2 : 1} in ${fmtTime(d.intervals[m] - s.regen[m])}`)
  const perkText = Object.entries(d.perks).map(([k, v]) => formatPerk(k, v)).join(' · ')
  const injured = s.health < HOSPITAL_THRESHOLD

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-3 py-2 lg:flex-row lg:items-center lg:gap-4 sm:px-4">
        {/* Left: identity */}
        <div className="flex min-w-0 items-center gap-3 lg:w-[340px]">
          <button onClick={() => onOpen('family')} className="shrink-0" aria-label="Open Family & Ranks">
            <Avatar factionId={s.factionId} rank={d.rank} size={60} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="truncate font-display text-lg font-bold text-stone-100">{s.bossName}</span>
              <span className="shrink-0 text-xs font-semibold text-stone-400">Lv {s.level}</span>
            </div>
            <div className="truncate text-xs font-semibold" style={{ color: f.accent }}>{rank.title} · {f.name}</div>
            <div className="mt-0.5 truncate text-[10px] text-stone-400" title={perkText}>{perkText}</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1"><Bar value={s.xp} max={need} color={f.accent} height={5} /></div>
              <span className="shrink-0 text-[10px] tabular-nums text-stone-400">{fmt(s.xp)}/{fmt(need)} XP</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 lg:hidden">
            <IconBtn label="Bank" onClick={() => onOpen('bank')}><Landmark size={18} /></IconBtn>
            <IconBtn label="Messages" onClick={() => onOpen('log')} badge={s.unread}><Mail size={18} /></IconBtn>
            <IconBtn label="Settings" onClick={() => onOpen('settings')}><Settings size={18} /></IconBtn>
          </div>
        </div>

        {/* Center: meters */}
        <div className="grid flex-1 grid-cols-6 gap-1.5 sm:grid-cols-5">
          <Meter icon={Banknote} color="#4ADE80" label="Cash on hand" value={money(s.cash)} wide />
          <Meter icon={Coins} color="#D4AF37" label="Gold Bars" value={fmt(s.gold)} wide
            action={<button onClick={() => onOpen('store')} className="ml-auto rounded bg-gold/20 p-0.5 text-gold hover:bg-gold/30" aria-label="Gold Store"><Plus size={12} /></button>} />
          <Meter icon={Zap} color="#60A5FA" label="Energy" value={s.energy} max={d.maxEnergy} timer={timer('energy', d.maxEnergy)} />
          <Meter icon={Grab} color="#F87171" label="Stamina" value={s.stamina} max={d.maxStamina} timer={timer('stamina', d.maxStamina)} />
          <Meter icon={Cross} color={injured ? '#F87171' : '#4ADE80'} label="Health" value={s.health} max={d.maxHealth}
            timer={timer('health', d.maxHealth)}
            below={s.health < d.maxHealth && <button onClick={() => onOpen('doctor')} className="ml-auto shrink-0 rounded bg-red-500/20 px-1 text-[10px] font-bold leading-4 text-red-300 hover:bg-red-500/30">Heal</button>} />
        </div>

        {/* Right: standing & utilities */}
        <div className="hidden items-center gap-1 lg:flex">
          <div className="mr-1 flex items-center gap-1 rounded-lg border border-line px-2 py-1.5 text-sm font-bold text-gold" title="Global City Rank">
            <Star size={15} fill="#D4AF37" /> #{cityRank(s)}
          </div>
          <IconBtn label="Bank" onClick={() => onOpen('bank')}><Landmark size={18} /></IconBtn>
          <IconBtn label="Messages" onClick={() => onOpen('log')} badge={s.unread}><Mail size={18} /></IconBtn>
          <IconBtn label="Settings" onClick={() => onOpen('settings')}><Settings size={18} /></IconBtn>
        </div>
      </div>
    </header>
  )
}

function IconBtn({ label, onClick, badge, children }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="relative rounded-lg p-2 text-stone-300 hover:bg-white/5 hover:text-white">
      {children}
      {badge > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-[16px] rounded-full bg-red-600 px-1 text-center text-[10px] font-bold text-white">{badge > 9 ? '9+' : badge}</span>}
    </button>
  )
}
