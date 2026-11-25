import { Check, Coins, Gift, Lock } from 'lucide-react'
import { getFaction } from '../../data/factions'
import { ACHIEVEMENTS, DAILY_GOLD, TIERED, ORDER_POOLS, ORDER_REWARD, ORDER_BONUS } from '../../data/content'
import { dailyStatus, claimDaily, achievementProgress, claimAchievement, money, fmt, ordersView, orderProgress, claimOrder, periodEnds } from '../../game/engine'
import { fmtLeft } from './PerksTab'
import { Section } from '../ui'
import Avatar from '../Avatar'
import { ASSET_MAP } from '../../assetMap'

function Reward({ r }) {
  return (
    <span className="flex flex-wrap items-center justify-end gap-x-2 text-[12px] font-bold">
      {r.gold > 0 && <span className="flex items-center gap-0.5 text-gold"><Coins size={12} /> {r.gold}</span>}
      {r.cash > 0 && <span className="text-green-400">{money(r.cash)}</span>}
    </span>
  )
}

function AchRow({ s, a, run }) {
  const p = achievementProgress(s, a)
  const pct = (p.value / a.target) * 100
  return (
    <div className={`row ${p.claimed ? 'opacity-55' : ''}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${p.claimed ? 'border-green-600 bg-green-900/40 text-green-400' : p.done ? 'border-gold bg-gold/20 text-gold' : 'border-[#3A3F47] bg-black/30 text-stone-600'}`}>
        {p.claimed ? <Check size={16} /> : p.done ? <Gift size={16} /> : <Lock size={14} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2"><span className="font-bold text-stone-100">{a.title}</span>
          {a.tiers && <span className="flex gap-0.5">{Array.from({ length: a.tiers }, (_, i) => <span key={i} className="h-1.5 w-3 rounded-sm" style={{ background: i < a.tier - (p.claimed ? 0 : 1) ? '#D4AF37' : 'rgba(255,255,255,.12)' }} />)}</span>}
          {a.tiers && <span className="text-[10px] text-stone-500">Rank {a.tier}/{a.tiers}</span>}</div>
        <div className="text-[11px] text-stone-400">{a.desc}</div>
        {!p.claimed && (
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 w-32 overflow-hidden rounded-sm bg-black/60"><div className="h-full" style={{ width: `${pct}%`, background: p.done ? '#D4AF37' : 'var(--accent)' }} /></div>
            <span className="text-[10px] tabular-nums text-stone-500">{fmt(p.value)}/{fmt(a.target)}</span>
          </div>
        )}
      </div>
      <div className="w-24 shrink-0"><Reward r={a.reward} /></div>
      <button className="classic-btn classic-btn-gold w-20 shrink-0" disabled={!p.done || p.claimed} onClick={() => run(claimAchievement, a.id)}>
        {p.claimed ? (a.tiers && a.tier === a.tiers ? 'Maxed' : 'Done') : 'Claim'}
      </button>
    </div>
  )
}

export default function MissionsTab({ s, d, run }) {
  const f = getFaction(s.factionId)
  const daily = dailyStatus(s)
  const mentor = ACHIEVEMENTS.filter((a) => a.mentor)
  const nextMentor = mentor.find((a) => !s.achievements[a.id] && a.value(s) < a.target)
  const mentorLeft = mentor.some((a) => !s.achievements[a.id])
  const orders = ordersView(s)
  // One row per ladder: the lowest rank not yet claimed (or the top rank once all are claimed)
  const ladders = TIERED.map((t) => {
    const tiers = ACHIEVEMENTS.filter((a) => a.group === t.group)
    return tiers.find((a) => !s.achievements[a.id]) || tiers[tiers.length - 1]
  })
  const order = (a) => { const p = achievementProgress(s, a); return p.claimed ? 2 : p.done ? 0 : 1 }
  const rest = ladders.sort((a, b) => order(a) - order(b))
  return (
    <div className="space-y-3">
      <Section title="Daily Tribute">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 gap-1.5">
            {DAILY_GOLD.map((g, i) => {
              const today = daily.ready && i === daily.day
              const got = daily.ready ? i < daily.day : i <= daily.day
              return (
                <div key={i} className={`flex flex-1 flex-col items-center rounded border px-1 py-1.5 ${today ? 'border-gold bg-gold/15' : got ? 'border-green-700 bg-green-900/20' : 'border-[#2A2E35] bg-black/30'}`}>
                  <span className="text-[10px] font-bold uppercase text-stone-400">Day {i + 1}</span>
                  <span className="flex items-center gap-0.5 font-bold text-gold"><Coins size={11} />{g}</span>
                  {got && <Check size={12} className="text-green-400" />}
                </div>
              )
            })}
          </div>
          <div className="text-center sm:w-44">
            {daily.ready ? (
              <>
                <div className="text-[12px] text-stone-300">Day {daily.streak}: <b className="text-gold">{daily.gold} Gold</b> + <b className="text-green-400">{money(daily.cash)}</b></div>
                <button className="classic-btn classic-btn-gold mt-1 w-full" onClick={() => run(claimDaily)}><Gift size={13} /> Collect</button>
              </>
            ) : (
              <div className="text-[12px] text-stone-400">Collected today. Streak: <b className="text-stone-200">{daily.streak} day{daily.streak === 1 ? '' : 's'}</b>.<br />Come back tomorrow.</div>
            )}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-stone-500">Miss a day and the streak starts over. Day 7 pays the most, then the week repeats.</p>
      </Section>

      {['daily', 'weekly', 'monthly'].map((kind) => {
        const o = orders[kind]
        const r = ORDER_REWARD[kind](s.level)
        return (
          <Section key={kind} flush title={`${kind[0].toUpperCase() + kind.slice(1)} Orders`}
            right={<span className="text-[11px] text-stone-400">New orders in {fmtLeft(periodEnds(kind) - Date.now())} · all done +{ORDER_BONUS[kind]} Gold</span>}>
            {o.list.map((x) => {
              const def = ORDER_POOLS[kind].find((d) => d.id === x.id)
              const prog = orderProgress(s, kind, x)
              const done = prog >= x.target
              const money_ = def.stat === 'cashEarned'
              return (
                <div key={x.id} className={`row ${x.claimed ? 'opacity-50' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-stone-100">{def.text.replace('{n}', money_ ? money(x.target) : fmt(x.target))}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 w-32 overflow-hidden rounded-sm bg-black/60"><div className="h-full" style={{ width: `${(prog / x.target) * 100}%`, background: done ? '#D4AF37' : 'var(--accent)' }} /></div>
                      <span className="text-[10px] tabular-nums text-stone-500">{money_ ? money(prog) : fmt(prog)}/{money_ ? money(x.target) : fmt(x.target)}</span>
                    </div>
                  </div>
                  <div className="w-24 shrink-0"><Reward r={r} /></div>
                  <button className="classic-btn classic-btn-gold w-20 shrink-0" disabled={!done || x.claimed} onClick={() => run(claimOrder, kind, x.id)}>{x.claimed ? 'Done' : 'Claim'}</button>
                </div>
              )
            })}
          </Section>
        )
      })}

      {mentorLeft && <Section flush title={`Getting Started · ${f.mentor}'s Advice`}>
        {nextMentor && (
          <div className="flex items-center gap-3 border-b border-[#24272D] bg-black/30 px-3 py-2">
            {ASSET_MAP.mentors[s.factionId] ? <img src={ASSET_MAP.mentors[s.factionId]} alt="" className="h-10 w-10 rounded object-cover" /> : <Avatar factionId={s.factionId} rank={9} size={40} />}
            <p className="text-[12px] italic text-stone-300">"{nextMentor.desc} Do that, and there's something in it for you." — {f.mentor}</p>
          </div>
        )}
        <div>{mentor.map((a) => <AchRow key={a.id} s={s} a={a} run={run} />)}</div>
      </Section>}

      <Section flush title="Achievements">
        <div>{rest.map((a) => <AchRow key={a.id} s={s} a={a} run={run} />)}</div>
      </Section>
    </div>
  )
}
