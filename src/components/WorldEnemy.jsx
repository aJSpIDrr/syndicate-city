import { Crosshair, MapPin, Timer, Skull, Zap, Grab, Lock } from 'lucide-react'
import { getFaction } from '../data/factions'
import { DISTRICTS, WORLD, getItem } from '../data/content'
import { attackWorld, worldTemplate, worldTarget, worldTotals, worldTurf, fmt, HOSPITAL_THRESHOLD } from '../game/engine'
import Avatar from './Avatar'
import { fmtLeft } from './tabs/PerksTab'

function HpBar({ hp, max, height = 6, color = '#DC2626' }) {
  return (
    <div className="w-full overflow-hidden rounded-sm border border-black bg-black/70" style={{ height }}>
      <div className="h-full transition-[width] duration-300" style={{ width: `${Math.max(0, (hp / max) * 100)}%`, background: `linear-gradient(90deg, ${color}, #F87171)` }} />
    </div>
  )
}

export default function WorldEnemy({ s, run }) {
  const now = Date.now()
  if (s.level < WORLD.unlockLevel) {
    return (
      <div className="box flex items-center gap-3 p-3 text-[12px] text-stone-400">
        <Lock size={16} /> World Enemies start roaming the city at Level {WORLD.unlockLevel}.
      </div>
    )
  }
  const w = s.world
  if (!w) return null
  const t = worldTemplate(w)
  const f = getFaction(w.faction)
  const where = DISTRICTS.find((x) => x.id === w.location)
  const totals = worldTotals(w)
  const share = Math.round((w.damage / Math.max(1, w.damage + w.npcDamage)) * 100)
  const trophy = getItem(t.trophy)
  const haveTrophy = (s.inventory[t.trophy] || 0) > 0

  if (w.defeated || w.escaped) {
    return (
      <div className="box p-3">
        <div className="flex items-center gap-2 text-[12px]">
          <Skull size={16} className={w.defeated ? 'text-gold' : 'text-stone-500'} />
          <span className="font-bold text-stone-200">{w.defeated ? `${t.name} has been destroyed.` : `${t.name} escaped the city.`}</span>
          <span className="ml-auto flex items-center gap-1 text-stone-400"><Timer size={12} /> Next threat in {fmtLeft(w.cooldownUntil - now)}</span>
        </div>
      </div>
    )
  }

  const target = worldTarget(w)
  const turf = worldTurf(s, w)
  const canAttack = s.stamina >= WORLD.stamina && s.energy >= WORLD.energy && s.health >= HOSPITAL_THRESHOLD
  return (
    <section className="box" style={{ borderColor: '#7F1D1D', boxShadow: '0 0 18px rgba(220,38,38,.25)' }}>
      <div className="box-head" style={{ background: 'linear-gradient(180deg, #4A0D0D, #120607)', borderBottomColor: '#DC2626' }}>
        <span className="flex items-center gap-1.5 text-red-300"><Skull size={15} /> World Enemy · {t.name}</span>
        <span className="flex items-center gap-1 font-sans text-[11px] normal-case tracking-normal text-stone-300"><Timer size={12} /> Escapes in {fmtLeft(w.expiresAt - now)}</span>
      </div>
      <div className="p-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
          <span className="italic text-stone-400">{t.blurb}</span>
          <span className="flex items-center gap-1 font-bold text-stone-200"><MapPin size={12} className="text-red-400" /> {where.name}, {where.city}</span>
          <span className="text-stone-500">moves in {fmtLeft(w.nextMove - now)}</span>
          {turf && <span className="chip bg-green-900/50 text-green-300">Your turf +{Math.round(WORLD.turfBonus * 100)}% damage</span>}
        </div>

        {/* Crew */}
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {w.members.map((m, i) => {
            const down = m.hp <= 0
            const isTarget = target.kind === 'member' && target.index === i
            return (
              <div key={i} className={`rounded border p-1.5 text-center ${isTarget ? 'border-red-500 bg-red-950/40' : 'border-[#2A2E35] bg-black/30'} ${down ? 'opacity-40' : ''}`}>
                <div className="relative mx-auto w-fit">
                  <Avatar factionId={w.faction} rank={m.rank} size={48} locked={down} />
                  {down && <Crosshair size={30} className="absolute inset-0 m-auto text-red-500" />}
                </div>
                <div className="mt-1 truncate text-[10px] font-bold text-stone-200">{m.name}</div>
                <HpBar hp={m.hp} max={m.max} height={4} />
              </div>
            )
          })}
        </div>

        {/* Leader */}
        <div className={`mt-3 flex items-center gap-3 rounded border p-2 ${target.kind === 'leader' ? 'border-red-500 bg-red-950/40' : 'border-[#2A2E35] bg-black/30'}`}>
          <Avatar factionId={w.faction} rank={9} size={72} />
          <div className="min-w-0 flex-1">
            <div className="k text-red-400">Leader</div>
            <div className="font-display text-lg font-bold text-stone-100">{w.leader.name}</div>
            <HpBar hp={w.leader.hp} max={w.leader.max} height={10} />
            <div className="mt-0.5 flex justify-between text-[11px] text-stone-400">
              <span>{fmt(Math.ceil(w.leader.hp))} / {fmt(w.leader.max)} HP</span>
              <span>{target.kind === 'leader' ? 'Exposed!' : `Shielded by ${w.members.filter((m) => m.hp > 0).length} crew`}</span>
            </div>
          </div>
          <div className="hidden w-36 text-[11px] sm:block">
            <div className="k">Leader drops</div>
            <div className="font-bold text-gold">+{10 + Math.floor(s.level / 3)} Gold</div>
            <div className={haveTrophy ? 'text-stone-500' : 'font-bold text-gold'}>{haveTrophy ? 'Trophy owned' : trophy.name}</div>
          </div>
        </div>

        {/* Progress + attack */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="min-w-[200px] flex-1">
            <div className="flex justify-between text-[11px] text-stone-400">
              <span>Crew strength {Math.round((totals.left / totals.max) * 100)}%</span>
              <span>Your share of the damage: <b className="text-stone-200">{share}%</b></span>
            </div>
            <HpBar hp={totals.left} max={totals.max} height={8} color="#991B1B" />
            <div className="mt-0.5 text-[10px] text-stone-500">Rival bosses are hitting them too, but only you can finish the leader.</div>
          </div>
          <button className="classic-btn w-full sm:w-auto" style={{ '--accent': '#DC2626' }} disabled={!canAttack} onClick={() => run(attackWorld)}>
            <Crosshair size={13} /> Attack {target.unit.name.split(' ')[0]}
            <span className="ml-1 flex items-center gap-0.5 normal-case opacity-80"><Grab size={11} />{WORLD.stamina} <Zap size={11} />{WORLD.energy}</span>
          </button>
        </div>
      </div>
    </section>
  )
}
