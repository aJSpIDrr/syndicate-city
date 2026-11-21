import { RefreshCw, Swords, Stethoscope, Star, Flame } from 'lucide-react'
import { getFaction } from '../../data/factions'
import { attackRival, refreshRivals, healAtDoctor, money, fmt, respectOf, cityRank, HOSPITAL_THRESHOLD } from '../../game/engine'
import Avatar from '../Avatar'
import { Section, Stat, Bar } from '../ui'

function odds(my, their) {
  const r = my / Math.max(1, their)
  if (r > 1.35) return { label: 'Easy', color: '#4ADE80' }
  if (r > 1.05) return { label: 'Favored', color: '#A3E635' }
  if (r > 0.9) return { label: 'Even', color: '#FACC15' }
  if (r > 0.7) return { label: 'Risky', color: '#FB923C' }
  return { label: 'Deadly', color: '#F87171' }
}

export default function FightClubTab({ s, d, run }) {
  const injured = s.health < HOSPITAL_THRESHOLD
  const revenge = (s.revenge || []).filter((r) => r.until > Date.now())
  const docCost = s.level * 150
  const me = { name: s.bossName, factionId: s.factionId, respect: respectOf(s), me: true }
  const board = [...s.leaderboard, me].sort((a, b) => b.respect - a.respect)
  const myIdx = board.findIndex((b) => b.me)
  const nearby = board.slice(Math.max(0, myIdx - 4), myIdx + 5)
  const recent = s.log.filter((l) => l.kind === 'win' || l.kind === 'loss').slice(0, 6)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Your Attack" value={fmt(d.pAtk)} color="#F87171" sub={d.crit > 0 ? `${Math.round(d.crit * 100)}% crit` : undefined} />
        <Stat label="Your Defense" value={fmt(d.pDef)} color="#60A5FA" />
        <Stat label="Record" value={`${s.stats.fightsWon}W – ${s.stats.fightsLost}L`} sub={`Defended ${s.stats.defendedWon}W / ${s.stats.defendedLost}L`} />
        <Stat label="Unbanked Cash" value={money(s.cash)} color="#4ADE80" sub="Rivals can steal this" />
      </div>

      {injured && (
        <div className="panel flex flex-col gap-3 border-red-500/50 bg-red-950/30 p-4 sm:flex-row sm:items-center">
          <Stethoscope className="text-red-300" />
          <div className="flex-1 text-sm text-red-100">You're in the hospital (Health below {HOSPITAL_THRESHOLD}). You can't fight or be targeted until you heal.</div>
          <button className="classic-btn classic-btn-gold" disabled={s.cash < docCost} onClick={() => run(healAtDoctor)}>Street Doctor · {money(docCost)}</button>
        </div>
      )}

      {revenge.length > 0 && (
        <Section flush title={<span className="flex items-center gap-1.5 text-red-400"><Flame size={15} /> Revenge List</span>}
          right={<span className="text-[11px] text-stone-400">+50% cash &amp; XP · 24h to strike back</span>}>
          {revenge.map((r) => {
            const f = getFaction(r.factionId)
            const o = odds(d.pAtk, r.def * (1 - d.pen))
            const down = r.health < HOSPITAL_THRESHOLD
            const hrs = Math.max(1, Math.ceil((r.until - Date.now()) / 3600000))
            return (
              <div key={r.id} className="row" style={{ background: 'rgba(150,20,20,.12)' }}>
                <Avatar factionId={r.factionId} rank={r.rank} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold text-stone-100">{r.name}</div>
                  <div className="truncate text-[11px]" style={{ color: f.accent }}>{f.ranks[r.rank].title} · {f.name}</div>
                  <div className="text-[11px] text-red-300">Stole {money(r.stolen)} from you · {hrs}h left</div>
                </div>
                <span className="hidden w-16 text-center font-bold text-stone-200 sm:block">{r.level}</span>
                <span className="hidden w-20 text-center font-bold sm:block" style={{ color: o.color }}>{o.label}</span>
                <button className="classic-btn w-24 shrink-0" style={{ '--accent': '#C8272D' }} disabled={s.stamina < 1 || injured || down} onClick={() => run(attackRival, r.id)}>
                  <Flame size={12} /> Revenge
                </button>
              </div>
            )
          })}
        </Section>
      )}

      <Section
        flush
        title="Rival Bosses"
        right={<button className="classic-btn-dark" onClick={() => run(refreshRivals)}><RefreshCw size={12} /> New rivals</button>}
      >
        <div className="row hidden bg-black/40 py-1 sm:flex">
          <span className="k flex-1">Boss</span><span className="k w-16 text-center">Level</span><span className="k w-16 text-center">Family</span><span className="k w-20 text-center">Odds</span><span className="w-24" />
        </div>
        <div>
          {s.rivals.map((r) => {
            const f = getFaction(r.factionId)
            const o = odds(d.pAtk, r.def * (1 - d.pen))
            const down = r.health < HOSPITAL_THRESHOLD
            return (
              <div key={r.id} className="row">
                <Avatar factionId={r.factionId} rank={r.rank} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold text-stone-100">{r.name}</div>
                  <div className="truncate text-[11px]" style={{ color: f.accent }}>{f.ranks[r.rank].title} · {f.name}</div>
                  <div className="mt-0.5 w-24"><Bar value={r.health} max={100} color={down ? '#F87171' : '#4ADE80'} height={3} /></div>
                  <div className="text-[11px] text-stone-400 sm:hidden">Lv {r.level} · Family {r.family} · <span style={{ color: o.color }}>{o.label}</span></div>
                </div>
                <span className="hidden w-16 text-center font-bold text-stone-200 sm:block">{r.level}</span>
                <span className="hidden w-16 text-center text-stone-300 sm:block">{r.family}</span>
                <span className="hidden w-20 text-center font-bold sm:block" style={{ color: o.color }}>{o.label}</span>
                <button className="classic-btn w-24 shrink-0" disabled={s.stamina < 1 || injured || down} onClick={() => run(attackRival, r.id)}>
                  <Swords size={12} /> {down ? 'KO' : 'Attack'}
                </button>
              </div>
            )
          })}
        </div>
        <p className="px-3 py-2 text-[11px] text-stone-500">Each attack costs 1 Stamina. Win to steal 10–15% of their unbanked cash. Rivals also raid you while you're away, so bank your cash.</p>
      </Section>

      <div className="grid gap-3 lg:grid-cols-2">
        <Section title="Global Syndicate Leaderboard" right={<span className="flex items-center gap-1 text-sm font-bold text-gold"><Star size={14} fill="#D4AF37" /> #{cityRank(s)}</span>}>
          <div className="space-y-1">
            {nearby.map((b) => {
              const pos = board.indexOf(b) + 1
              const f = getFaction(b.factionId)
              return (
                <div key={pos} className={`flex items-center gap-3 rounded-md px-2 py-1.5 text-sm ${b.me ? 'bg-white/10 font-bold' : ''}`}>
                  <span className="w-8 text-right tabular-nums text-stone-400">#{pos}</span>
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: f.accent }} />
                  <span className="flex-1 truncate text-stone-200">{b.name}{b.me && ' (you)'}</span>
                  <span className="tabular-nums text-stone-400">{fmt(b.respect)}</span>
                </div>
              )
            })}
          </div>
        </Section>
        <Section title="Battle Log">
          {recent.length === 0 ? <p className="text-sm text-stone-500">No fights yet.</p> : (
            <ul className="space-y-2">
              {recent.map((l) => (
                <li key={l.id} className="border-l-2 pl-3 text-sm text-stone-300" style={{ borderColor: l.kind === 'win' ? '#4ADE80' : '#F87171' }}>{l.text}</li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  )
}
