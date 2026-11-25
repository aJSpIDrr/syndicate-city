import { useState } from 'react'
import { Lock, Crown, Swords, Shield, Coins, Zap, Grab } from 'lucide-react'
import { ZONES, TURF_WAR } from '../../data/hq'
import { getFaction } from '../../data/factions'
import {
  heldZones, zoneUnlocked, zoneStrength, zoneDefense, attackZone, fortifyZone, fortifyCost, cityIncome, collectTurf,
} from '../../game/hq'
import { money, fmt } from '../../game/engine'
import { Section, Stat, Bar } from '../ui'
import { ONLINE } from '../../game/online'
import Avatar from '../Avatar'

const emblem = (id) => (id === 'mafiahq' ? null : `./art/turf/${id}.jpg`)

export default function TurfTab({ s, d, run }) {
  const [sel, setSel] = useState('newyork')
  const held = heldZones(s)
  const z = ZONES.find((x) => x.id === sel)
  const st = s.city.zones[sel]
  const mine = st.owner === 'you'
  const open = zoneUnlocked(s, z)
  const ratio = d.pAtk * (1 + (d.perks.turfAtk || 0)) / Math.max(1, zoneStrength(s, z, d) * (1 - d.pen))
  const odds = ratio > 1.3 ? ['Easy', '#4ADE80'] : ratio > 1.0 ? ['Favored', '#A3E635'] : ratio > 0.75 ? ['Even', '#FACC15'] : ['Tough', '#F87171']
  const canHit = open && s.energy >= TURF_WAR.energy && s.stamina >= TURF_WAR.stamina && s.health >= 20
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Zones held" value={`${held.length}/${ZONES.length}`} color="#D4AF37" />
        <Stat label="Turf income" value={`${money(cityIncome(s))}/hr`} color="#4ADE80" />
        <Stat label="Waiting" value={money(s.city.pending)} color="#4ADE80" sub="Holds up to 24h" />
        <div className="flex items-center rounded-lg border border-line bg-black/20 px-3 py-2">
          <button className="classic-btn classic-btn-gold w-full" disabled={s.city.pending < 1} onClick={() => run(collectTurf)}><Coins size={12} /> Collect</button>
        </div>
      </div>

      {/* City map */}
      <section className="box">
        <div className="box-head"><span>The City · Turf Wars</span><span className="font-sans text-[11px] normal-case tracking-normal text-stone-400">Open to every boss. Tap a zone.</span></div>
        <div className="relative w-full" style={{ aspectRatio: '1672 / 941' }}>
          <img src="./art/turf/map.jpg" alt="City map" className="absolute inset-0 h-full w-full object-cover" />
          {ZONES.map((zz) => {
            const zs = s.city.zones[zz.id]
            const you = zs.owner === 'you'
            const real = zs.owner === 'player'
            const ok = zoneUnlocked(s, zz)
            const active = sel === zz.id
            return (
              <button key={zz.id} onClick={() => setSel(zz.id)} aria-label={zz.name}
                className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${zz.x}%`, top: `${zz.y + 5.2}%` }}>
                <span className={`flex items-center gap-1 rounded-full border-2 px-1.5 py-0.5 text-[9px] font-extrabold uppercase shadow-lg sm:px-2 sm:text-[10px] ${active ? 'scale-110' : ''}`}
                  style={{ borderColor: you ? '#D4AF37' : real ? '#F472B6' : ok ? '#DC2626' : '#57534E', background: you ? 'rgba(212,175,55,.9)' : real ? 'rgba(110,20,80,.9)' : ok ? 'rgba(120,15,15,.85)' : 'rgba(20,20,20,.85)', color: you ? '#121417' : '#F5F5F4', boxShadow: active ? '0 0 0 3px rgba(255,255,255,.7)' : undefined }}>
                  {zz.crown ? <Crown size={10} /> : you ? <Shield size={10} /> : ok ? <Swords size={10} /> : <Lock size={10} />}
                  <span className="hidden sm:inline">{you ? 'Yours' : ok ? `${zs.garrison}%` : `Lv ${zz.level}`}</span>
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-3 px-3 py-2 text-[11px] text-stone-400">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-gold" /> Yours</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-700" /> AI-held (garrison %)</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-pink-400" /> Held by a real player</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-stone-600" /> Locked</span>
        </div>
      </section>

      {/* Selected zone */}
      <section className="box">
        <div className="flex flex-col gap-3 p-3 sm:flex-row">
          <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded bg-black sm:w-40">
            {emblem(z.id) ? <img src={emblem(z.id)} alt="" className="max-h-full max-w-full object-contain" /> : <div className="text-center"><Crown size={36} className="mx-auto text-gold" /><div className="font-display text-lg font-bold text-gold">MAFIA HQ</div></div>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-xl font-bold text-stone-100">{z.name}</span>
              {mine ? <span className="chip bg-gold text-ink">YOURS</span> : st.owner === 'player' ? <span className="chip bg-pink-900/60 text-pink-200">Held by {st.boss} (real player)</span> : <span className="chip bg-red-900/60 text-red-200">Held by {st.boss}</span>}
            </div>
            <div className="mt-1 text-[12px] text-stone-300">Pays <b className="text-green-400">{money(z.income)}/hr</b> · Bonus while held: <b className="text-gold">{z.bonusText}</b></div>
            <div className="text-[11px] text-stone-500">{z.needHeld ? `Hold ${z.needHeld} other zones and reach Level ${z.level} to move on it.` : `Unlocks at Level ${z.level}.`}</div>
            {mine ? (
              <div className="mt-2 space-y-1.5">
                <div className="text-[12px] text-stone-300">Zone defense <b className="text-blue-300">{fmt(zoneDefense(s, z, d))}</b> · Garrison {st.garrison}% · Fortified {st.fortify}/{TURF_WAR.fortifyMax} · {ONLINE ? 'Other players can attack it; the garrison recovers 8% an hour.' : `Rivals try to take it back about every ${TURF_WAR.retakeEveryHours}h.`}</div>
                <button className="classic-btn" disabled={st.fortify >= TURF_WAR.fortifyMax || s.cash < fortifyCost(s, z.id)} onClick={() => run(fortifyZone, z.id)}>
                  <Shield size={12} /> {st.fortify >= TURF_WAR.fortifyMax ? 'Fully fortified' : `Fortify +12% · ${money(fortifyCost(s, z.id))}`}
                </button>
              </div>
            ) : (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2"><Avatar factionId={st.faction} rank={Math.min(9, Math.floor(z.level / 13))} size={36} />
                  <div className="flex-1"><div className="text-[11px] text-stone-400">{st.boss}'s garrison · {getFaction(st.faction).name}</div><Bar value={st.garrison} max={100} color="#DC2626" height={7} /></div>
                  <span className="text-[12px] font-bold" style={{ color: st.owner === 'player' ? '#F472B6' : odds[1] }}>{st.owner === 'player' ? 'Real boss' : odds[0]}</span></div>
                <button className="classic-btn w-full sm:w-auto" style={{ '--accent': '#DC2626' }} disabled={!canHit} onClick={() => run(attackZone, z.id)}>
                  {!open ? <><Lock size={12} /> Locked</> : <><Swords size={12} /> Attack <span className="ml-1 flex items-center gap-0.5 normal-case opacity-80"><Zap size={11} />{TURF_WAR.energy} <Grab size={11} />{TURF_WAR.stamina}</span></>}
                </button>
                <div className="text-[11px] text-stone-500">Each attack knocks down the garrison. At 0% the zone is yours, plus a cash bonus.</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Section flush title="All Zones">
        {ZONES.map((zz) => {
          const zs = s.city.zones[zz.id]
          const you = zs.owner === 'you'
          return (
            <button key={zz.id} onClick={() => setSel(zz.id)} className={`row w-full text-left hover:bg-white/5 ${sel === zz.id ? 'bg-white/5' : ''}`}>
              <span className="w-36 truncate font-bold text-stone-100">{zz.name}</span>
              <span className="flex-1 truncate text-[11px] text-stone-400">{zz.bonusText}</span>
              <span className="w-24 text-right text-[12px] text-green-400">{money(zz.income)}/hr</span>
              <span className={`w-24 text-right text-[11px] font-bold ${you ? 'text-gold' : zoneUnlocked(s, zz) ? 'text-red-300' : 'text-stone-500'}`}>{you ? 'Yours' : zoneUnlocked(s, zz) ? `${zs.garrison}% left` : `Lv ${zz.level}`}</span>
            </button>
          )
        })}
      </Section>
    </div>
  )
}
