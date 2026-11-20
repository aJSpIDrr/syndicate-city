import { useState } from 'react'
import { Zap, Lock, Star } from 'lucide-react'
import { DISTRICTS, JOBS, STARS, MASTERY_REWARD, getItem, getContraband } from '../../data/content'
import { doJob, jobBlockers, districtUnlocked, money } from '../../game/engine'
import { ASSET_MAP } from '../../assetMap'
import { Bar } from '../ui'
import { DistrictScene } from '../../art/Scenes'

const STAR_COLORS = ['#57534E', '#CD7F32', '#C0C0C0', '#D4AF37']

export default function JobsTab({ s, d, run }) {
  const unlocked = DISTRICTS.filter((x) => districtUnlocked(s, x.id))
  const [district, setDistrict] = useState(unlocked[unlocked.length - 1]?.id || 'docks')
  const jobs = JOBS.filter((j) => j.district === district)
  const pk = d.perks

  return (
    <div className="space-y-4">
      {/* District carousel */}
      <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
        {DISTRICTS.map((dist) => {
          const open = districtUnlocked(s, dist.id)
          const active = district === dist.id
          const img = ASSET_MAP.districts[dist.id]
          return (
            <button
              key={dist.id}
              onClick={() => setDistrict(dist.id)}
              className="relative h-20 w-36 shrink-0 snap-start overflow-hidden rounded-xl border text-left transition"
              style={{ borderColor: active ? 'var(--accent)' : '#2A2E35', background: `linear-gradient(135deg, ${dist.tint}, #0B0C0E)` }}
            >
              {img ? <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" /> : <DistrictScene id={dist.id} className={open ? '' : 'opacity-40 grayscale'} />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-2">
                <div className="text-[10px] uppercase tracking-widest text-stone-400">{dist.city}</div>
                <div className={`text-sm font-bold ${open ? 'text-white' : 'text-stone-500'}`}>{dist.name}</div>
                {!open && <div className="flex items-center gap-1 text-[10px] text-stone-400"><Lock size={10} /> Level {dist.level}</div>}
              </div>
              {active && <div className="absolute inset-x-0 top-0 h-1" style={{ background: 'var(--accent)' }} />}
            </button>
          )
        })}
      </div>

      {/* Job cards */}
      <div className="space-y-3">
        {jobs.map((job, ji) => {
          const blockers = jobBlockers(s, job)
          const m = s.mastery[job.id] || { pct: 0, star: 0 }
          const lowEnergy = s.energy < job.energy
          const cMin = Math.floor(job.cashMin * (1 + (pk.jobCash || 0)))
          const cMax = Math.floor(job.cashMax * (1 + (pk.jobCash || 0)))
          const xp = Math.round(job.xp * (1 + (pk.jobXp || 0)))
          const dist = DISTRICTS.find((x) => x.id === job.district)
          const banner = ASSET_MAP.jobBanners[job.id]
          return (
            <div key={job.id} className="panel flex flex-col overflow-hidden sm:flex-row">
              <div className="relative h-16 shrink-0 sm:h-auto sm:w-48" style={{ background: `linear-gradient(135deg, ${dist.tint}, #0B0C0E)` }}>
                {banner ? <img src={banner} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <DistrictScene id={job.district} align={['xMinYMid', 'xMidYMid', 'xMaxYMid'][ji % 3]} />}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />
                <div className="absolute bottom-2 left-2 flex gap-0.5">
                  {[1, 2, 3].map((i) => <Star key={i} size={14} fill={m.star >= i ? STAR_COLORS[i] : 'transparent'} color={STAR_COLORS[Math.max(1, i)]} />)}
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-stone-100">{job.name}</div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span className="flex items-center gap-1 text-blue-300"><Zap size={14} /> {job.energy}</span>
                    <span className="text-green-400">{money(cMin)} – {money(cMax)}</span>
                    <span className="text-stone-300">+{xp} XP</span>
                  </div>
                  <div className="mt-1.5 text-xs text-stone-400">
                    {job.drops.map((dr) => (
                      <span key={dr.id}>Drops: {dr.kind === 'item' ? getItem(dr.id).name : getContraband(dr.id).name} ({Math.round(dr.chance * (1 + (pk.loot || 0)) * 100)}%)</span>
                    ))}
                    {blockers.length > 0 && <span className="ml-2 text-red-300">Needs: {blockers.join(', ')}</span>}
                    {blockers.length === 0 && (job.req.family || job.req.items) && (
                      <span className="ml-2 text-stone-500">Req: {[job.req.family && `Family ${job.req.family}+`, ...Object.entries(job.req.items || {}).map(([id, q]) => `${q}x ${getItem(id).name}`)].filter(Boolean).join(', ')}</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-40"><Bar value={m.pct} max={100} color={STAR_COLORS[Math.min(3, m.star + 1)]} height={5} /></div>
                    <span className="text-[11px] text-stone-400">
                      {m.star >= 3 ? 'Gold Mastery complete' : `${STARS[m.star + 1]} Mastery ${m.pct}% · reward +3 Gold, ${MASTERY_REWARD[job.mastery].text}`}
                    </span>
                  </div>
                </div>
                <button
                  className="btn-accent w-full shrink-0 sm:w-36"
                  disabled={blockers.length > 0 || lowEnergy}
                  onClick={() => run(doJob, job.id)}
                >
                  {blockers.length ? 'Locked' : lowEnergy ? 'Need Energy' : 'Perform Job'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
