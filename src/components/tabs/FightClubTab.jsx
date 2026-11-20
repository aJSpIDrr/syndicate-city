import { RefreshCw, Swords, Stethoscope, Star } from 'lucide-react'
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
  const docCost = s.level * 150
  const me = { name: s.bossName, factionId: s.factionId, respect: respectOf(s), me: true }
  const board = [...s.leaderboard, me].sort((a, b) => b.respect - a.respect)
  const myIdx = board.findIndex((b) => b.me)
  const nearby = board.slice(Math.max(0, myIdx - 4), myIdx + 5)
  const recent = s.log.filter((l) => l.kind === 'win' || l.kind === 'loss').slice(0, 6)

  return (
    <div className="space-y-4">
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
          <button className="btn-gold" disabled={s.cash < docCost} onClick={() => run(healAtDoctor)}>Street Doctor · {money(docCost)}</button>
        </div>
      )}

      <Section
        title="Rival Bosses"
        right={<button className="btn-ghost px-2.5 py-1.5 text-xs" onClick={() => run(refreshRivals)}><RefreshCw size={14} /> New rivals</button>}
      >
        <div className="grid gap-2 lg:grid-cols-2">
          {s.rivals.map((r) => {
            const f = getFaction(r.factionId)
            const o = odds(d.pAtk, r.def * (1 - d.pen))
            const down = r.health < HOSPITAL_THRESHOLD
            return (
              <div key={r.id} className="flex items-center gap-3 rounded-lg border border-line bg-black/20 p-2.5">
                <Avatar factionId={r.factionId} rank={r.rank} size={56} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-stone-100">{r.name}</div>
                  <div className="truncate text-xs" style={{ color: f.accent }}>{f.ranks[r.rank].title} · {f.name}</div>
                  <div className="mt-0.5 text-xs text-stone-400">Lv {r.level} · Family {r.family} · <span style={{ color: o.color }}>{o.label}</span></div>
                  <div className="mt-1 w-28"><Bar value={r.health} max={100} color={down ? '#F87171' : '#4ADE80'} height={3} /></div>
                </div>
                <button className="btn-accent shrink-0" disabled={s.stamina < 1 || injured || down} onClick={() => run(attackRival, r.id)}>
                  <Swords size={15} /> {down ? 'KO' : 'Attack'}
                </button>
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-stone-500">Each attack costs 1 Stamina. Win to steal 10–15% of their unbanked cash. Rivals also raid you while you're away, so bank your cash.</p>
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
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
