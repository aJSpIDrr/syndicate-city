import { useState } from 'react'
import { Coins, Lock, UserPlus, Gift, UserMinus, RefreshCw, Swords, Timer, Check, MapPin, Flag, Zap, Star, Shuffle } from 'lucide-react'
import { DISTRICTS } from '../../data/content'
import { CLAN, CREST, SPECIALTIES, ROLES, CLAN_UPGRADES, upgradeCost, RIVAL_CLANS, TURF, WAR, HEISTS, CONTRACTS } from '../../data/clan'
import {
  clanLevel, clanSlots, foundClan, donate, hireRecruit, hireCost, giftCost, giftMember, dismissMember, assignRole,
  rerollRecruits, buyClanUpgrade, pushTurf, heldDistricts, declareWar, claimWar, heistChance, startHeist, collectHeist,
  contractReward, claimContract, clanIncomePerHour, memberIncome, rankOfMember, clanPerks,
} from '../../game/clan'
import { money, fmt } from '../../game/engine'
import { ASSET_MAP } from '../../assetMap'
import { DistrictScene } from '../../art/Scenes'
import { Section, Stat, Bar } from '../ui'
import Avatar from '../Avatar'
import Crest from '../Crest'
import { fmtLeft } from './PerksTab'

const SpecChip = ({ spec }) => (
  <span className="chip" style={{ background: `${SPECIALTIES[spec].color}22`, color: SPECIALTIES[spec].color }}>{SPECIALTIES[spec].name}</span>
)
const Skill = ({ v }) => (
  <span className="flex items-center gap-0.5 text-[11px] font-bold text-gold"><Star size={11} fill="#D4AF37" />{v}/10</span>
)

export default function ClanTab({ s, d, run }) {
  if (!s.clan) return <Founding s={s} run={run} />
  return <ClanHome s={s} d={d} run={run} />
}

