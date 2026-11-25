import { useState } from 'react'
import { Zap, Lock, Star, Skull, Trophy } from 'lucide-react'
import { DISTRICTS, JOBS, STARS, MASTERY_REWARD, BOSSES, getItem, getContraband } from '../../data/content'
import { doJob, doJobRepeat, jobBlockers, districtUnlocked, money, bossUnlocked, bossState, bossStats, attackBoss, fmt, HOSPITAL_THRESHOLD } from '../../game/engine'
import { ItemArt } from '../ui'
import { ASSET_MAP } from '../../assetMap'
import { DistrictScene } from '../../art/Scenes'

const STAR_COLORS = ['#57534E', '#CD7F32', '#C0C0C0', '#D4AF37']

export default function JobsTab({ s, d, run }) {
  const unlocked = DISTRICTS.filter((x) => districtUnlocked(s, x.id))
  const [district, setDistrict] = useState(unlocked[unlocked.length - 1]?.id || 'docks')
  const dist = DISTRICTS.find((x) => x.id === district)
  const jobs = JOBS.filter((j) => j.district === district)
  const pk = d.perks
  const distStars = jobs.reduce((t, j) => t + (s.mastery[j.id]?.star || 0), 0)

  return (
    <div className="space-y-3">
      {/* District selector */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {DISTRICTS.map((x) => {
          const open = districtUnlocked(s, x.id)
          const active = district === x.id
          const img = ASSET_MAP.districts[x.id]
          return (
            <button key={x.id} onClick={() => setDistrict(x.id)}
              className="relative h-14 w-28 shrink-0 overflow-hidden rounded border-2 text-left"
              style={{ borderColor: active ? 'var(--accent)' : '#2A2E35' }}>
              {img ? <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <DistrictScene id={x.id} className={open ? '' : 'opacity-40 grayscale'} />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="relative flex h-full flex-col justify-end px-1.5 pb-1">
                <div className={`text-[11px] font-bold leading-tight ${open ? 'text-white' : 'text-stone-500'}`}>{x.name}</div>
                <div className="flex items-center gap-1 text-[9px] uppercase text-stone-400">{open ? x.city : <><Lock size={8} /> Lv {x.level}</>}</div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="box">
        <div className="box-head">
          <span>{dist.city} · {dist.name}</span>
          <span className="flex items-center gap-1 text-[11px] normal-case tracking-normal text-stone-400">
            <Star size={12} fill="#D4AF37" color="#D4AF37" /> {distStars}/{jobs.length * 3} mastery stars
          </span>
        </div>
        <div>
          {jobs.map((job, ji) => {
            const blockers = jobBlockers(s, job)
            const m = s.mastery[job.id] || { pct: 0, star: 0 }
            const lowEnergy = s.energy < job.energy
            const cMin = Math.floor(job.cashMin * (1 + (pk.jobCash || 0)))
            const cMax = Math.floor(job.cashMax * (1 + (pk.jobCash || 0)))
            const xp = Math.round(job.xp * (1 + (pk.jobXp || 0)))
            const banner = ASSET_MAP.jobBanners[job.id]
            const reqs = [job.req.family && `Crew Size ${job.req.family}+`, ...Object.entries(job.req.items || {}).map(([id, q]) => `${q}x ${getItem(id).name}`)].filter(Boolean)
            return (
              <div key={job.id} className="row flex-wrap sm:flex-nowrap">
                <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-100">{job.name}</span>
                    <span className="flex">{[1, 2, 3].map((i) => <Star key={i} size={11} fill={m.star >= i ? STAR_COLORS[i] : 'transparent'} color={STAR_COLORS[i]} />)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <div className="h-1.5 w-28 shrink-0 overflow-hidden rounded-sm bg-black/60">
                      <div className="h-full" style={{ width: `${m.pct}%`, background: STAR_COLORS[Math.min(3, m.star + 1)] }} />
                    </div>
                    <span className="truncate text-[10px] text-stone-500">{m.star >= 3 ? 'Mastered' : `${STARS[m.star + 1]} ${m.pct}% · +3 Gold, ${MASTERY_REWARD[job.mastery].text}`}</span>
                  </div>
                  {job.drops.map((dr) => (
                    <div key={dr.id} className="text-[11px] text-stone-500">Loot: {dr.kind === 'item' ? getItem(dr.id).name : getContraband(dr.id).name} ({Math.round(dr.chance * (1 + (pk.loot || 0)) * 100)}%)</div>
                  ))}
                </div>
                <div className="w-[46%] shrink-0 text-[12px] sm:w-36">
                  <div className="k">Requires</div>
                  <div className="flex items-center gap-1 font-bold text-blue-300"><Zap size={12} /> {job.energy} Energy</div>
                  {reqs.map((r) => (
                    <div key={r} className={blockers.includes(r) ? 'text-red-400' : 'text-stone-400'}>{r}</div>
                  ))}
                </div>
                <div className="w-[46%] shrink-0 text-[12px] sm:w-32">
                  <div className="k">Payout</div>
                  <div className="font-bold text-green-400">{money(cMin)}–{money(cMax)}</div>
                  <div className="text-stone-300">+{xp} Exp</div>
                </div>
                <div className="flex w-full shrink-0 gap-1 sm:w-32">
                  <button className="classic-btn flex-1" disabled={blockers.length > 0 || lowEnergy} onClick={() => run(doJob, job.id)}>
                    {blockers.length ? <><Lock size={12} /> Locked</> : lowEnergy ? 'No Energy' : 'Do Job'}
                  </button>
                  {!blockers.length && (
                    <button className="classic-btn-dark" disabled={s.energy < job.energy * 2} onClick={() => run(doJobRepeat, job.id, 5)} title="Repeat up to 5 times">x5</button>
                  )}
                </div>
              </div>
            )
          })}
          <BossRow s={s} d={d} run={run} districtId={district} />
        </div>
      </div>
    </div>
  )
}

function BossRow({ s, d, run, districtId }) {
  const b = BOSSES[districtId]
  const unlocked = bossUnlocked(s, districtId)
  const bs = bossState(s, districtId)
  const st = bossStats(districtId)
  const ratio = d.pAtk / Math.max(1, st.def * (1 - d.pen))
  const odds = ratio > 1.2 ? ['Favored', '#4ADE80'] : ratio > 0.85 ? ['Even', '#FACC15'] : ratio > 0.6 ? ['Tough', '#FB923C'] : ['Brutal', '#F87171']
  const reward = getItem(b.reward.item)
  return (
    <div className="flex flex-wrap items-center gap-3 border-t-2 px-3 py-3 sm:flex-nowrap" style={{ borderColor: 'var(--accent)', background: 'linear-gradient(90deg, rgba(120,0,0,.25), transparent)' }}>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-red-800 bg-black/60">
        {ASSET_MAP.bosses[districtId]
          ? <img src={ASSET_MAP.bosses[districtId]} alt="" className="h-full w-full rounded-full object-cover" style={unlocked ? undefined : { filter: 'grayscale(1) brightness(.4)' }} />
          : bs.defeated ? <Trophy size={26} className="text-gold" /> : <Skull size={28} className={unlocked ? 'text-red-400' : 'text-stone-600'} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="k text-red-400">District Boss</div>
        <div className="font-bold text-stone-100">{b.name}</div>
        {bs.defeated ? (
          <div className="text-[12px] text-green-400">Defeated. This district is yours.</div>
        ) : unlocked ? (
          <>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-2.5 w-40 overflow-hidden rounded-sm border border-black bg-black/70"><div className="h-full bg-gradient-to-r from-red-700 to-red-500" style={{ width: `${bs.hp}%` }} /></div>
              <span className="text-[11px] font-bold text-red-300">{bs.hp}%</span>
            </div>
            <div className="text-[11px] text-stone-400">Lv {b.level} · Crew {st.family} · Odds <b style={{ color: odds[1] }}>{odds[0]}</b> · costs <span className="text-blue-300">{b.energy} Energy</span> per hit</div>
          </>
        ) : (
          <div className="text-[12px] text-stone-500">Earn Bronze mastery on the first three jobs in this district to call him out.</div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="h-12 w-12 rounded border-2 border-gold/60 bg-black/40" title={reward.name}><ItemArt kind="item" id={reward.id} category={reward.category} rarity={reward.rarity} size={44} /></div>
        <div className="w-28 text-[11px]">
          <div className="k">Reward</div>
          <div className="truncate font-bold text-gold">{reward.name}</div>
          <div className="text-stone-400">+{b.reward.gold} Gold · {money(b.reward.cash)}</div>
          <div className="text-stone-500">{reward.atk} Atk / {reward.def} Def</div>
        </div>
      </div>
      {!bs.defeated && (
        <button className="classic-btn w-full shrink-0 sm:w-28" style={{ '--accent': '#C8272D' }}
          disabled={!unlocked || s.energy < b.energy || s.health < HOSPITAL_THRESHOLD} onClick={() => run(attackBoss, districtId)}>
          {!unlocked ? <><Lock size={12} /> Locked</> : <><Skull size={12} /> Attack</>}
        </button>
      )}
    </div>
  )
}
