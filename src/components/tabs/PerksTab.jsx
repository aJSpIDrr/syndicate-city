import { Coins, Timer, Zap } from 'lucide-react'
import { PASSIVE_PERKS, ACTIVE_BOOSTS, perkCost } from '../../data/content'
import { buyPerk, activateBoost, fmt } from '../../game/engine'
import { Section } from '../ui'

const pct = (v) => `${Math.round(v * 100)}%`
function perkValue(p, lv) {
  const v = p.per * lv
  if (p.unit === 'flat') return `+${v}`
  if (p.unit === 'pctFee') return `-${pct(v)} fee`
  if (p.unit === 'pctCut') return `-${pct(v)}`
  return `+${pct(v)}`
}

export function fmtLeft(ms) {
  const m = Math.max(0, Math.ceil(ms / 60000))
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`
}

export default function PerksTab({ s, run }) {
  const now = Date.now()
  return (
    <div className="space-y-3">
      <Section flush title="Active Boosts"
        right={<span className="flex items-center gap-1 text-[12px] font-bold text-gold"><Coins size={13} /> {fmt(s.gold)} Gold</span>}>
        <p className="border-b border-[#24272D] px-3 py-2 text-[11px] text-stone-400">Timed power-ups that start the moment you buy them. Buying one that's already running adds more time.</p>
        {ACTIVE_BOOSTS.map((b) => {
          const left = (s.boosts?.[b.id] || 0) - now
          const on = left > 0
          return (
            <div key={b.id} className="row" style={on ? { background: 'rgba(212,175,55,.08)' } : undefined}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${on ? 'border-gold bg-gold/20 text-gold' : 'border-[#3A3F47] bg-black/30 text-stone-400'}`}>
                <Zap size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-stone-100">{b.name}</div>
                <div className="text-[11px] text-stone-400">{b.desc}</div>
                {on && <div className="flex items-center gap-1 text-[11px] font-bold text-gold"><Timer size={11} /> Active · {fmtLeft(left)} left</div>}
              </div>
              <div className="w-20 shrink-0 text-center text-[12px] text-stone-300">{b.minutes >= 60 ? `${b.minutes / 60}h` : `${b.minutes}m`}</div>
              <div className="flex w-36 shrink-0 items-center justify-end gap-2">
                <span className="flex items-center gap-1 font-bold text-gold"><Coins size={13} /> {b.gold}</span>
                <button className="classic-btn classic-btn-gold" disabled={s.gold < b.gold} onClick={() => run(activateBoost, b.id)}>{on ? 'Extend' : 'Activate'}</button>
              </div>
            </div>
          )
        })}
      </Section>

      <Section flush title="Passive Perks">
        <p className="border-b border-[#24272D] px-3 py-2 text-[11px] text-stone-400">Permanent upgrades with 5 levels each. They stack on top of your faction rank perks.</p>
        {PASSIVE_PERKS.map((p) => {
          const lv = s.perks?.[p.id] || 0
          const maxed = lv >= p.max
          const cost = perkCost(p, lv + 1)
          return (
            <div key={p.id} className="row flex-wrap sm:flex-nowrap">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-stone-100">{p.name}</div>
                <div className="text-[11px] text-stone-400">{p.desc}</div>
                <div className="mt-1 flex gap-1">
                  {Array.from({ length: p.max }, (_, i) => (
                    <span key={i} className="h-2 w-6 rounded-sm" style={{ background: i < lv ? 'var(--accent)' : 'rgba(255,255,255,.08)' }} />
                  ))}
                </div>
              </div>
              <div className="w-32 shrink-0 text-[12px]">
                <div className="k">Now → Next</div>
                <div><b className="text-stone-200">{lv ? perkValue(p, lv) : '—'}</b>{!maxed && <> <span className="text-stone-500">→</span> <b className="text-green-400">{perkValue(p, lv + 1)}</b></>}</div>
              </div>
              <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-36">
                {!maxed && <span className="flex items-center gap-1 font-bold text-gold"><Coins size={13} /> {cost}</span>}
                <button className="classic-btn classic-btn-gold" disabled={maxed || s.gold < cost} onClick={() => run(buyPerk, p.id)}>
                  {maxed ? 'Maxed' : lv ? `Lv ${lv + 1}` : 'Buy'}
                </button>
              </div>
            </div>
          )
        })}
      </Section>
    </div>
  )
}