// ---------- founding ----------
function Founding({ s, run }) {
  const [name, setName] = useState('')
  const [tag, setTag] = useState('')
  const [crest, setCrest] = useState({ shape: 'shield', c1: '#D4AF37', c2: '#111827', symbol: 'crown' })
  const locked = s.level < CLAN.foundLevel
  const set = (k, v) => setCrest((c) => ({ ...c, [k]: v }))
  const surprise = () => setCrest({
    shape: CREST.shapes[Math.floor(Math.random() * CREST.shapes.length)],
    symbol: CREST.symbols[Math.floor(Math.random() * CREST.symbols.length)],
    c1: CREST.colors[Math.floor(Math.random() * 3)], c2: CREST.colors[3 + Math.floor(Math.random() * (CREST.colors.length - 3))],
  })
  return (
    <div className="space-y-3">
      <Section title="Found Your Clan">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="space-y-2 text-[13px] text-stone-300">
            <p>Build a crime family of your own. Recruit AI mobsters, appoint an Underboss and Capos, fill the treasury, take turf from rival clans, go to war and pull off timed heists.</p>
            <ul className="grid gap-1 text-[12px] text-stone-400 sm:grid-cols-2">
              <li>• Members earn, fight and talk in the clan feed</li>
              <li>• Positions give you personal bonuses</li>
              <li>• Turf map: hold districts for income</li>
              <li>• 24-hour wars against rival clans</li>
              <li>• Timed heists with a hand-picked crew</li>
              <li>• Daily contracts, clan levels and upgrades</li>
            </ul>
            {locked ? (
              <div className="flex items-center gap-2 rounded border border-line bg-black/30 p-2 text-stone-400"><Lock size={14} /> Unlocks at Level {CLAN.foundLevel} (you're Level {s.level}).</div>
            ) : (
              <>
                <div className="grid gap-2 sm:grid-cols-[1fr_110px]">
                  <input value={name} onChange={(e) => setName(e.target.value.slice(0, 24))} placeholder="Clan name (e.g. The Iron Table)"
                    className="rounded border border-line bg-black/40 px-3 py-2 text-stone-100 outline-none focus:border-gold" />
                  <input value={tag} onChange={(e) => setTag(e.target.value.toUpperCase().slice(0, 4))} placeholder="TAG"
                    className="rounded border border-line bg-black/40 px-3 py-2 font-bold tracking-widest text-stone-100 outline-none focus:border-gold" />
                </div>
                <button className="classic-btn classic-btn-gold" disabled={s.cash < CLAN.foundCost || name.trim().length < 3 || tag.trim().length < 2} onClick={() => run(foundClan, name, tag, crest)}>
                  <Flag size={13} /> Found clan for {money(CLAN.foundCost)}
                </button>
                {s.cash < CLAN.foundCost && <span className="ml-2 text-[11px] text-red-400">Needs {money(CLAN.foundCost)} cash on hand.</span>}
              </>
            )}
          </div>
          <div className="rounded border border-line bg-black/30 p-3">
            <div className="k mb-2">Crest designer</div>
            <div className="flex items-center gap-3">
              <Crest crest={crest} size={96} tag={tag || 'TAG'} />
              <div className="space-y-1.5">
                <div className="flex gap-1">{CREST.shapes.map((x) => <button key={x} onClick={() => set('shape', x)} className={`rounded border px-1.5 py-0.5 text-[10px] uppercase ${crest.shape === x ? 'border-gold text-gold' : 'border-line text-stone-400'}`}>{x}</button>)}</div>
                <div className="flex flex-wrap gap-1">{CREST.symbols.map((x) => <button key={x} onClick={() => set('symbol', x)} className={`rounded border px-1.5 py-0.5 text-[10px] uppercase ${crest.symbol === x ? 'border-gold text-gold' : 'border-line text-stone-400'}`}>{x}</button>)}</div>
                <div className="flex gap-1">{CREST.colors.map((x) => <button key={x} aria-label={`Trim ${x}`} onClick={() => set('c1', x)} className={`h-4 w-4 rounded-full border-2 ${crest.c1 === x ? 'border-white' : 'border-black'}`} style={{ background: x }} />)}</div>
                <div className="flex gap-1">{CREST.colors.map((x) => <button key={x} aria-label={`Field ${x}`} onClick={() => set('c2', x)} className={`h-4 w-4 rounded-sm border-2 ${crest.c2 === x ? 'border-white' : 'border-black'}`} style={{ background: x }} />)}</div>
                <button className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-gold" onClick={surprise}><Shuffle size={11} /> Surprise me</button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}

// ---------- clan home ----------
const SUBS = [['overview', 'Overview'], ['members', 'Members'], ['turf', 'Turf & War'], ['heists', 'Heists'], ['upgrades', 'Upgrades']]

function ClanHome({ s, d, run }) {
  const [sub, setSub] = useState('overview')
  const c = s.clan
  const lv = clanLevel(c)
  const ready = c.heists.filter((h) => h.endsAt <= Date.now()).length
  return (
    <div className="space-y-3">
      <div className="box flex flex-wrap items-center gap-3 p-3">
        <Crest crest={c.crest} size={64} tag={c.tag} />
        <div className="min-w-0 flex-1">
          <div className="font-display text-xl font-bold text-stone-100">{c.name} <span className="text-sm text-gold">[{c.tag}]</span></div>
          <div className="text-[12px] text-stone-400">Clan level {lv.level} · {c.members.length}/{clanSlots(c)} members · {heldDistricts(c).length} districts held · Wars {c.warsWon}W–{c.warsLost}L</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="w-48"><Bar value={c.xp - lv.base} max={(lv.next || c.xp) - lv.base || 1} color="var(--accent)" height={5} /></div>
            <span className="text-[10px] text-stone-500">{lv.next ? `${fmt(c.xp - lv.base)}/${fmt(lv.next - lv.base)} XP` : 'Max level'}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="k">Treasury</div>
          <div className="text-lg font-bold text-green-400">{money(c.treasury)}</div>
        </div>
      </div>
      <div className="inline-flex flex-wrap rounded-lg border border-line bg-black/30 p-1">
        {SUBS.map(([id, label]) => (
          <button key={id} onClick={() => setSub(id)} className={`relative rounded-md px-3 py-1.5 text-sm font-semibold ${sub === id ? 'text-ink' : 'text-stone-300'}`} style={sub === id ? { background: 'var(--accent)' } : undefined}>
            {label}{id === 'heists' && ready > 0 && <span className="ml-1 rounded-full bg-gold px-1.5 text-[10px] text-ink">{ready}</span>}
          </button>
        ))}
      </div>
      {sub === 'overview' && <Overview s={s} run={run} />}
      {sub === 'members' && <Members s={s} run={run} />}
      {sub === 'turf' && <TurfWar s={s} d={d} run={run} />}
      {sub === 'heists' && <Heists s={s} run={run} />}
      {sub === 'upgrades' && <Upgrades s={s} run={run} />}
    </div>
  )
}

function Overview({ s, run }) {
  const c = s.clan
  const [amt, setAmt] = useState('')
  const inc = clanIncomePerHour(s)
  const contracts = c.contracts || { list: [] }
  const reward = contractReward(s)
  const perks = clanPerks(s)
  const perkText = Object.entries(perks).filter(([k]) => !['clanPower', 'treasuryIncome'].includes(k)).map(([k, v]) => `${k === 'bankFeeCut' ? '-' : '+'}${(v * 100).toFixed(1).replace('.0', '')}% ${({ attack: 'Attack', defense: 'Defense', jobCash: 'Job cash', jobXp: 'Job XP', propertyIncome: 'Property income', bankFeeCut: 'Bank fee' })[k] || k}`)
  const n = Math.max(0, Math.floor(Number(amt) || 0))
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="space-y-3">
        <Section title="Treasury">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Members / hr" value={money(inc.members)} color="#4ADE80" />
            <Stat label="Turf / hr" value={money(inc.turf)} color="#4ADE80" />
            <Stat label="Wages / hr" value={money(-inc.wages)} color="#F87171" />
            <Stat label="Net / hr" value={money(inc.net)} color={inc.net >= 0 ? '#4ADE80' : '#F87171'} />
          </div>
          {c.treasury < inc.wages * 3 && inc.wages > 0 && <p className="mt-2 text-[12px] text-red-400">The treasury is nearly empty. Unpaid members lose loyalty and will walk out.</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input inputMode="numeric" value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Amount"
              className="w-32 rounded border border-line bg-black/40 px-2 py-1.5 text-stone-100 outline-none focus:border-gold" />
            <button className="classic-btn" disabled={n <= 0 || s.cash <= 0} onClick={() => { run(donate, n); setAmt('') }}>Donate</button>
            <button className="classic-btn-dark" disabled={s.cash <= 0} onClick={() => run(donate, s.cash)}>All cash ({money(s.cash)})</button>
          </div>
          <p className="mt-1 text-[11px] text-stone-500">Donations are tax-free and give 1 clan XP per {money(CLAN.donationPerXp)}. The treasury pays wages, upgrades, wars and heist prep.</p>
        </Section>
        <Section flush title="Daily Contracts">
          {contracts.list.map((k) => {
            const def = CONTRACTS.find((x) => x.id === k.id)
            const done = k.progress >= k.target
            return (
              <div key={k.id} className={`row ${k.claimed ? 'opacity-50' : ''}`}>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-stone-100">{def.text.replace('{n}', def.money ? money(k.target) : fmt(k.target))}</div>
                  <div className="mt-1 flex items-center gap-2"><div className="w-32"><Bar value={k.progress} max={k.target} color={done ? '#D4AF37' : 'var(--accent)'} height={5} /></div><span className="text-[10px] text-stone-500">{def.money ? money(k.progress) : fmt(k.progress)}/{def.money ? money(k.target) : fmt(k.target)}</span></div>
                </div>
                <button className="classic-btn classic-btn-gold" disabled={!done || k.claimed} onClick={() => run(claimContract, k.id)}>{k.claimed ? <Check size={12} /> : 'Claim'}</button>
              </div>
            )
          })}
          <p className="px-3 py-2 text-[11px] text-stone-500">Each pays +{reward.gold} Gold, +{money(reward.treasury)} to the treasury and +{reward.xp} clan XP. New contracts every day.</p>
        </Section>
        {perkText.length > 0 && (
          <Section title="Your Clan Bonuses">
            <div className="flex flex-wrap gap-1.5">{perkText.map((t) => <span key={t} className="chip border" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>{t}</span>)}</div>
            <p className="mt-2 text-[11px] text-stone-500">From your positions and upgrades. Appoint skilled members to boost these.</p>
          </Section>
        )}
      </div>
      <Section flush title="Clan Feed">
        <ul className="max-h-[520px] overflow-y-auto">
          {c.feed.map((f) => (
            <li key={f.id} className="row items-start">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: f.spec ? SPECIALTIES[f.spec].color : f.kind === 'war' ? '#F87171' : '#D4AF37' }} />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] text-stone-200">{f.name && <b className="text-stone-100">{f.name}: </b>}{f.text}</div>
                <div className="text-[10px] text-stone-500">{new Date(f.t).toLocaleString()}</div>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}

function Members({ s, run }) {
  const c = s.clan
  const now = Date.now()
  const slotsFull = c.members.length >= clanSlots(c)
  return (
    <div className="space-y-3">
      <Section flush title={`Members ${c.members.length}/${clanSlots(c)}`}>
        {c.members.length === 0 && <p className="px-3 py-3 text-[13px] text-stone-400">No members yet. Sign someone from the recruits below.</p>}
        {c.members.map((m) => {
          const busy = m.busyUntil > now
          const role = ROLES.find((r) => c.roles[r.id] === m.id)
          return (
            <div key={m.id} className="row flex-wrap sm:flex-nowrap">
              <Avatar factionId={m.faction} rank={rankOfMember(m)} size={44} />
              <div className="min-w-0 flex-1 basis-[calc(100%-60px)] sm:basis-auto">
                <div className="flex flex-wrap items-center gap-1.5"><span className="font-bold text-stone-100">{m.name}</span><SpecChip spec={m.spec} />{role && <span className="chip bg-gold/20 text-gold">{role.name}</span>}{busy && <span className="chip bg-blue-900/50 text-blue-300">Busy {fmtLeft(m.busyUntil - now)}</span>}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-stone-400"><span>Lv {m.level}</span><Skill v={m.skill} /><span>Wage {money(m.wage)}/day</span>{memberIncome(m) > 0 && <span className="text-green-400">Earns {money(memberIncome(m))}/hr</span>}</div>
              </div>
              <div className="w-full shrink-0 sm:w-28">
                <div className="k">Loyalty</div>
                <Bar value={m.loyalty} max={100} color={m.loyalty < 30 ? '#F87171' : m.loyalty < 60 ? '#FACC15' : '#4ADE80'} height={5} />
                <div className="text-[10px] text-stone-500">{Math.round(m.loyalty)}/100</div>
              </div>
              <div className="flex w-full shrink-0 justify-end gap-1 sm:w-auto">
                <button className="classic-btn-dark" title={`Gift ${money(giftCost(m))}`} disabled={s.cash < giftCost(m) || m.loyalty >= 100} onClick={() => run(giftMember, m.id)}><Gift size={12} /> {money(giftCost(m))}</button>
                <button className="classic-btn-dark" title="Let go" disabled={busy} onClick={() => run(dismissMember, m.id)}><UserMinus size={12} /></button>
              </div>
            </div>
          )
        })}
      </Section>

      <Section flush title="Positions">
        <p className="border-b border-[#24272D] px-3 py-2 text-[11px] text-stone-400">Each position gives you a personal bonus based on the member's skill. One member per position.</p>
        {ROLES.map((r) => {
          const holder = c.members.find((m) => c.roles[r.id] === m.id)
          const eff = Object.entries(r.effects).map(([k, v]) => `${k === 'bankFeeCut' ? '-' : '+'}${(v * 100 * (holder?.skill || 1)).toFixed(1).replace('.0', '')}%`).join(' / ')
          return (
            <div key={r.id} className="row flex-wrap sm:flex-nowrap">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-stone-100">{r.name}</div>
                <div className="text-[11px] text-stone-400">{r.desc}{holder ? `: ${eff}` : ` (${eff} per skill point)`}</div>
              </div>
              <select value={holder?.id || ''} onChange={(e) => run(assignRole, r.id, e.target.value || null)}
                className="w-full rounded border border-line bg-black/50 px-2 py-1.5 text-[13px] text-stone-200 outline-none focus:border-gold sm:w-64">
                <option value="">— Vacant —</option>
                {c.members.map((m) => <option key={m.id} value={m.id}>{m.name} ({SPECIALTIES[m.spec].name}, skill {m.skill})</option>)}
              </select>
            </div>
          )
        })}
      </Section>

      <Section flush title="Recruits"
        right={<div className="flex items-center gap-2 text-[11px] text-stone-400"><Timer size={12} /> New faces in {fmtLeft(c.recruitsAt + CLAN.recruitRefreshHours * 3600000 - now)}
          <button className="classic-btn-dark" disabled={s.gold < 5} onClick={() => run(rerollRecruits)}><RefreshCw size={11} /> 5 <Coins size={11} /></button></div>}>
        {c.recruits.map((m) => (
          <div key={m.id} className="row flex-wrap sm:flex-nowrap">
            <Avatar factionId={m.faction} rank={rankOfMember(m)} size={44} />
            <div className="min-w-0 flex-1 basis-[calc(100%-60px)] sm:basis-auto">
              <div className="flex flex-wrap items-center gap-1.5"><span className="font-bold text-stone-100">{m.name}</span><SpecChip spec={m.spec} /></div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-stone-400"><span>Lv {m.level}</span><Skill v={m.skill} /><span>Wage {money(m.wage)}/day</span><span className="hidden text-stone-500 sm:inline">{SPECIALTIES[m.spec].desc}</span></div>
            </div>
            <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-44">
              <span className="font-bold text-green-400">{money(hireCost(m))}</span>
              <button className="classic-btn" disabled={slotsFull || s.cash < hireCost(m)} onClick={() => run(hireRecruit, m.id)}><UserPlus size={12} /> Sign</button>
            </div>
          </div>
        ))}
        {slotsFull && <p className="px-3 py-2 text-[11px] text-red-400">All member slots are full. Level up the clan or build Barracks.</p>}
      </Section>
    </div>
  )
}

function TurfWar({ s, d, run }) {
  const c = s.clan
  const now = Date.now()
  const w = c.war
  const warCost = WAR.costPerLevel * clanLevel(c).level
  return (
    <div className="space-y-3">
      <Section title="War Room">
        {w && !w.result ? (
          <div>
            {(() => {
              const r = RIVAL_CLANS.find((x) => x.id === w.rival)
              const us = Math.round(w.us), them = Math.round(w.them)
              return (
                <>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-bold text-stone-100">{c.name} vs <span style={{ color: r.color }}>{r.name}</span></span>
                    <span className="flex items-center gap-1 text-stone-400"><Timer size={12} /> {fmtLeft(w.endsAt - now)} left</span>
                  </div>
                  <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div className="text-right"><div className="text-3xl font-extrabold text-green-400">{us}</div><div className="k">Us</div></div>
                    <Swords className="text-red-400" />
                    <div><div className="text-3xl font-extrabold" style={{ color: r.color }}>{them}</div><div className="k">Them</div></div>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded bg-black/60"><div className="h-full bg-green-500" style={{ width: `${(us / Math.max(1, us + them)) * 100}%` }} /></div>
                  <p className="mt-2 text-[11px] text-stone-400">Score: Fight Club win +3, turf push +2, World Enemy or boss hit +1. Your Enforcers also score every hour.</p>
                </>
              )
            })()}
          </div>
        ) : w?.result ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className={`text-xl font-extrabold ${w.result.won ? 'text-gold' : 'text-red-400'}`}>{w.result.won ? 'VICTORY' : 'DEFEAT'}</div>
            <div className="text-[13px] text-stone-300">{Math.round(w.us)} – {Math.round(w.them)} vs {RIVAL_CLANS.find((x) => x.id === w.rival).name}{w.result.won && ` · +${money(w.result.spoils)} treasury, +${WAR.winGold} Gold, +${WAR.winXp} clan XP`}</div>
            <button className="classic-btn-dark ml-auto" onClick={() => run(claimWar)}>Close</button>
          </div>
        ) : (
          <>
            <p className="mb-2 text-[12px] text-stone-400">Declare a 24-hour war on a rival clan. It costs {money(warCost)} from the treasury. Win for spoils, Gold and clan XP.</p>
            {RIVAL_CLANS.map((r) => {
              const truce = (c.truce[r.id] || 0) > now
              return (
                <div key={r.id} className="row">
                  <span className="flex h-8 w-8 items-center justify-center rounded border-2 text-[10px] font-extrabold" style={{ borderColor: r.color, color: r.color }}>{r.tag}</span>
                  <div className="min-w-0 flex-1"><div className="font-bold text-stone-100">{r.name}</div><div className="text-[11px] text-stone-400">Strength {r.power >= 1.2 ? 'Fearsome' : r.power >= 1.05 ? 'Strong' : r.power >= 0.95 ? 'Even' : 'Weak'}</div></div>
                  <button className="classic-btn" style={{ '--accent': '#DC2626' }} disabled={truce || c.treasury < warCost} onClick={() => run(declareWar, r.id)}>{truce ? `Truce ${fmtLeft(c.truce[r.id] - now)}` : <><Swords size={12} /> Declare war</>}</button>
                </div>
              )
            })}
          </>
        )}
      </Section>

      <Section title="Turf Map" right={<span className="text-[11px] text-stone-400">Push: {TURF.pushEnergy} <Zap size={10} className="inline" /> · hold at {TURF.holdAt}%</span>}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {DISTRICTS.map((dist) => {
            const t = c.turf[dist.id]
            const r = RIVAL_CLANS.find((x) => x.id === t.rival)
            const held = t.control >= TURF.holdAt
            const locked = s.level < dist.level
            const img = ASSET_MAP.districts[dist.id]
            return (
              <div key={dist.id} className={`overflow-hidden rounded border-2 ${held ? 'border-gold/70' : 'border-[#2A2E35]'} bg-black/40`}>
                <div className="relative h-16">
                  {img ? <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <DistrictScene id={dist.id} />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                  <div className="absolute bottom-1 left-2 flex items-center gap-1 text-[12px] font-bold text-white"><MapPin size={11} /> {dist.name}</div>
                  {held && <div className="absolute right-1 top-1"><Crest crest={c.crest} size={24} /></div>}
                </div>
                <div className="p-2">
                  <div className="flex h-2.5 overflow-hidden rounded-sm border border-black">
                    <div className="h-full bg-gold" style={{ width: `${t.control}%` }} />
                    <div className="h-full flex-1" style={{ background: r.color, opacity: 0.6 }} />
                  </div>
                  <div className="mt-0.5 flex justify-between text-[10px]"><span className="text-gold">{c.tag} {Math.round(t.control)}%</span><span style={{ color: r.color }}>{r.tag}</span></div>
                  <div className="mt-1 text-[10px] text-stone-400">{held ? `Held: +${Math.round(TURF.jobCashBonus * 100)}% job cash, +${money(TURF.incomePerLevel * Math.max(1, dist.level))}/hr` : `Controlled by ${r.name}`}</div>
                  <button className="classic-btn mt-1.5 w-full" disabled={locked || s.energy < TURF.pushEnergy || t.control >= 100} onClick={() => run(pushTurf, dist.id)}>
                    {locked ? <><Lock size={11} /> Lv {dist.level}</> : t.control >= 100 ? 'Secured' : 'Push turf'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-2 text-[11px] text-stone-500">Rival clans claw back control every hour. Enforcers in your clan hold the line for you.</p>
      </Section>
    </div>
  )
}

function Heists({ s, run }) {
  const c = s.clan
  const now = Date.now()
  const [picked, setPicked] = useState({})
  const toggle = (hid, mid, max) => setPicked((p) => {
    const cur = p[hid] || []
    return { ...p, [hid]: cur.includes(mid) ? cur.filter((x) => x !== mid) : cur.length < max ? [...cur, mid] : cur }
  })
  const free = c.members.filter((m) => m.busyUntil <= now)
  return (
    <div className="space-y-3">
      {c.heists.length > 0 && (
        <Section flush title="Heists Underway">
          {c.heists.map((run2) => {
            const h = HEISTS.find((x) => x.id === run2.heistId)
            const done = run2.endsAt <= now
            return (
              <div key={run2.id} className="row">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-stone-100">{h.name}</div>
                  <div className="text-[11px] text-stone-400">Crew: {run2.crew.map((id) => c.members.find((m) => m.id === id)?.name || 'gone').join(', ')} · {Math.round(run2.chance * 100)}% chance</div>
                  {!done && <div className="mt-1 w-40"><Bar value={now - run2.startedAt} max={run2.endsAt - run2.startedAt} color="#60A5FA" height={5} /></div>}
                </div>
                {done ? <button className="classic-btn classic-btn-gold" onClick={() => run(collectHeist, run2.id)}>See result</button>
                  : <span className="flex items-center gap-1 text-[12px] text-stone-400"><Timer size={12} /> {fmtLeft(run2.endsAt - now)}</span>}
              </div>
            )
          })}
        </Section>
      )}
      <Section flush title="Plan a Heist">
        <p className="border-b border-[#24272D] px-3 py-2 text-[11px] text-stone-400">Pick a crew, pay the prep from the treasury, and come back when the timer runs out. Members with the right specialty count 50% more. Strategists make every heist safer.</p>
        {HEISTS.map((h) => {
          const sel = picked[h.id] || []
          const running = c.heists.some((x) => x.heistId === h.id)
          const locked = s.level < h.level
          const chance = sel.length ? heistChance(c, h, sel) : null
          return (
            <div key={h.id} className={`border-b border-[#24272D] px-3 py-2.5 ${locked ? 'opacity-55' : ''}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-stone-100">{h.name}</span>
                <span className="text-[11px] text-stone-400"><Timer size={11} className="inline" /> {h.hours}h · crew {h.crew} · prep {money(h.prep)}</span>
                <span className="flex gap-1">{h.needs.map((n) => <SpecChip key={n} spec={n} />)}</span>
                <span className="ml-auto text-[12px] font-bold text-green-400">{money(h.reward.cash)}{h.reward.gold ? <span className="text-gold"> +{h.reward.gold}g</span> : null}</span>
              </div>
              {!locked && !running && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {free.length === 0 && <span className="text-[11px] text-stone-500">No free members.</span>}
                  {free.map((m) => {
                    const on = sel.includes(m.id)
                    return (
                      <button key={m.id} onClick={() => toggle(h.id, m.id, h.crew)} className={`rounded border px-2 py-1 text-[11px] ${on ? 'border-gold bg-gold/15 text-gold' : 'border-line text-stone-300'}`}>
                        {on && <Check size={10} className="mr-0.5 inline" />}{m.name.split(' ')[0]} · {SPECIALTIES[m.spec].name[0]}{m.skill}
                      </button>
                    )
                  })}
                  <span className="ml-auto flex items-center gap-2">
                    {chance !== null && <span className={`text-[12px] font-bold ${chance >= 0.7 ? 'text-green-400' : chance >= 0.45 ? 'text-yellow-400' : 'text-red-400'}`}>{Math.round(chance * 100)}% success</span>}
                    <button className="classic-btn" disabled={sel.length !== h.crew || c.treasury < h.prep} onClick={() => { run(startHeist, h.id, sel); setPicked((p) => ({ ...p, [h.id]: [] })) }}>Start ({sel.length}/{h.crew})</button>
                  </span>
                </div>
              )}
              {locked && <div className="mt-1 text-[11px] text-stone-500"><Lock size={10} className="inline" /> Unlocks at Level {h.level}</div>}
              {running && <div className="mt-1 text-[11px] text-blue-300">Underway</div>}
            </div>
          )
        })}
      </Section>
      {c.heistLog.length > 0 && (
        <Section title="Past Heists">
          <ul className="space-y-1 text-[12px]">{c.heistLog.map((h, i) => <li key={i} className={h.ok ? 'text-green-400' : 'text-red-400'}>{h.ok ? '✔' : '✘'} {h.name} · {new Date(h.t).toLocaleString()}</li>)}</ul>
        </Section>
      )}
    </div>
  )
}

function Upgrades({ s, run }) {
  const c = s.clan
  const max = clanLevel(c).level
  return (
    <Section flush title="Clan Upgrades" right={<span className="text-[12px] font-bold text-green-400">Treasury {money(c.treasury)}</span>}>
      <p className="border-b border-[#24272D] px-3 py-2 text-[11px] text-stone-400">Paid from the treasury. Upgrades can't go above the clan level (now {max}).</p>
      {CLAN_UPGRADES.map((u) => {
        const lv = c.upgrades[u.id] || 0
        const cost = upgradeCost(lv + 1)
        const capped = lv >= max
        return (
          <div key={u.id} className="row flex-wrap sm:flex-nowrap">
            <div className="min-w-0 flex-1">
              <div className="font-bold text-stone-100">{u.name} <span className="text-[11px] text-stone-400">Lv {lv}</span></div>
              <div className="text-[11px] text-stone-400">{u.desc}</div>
              <div className="mt-1 flex gap-0.5">{Array.from({ length: 10 }, (_, i) => <span key={i} className="h-1.5 w-4 rounded-sm" style={{ background: i < lv ? 'var(--accent)' : i < max ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.04)' }} />)}</div>
            </div>
            <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-48">
              {!capped && <span className="font-bold text-green-400">{money(cost)}</span>}
              <button className="classic-btn" disabled={capped || c.treasury < cost} onClick={() => run(buyClanUpgrade, u.id)}>{capped ? (lv >= 10 ? 'Maxed' : `Clan Lv ${lv + 1}`) : 'Upgrade'}</button>
            </div>
          </div>
        )
      })}
    </Section>
  )
}
