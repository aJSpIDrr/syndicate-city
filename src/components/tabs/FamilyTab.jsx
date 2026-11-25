import { Lock, Swords, Shield, Heart, Zap, Grab, UserPlus } from 'lucide-react'
import { getFaction, formatPerk, RANK_LEVELS, weaponName } from '../../data/factions'
import { hireCost, spendSkill, hireCrew, money, fmt, MAX_FAMILY } from '../../game/engine'
import Avatar, { frameTier } from '../Avatar'
import { Section, Stat } from '../ui'

const SKILLS = [
  { id: 'attack', label: 'Attack', icon: Swords, gain: '+1 Attack', cost: 1 },
  { id: 'defense', label: 'Defense', icon: Shield, gain: '+1 Defense', cost: 1 },
  { id: 'maxHealth', label: 'Max Health', icon: Heart, gain: '+10 Max Health', cost: 1 },
  { id: 'maxEnergy', label: 'Max Energy', icon: Zap, gain: '+2 Max Energy', cost: 1 },
  { id: 'maxStamina', label: 'Max Stamina', icon: Grab, gain: '+1 Max Stamina', cost: 2 },
]

export default function FamilyTab({ s, d, run }) {
  const f = getFaction(s.factionId)
  const rank = f.ranks[d.rank]
  const next = f.ranks[d.rank + 1]
  const values = { attack: d.attack, defense: d.defense, maxHealth: d.maxHealth, maxEnergy: d.maxEnergy, maxStamina: d.maxStamina }

  return (
    <div className="space-y-3">
      {/* Showcase */}
      <Section>
        <div className="flex flex-col gap-5 sm:flex-row">
          <Avatar factionId={s.factionId} rank={d.rank} size={180} className="mx-auto sm:mx-0" />
          <div className="min-w-0 flex-1">
            <div className="label" style={{ color: f.accent }}>Rank {d.rank + 1} of 10 · {frameTier(d.rank).name} Frame</div>
            <h2 className="h-title mt-1 text-3xl">{rank.title}</h2>
            <p className="mt-1 text-sm italic text-stone-400">{rank.look}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Object.entries(rank.perks).map(([k, v]) => (
                <span key={k} className="chip border" style={{ borderColor: f.accent, color: f.accent }}>{formatPerk(k, v)}</span>
              ))}
            </div>
            {next ? (
              <p className="mt-3 text-sm text-stone-400">Next: <span className="font-semibold text-stone-200">{next.title}</span> at Level {RANK_LEVELS[d.rank + 1]}</p>
            ) : (
              <p className="mt-3 text-sm font-semibold text-gold">You sit at the very top of {f.name}.</p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Attack Power" value={fmt(d.pAtk)} color="#F87171" />
              <Stat label="Defense Power" value={fmt(d.pDef)} color="#60A5FA" />
              <Stat label="Crew Size" value={`${s.family}/${MAX_FAMILY}`} />
              <Stat label="Mentor" value={f.mentor} />
            </div>
          </div>
        </div>
      </Section>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Skill points */}
        <Section title="Skill Points" right={<span className="chip bg-gold/20 text-gold">{s.skillPoints} available</span>}>
          <div className="space-y-2">
            {SKILLS.map((sk) => (
              <div key={sk.id} className="flex items-center gap-3 rounded-lg border border-line bg-black/20 px-3 py-2">
                <sk.icon size={18} className="text-stone-400" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-stone-200">{sk.label} <span className="ml-1 tabular-nums text-stone-400">{fmt(values[sk.id])}</span></div>
                  <div className="text-xs text-stone-500">{sk.cost} SP → {sk.gain}</div>
                </div>
                <button className="classic-btn px-3 py-1.5" disabled={s.skillPoints < sk.cost} onClick={() => run(spendSkill, sk.id)}>+</button>
              </div>
            ))}
          </div>
        </Section>

        {/* Crew */}
        <Section title="Recruit Crew">
          <p className="mb-3 text-sm text-stone-400">
            Each crew member carries one of your best weapons and every member uses an armor and vehicle. Your Boss always wields the {weaponName(f, s.sigTier)}.
          </p>
          <div className="mb-3 grid grid-cols-3 gap-2">
            <Stat label="Weapons in use" value={`${d.equipped.weapons}/${s.family - 1}`} />
            <Stat label="Armor in use" value={`${d.equipped.armor}/${s.family}`} />
            <Stat label="Vehicles in use" value={`${d.equipped.vehicles}/${s.family}`} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-stone-300">Next recruit: <b className="text-green-400">{money(hireCost(s))}</b></span>
            <div className="ml-auto flex gap-2">
              {[1, 5, 10].map((n) => (
                <button key={n} className="classic-btn" disabled={s.family >= MAX_FAMILY || s.cash < hireCost(s)} onClick={() => run(hireCrew, n)}>
                  <UserPlus size={15} /> {n}
                </button>
              ))}
            </div>
          </div>
          {d.perks.crewCost > 0 && <p className="mt-2 text-xs" style={{ color: f.accent }}>Faction perk: {formatPerk('crewCost', d.perks.crewCost)}</p>}
        </Section>
      </div>

      {/* Rank ladder */}
      <Section title={`${f.name} Rank Ladder`}>
        <div className="grid gap-2 sm:grid-cols-2">
          {f.ranks.map((rk, i) => {
            const unlocked = i <= d.rank
            const current = i === d.rank
            return (
              <div key={i} className={`flex gap-3 rounded-lg border p-2.5 ${current ? 'bg-white/5' : 'bg-black/20'}`} style={{ borderColor: current ? f.accent : '#2A2E35' }}>
                <Avatar factionId={s.factionId} rank={i} size={64} locked={!unlocked} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-stone-500">R{i + 1} · Lv {RANK_LEVELS[i]}{i === 9 ? '+' : ''}</span>
                    {!unlocked && <Lock size={12} className="text-stone-500" />}
                    {current && <span className="chip text-ink" style={{ background: f.accent }}>CURRENT</span>}
                  </div>
                  <div className={`font-semibold ${unlocked ? 'text-stone-100' : 'text-stone-400'}`}>{rk.title}</div>
                  <div className="mt-0.5 text-[11px] leading-snug text-stone-400">{Object.entries(rk.perks).map(([k, v]) => formatPerk(k, v)).join(' · ')}</div>
                </div>
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
