import { useState, useEffect } from 'react'
import { ONLINE, api, serverAct } from '../../game/online'
import { Lock, Shield, Coins, Swords, RefreshCw, X, Plus } from 'lucide-react'
import { HQ_TIERS, HQ_ROOMS, ROOM_MAX, roomCost, HQ_RAID } from '../../data/hq'
import { ITEMS, RARITY } from '../../data/content'
import { getFaction } from '../../data/factions'
import {
  hqTier, hqDefense, safeCap, hqIncome, roomsBuilt, upgradeHq, buildRoom, equipHqGear, unequipHqGear, collectSafe, refreshRivalHqs, raidHq,
} from '../../game/hq'
import { money, fmt, rankOf } from '../../game/engine'
import { Section, Stat, ItemArt, Bar } from '../ui'
import Avatar from '../Avatar'

const art = (n) => `./art/hq/${n}.jpg`

export default function HqTab({ s, d, run }) {
  const [picking, setPicking] = useState(false)
  const t = hqTier(s)
  const next = HQ_TIERS[s.hq.tier]
  const def = hqDefense(s, d)
  const owned = ITEMS.filter((i) => (s.inventory[i.id] || 0) > 0).sort((a, b) => (b.def + b.atk / 2) - (a.def + a.atk / 2))
  const slotsFree = t.gear - s.hq.gear.length
  return (
    <div className="space-y-3">
      <section className="box">
        <div className="relative h-48 sm:h-64">
          <img src={art(t.art)} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end gap-3">
            <div className="min-w-0 flex-1">
              <div className="k text-gold">Tier {t.tier} Headquarters</div>
              <div className="font-display text-2xl font-bold text-white">{s.bossName}'s {t.name}</div>
              <div className="text-[12px] text-stone-300">Rival bosses can see and raid it. Build rooms and put gear on display to keep them out.</div>
            </div>
            {next && (
              <div className="rounded border border-gold/50 bg-black/70 p-2 text-[12px]">
                <div className="text-stone-300">Next: <b className="text-gold">{next.name}</b></div>
                <div className="text-stone-400">Needs faction Rank {next.rank + 1} · {money(next.cost)}</div>
                <button className="classic-btn classic-btn-gold mt-1 w-full" disabled={rankOf(s) < next.rank || s.cash < next.cost} onClick={() => run(upgradeHq)}>
                  {rankOf(s) < next.rank ? <><Lock size={11} /> Rank {next.rank + 1}</> : 'Upgrade HQ'}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-5">
          <Stat label="HQ Defense" value={fmt(def)} color="#60A5FA" />
          <Stat label="Safe" value={money(s.hq.safe)} sub={`of ${money(safeCap(s))}`} color="#4ADE80" />
          <Stat label="Safe income" value={`${money(hqIncome(s))}/hr`} color="#4ADE80" />
          <Stat label="Rooms" value={`${roomsBuilt(s)}/${t.rooms}`} />
          <Stat label="Raids" value={`${s.hq.defended} held · ${s.hq.lost} lost`} />
        </div>
        <div className="flex flex-wrap items-center gap-2 px-3 pb-3">
          <div className="w-48"><Bar value={s.hq.safe} max={safeCap(s)} color="#4ADE80" height={5} /></div>
          <button className="classic-btn classic-btn-gold" disabled={s.hq.safe < 1} onClick={() => run(collectSafe)}><Coins size={12} /> Collect {money(s.hq.safe)}</button>
          <span className="text-[11px] text-stone-500">Raiders steal from the safe, so collect it often. Vault Room levels protect part of it.</span>
        </div>
      </section>

      <Section title={`Gear on Display ${s.hq.gear.length}/${t.gear}`} right={<span className="text-[11px] text-stone-400">Each item adds its Defense (+ half its Attack) to the HQ. Your crew can't use it while it's here.</span>}>
        <div className="flex flex-wrap gap-2">
          {s.hq.gear.map((id, i) => {
            const it = ITEMS.find((x) => x.id === id)
            return (
              <div key={i} className="relative w-24 rounded border-2 bg-black/40 p-1 text-center" style={{ borderColor: `${RARITY[it.rarity].color}AA` }}>
                <div className="mx-auto h-14 w-14"><ItemArt kind="item" id={it.id} category={it.category} rarity={it.rarity} size={56} /></div>
                <div className="truncate text-[10px] font-bold text-stone-200">{it.name}</div>
                <div className="text-[10px] text-blue-300">+{Math.round(it.def + it.atk / 2)}</div>
                <button aria-label="Take back" className="absolute right-0.5 top-0.5 rounded bg-black/70 p-0.5 text-stone-300 hover:text-white" onClick={() => run(unequipHqGear, i)}><X size={11} /></button>
              </div>
            )
          })}
          {Array.from({ length: slotsFree }, (_, i) => (
            <button key={`e${i}`} onClick={() => setPicking((v) => !v)} className="flex h-[104px] w-24 flex-col items-center justify-center rounded border-2 border-dashed border-[#3A3F47] text-stone-500 hover:border-gold hover:text-gold">
              <Plus size={18} /><span className="text-[10px]">Empty slot</span>
            </button>
          ))}
        </div>
        {picking && slotsFree > 0 && (
          <div className="mt-3 max-h-64 overflow-y-auto rounded border border-line">
            {owned.length === 0 && <p className="p-2 text-[12px] text-stone-400">You don't own any gear yet. Buy some in the Arsenal.</p>}
            {owned.map((it) => (
              <button key={it.id} className="row w-full text-left hover:bg-white/5" onClick={() => { run(equipHqGear, it.id); setPicking(false) }}>
                <div className="h-9 w-9 shrink-0"><ItemArt kind="item" id={it.id} category={it.category} rarity={it.rarity} size={36} /></div>
                <span className="flex-1 font-semibold text-stone-200">{it.name} <span className="text-[11px] text-stone-500">x{s.inventory[it.id]}</span></span>
                <span className="text-[12px] font-bold text-blue-300">+{Math.round(it.def + it.atk / 2)} HQ def</span>
              </button>
            ))}
          </div>
        )}
      </Section>

      <Section title="Rooms" right={<span className="text-[11px] text-stone-400">{roomsBuilt(s)}/{t.rooms} built · up to level {ROOM_MAX}</span>}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {HQ_ROOMS.map((r) => {
            const lv = s.hq.rooms[r.id] || 0
            const locked = s.hq.tier < r.tier
            const full = !lv && roomsBuilt(s) >= t.rooms
            const cost = roomCost(r, lv + 1)
            return (
              <div key={r.id} className={`overflow-hidden rounded border bg-black/30 ${lv ? 'border-gold/60' : 'border-[#2A2E35]'}`}>
                <div className="relative h-24">
                  <img src={art(r.id)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={locked ? { filter: 'grayscale(1) brightness(.4)' } : lv ? undefined : { filter: 'brightness(.6)' }} />
                  <div className="absolute left-1 top-1 flex gap-0.5">{Array.from({ length: ROOM_MAX }, (_, i) => <span key={i} className="h-1.5 w-3 rounded-sm" style={{ background: i < lv ? '#D4AF37' : 'rgba(0,0,0,.6)' }} />)}</div>
                  {locked && <div className="absolute inset-0 flex items-center justify-center gap-1 text-[11px] font-bold text-stone-300"><Lock size={12} /> Tier {r.tier} HQ</div>}
                </div>
                <div className="p-2">
                  <div className="text-[12px] font-bold text-stone-100">{r.name} {lv > 0 && <span className="text-gold">Lv {lv}</span>}</div>
                  <div className="text-[10px] leading-tight text-stone-400">{r.desc} per level</div>
                  <button className="classic-btn mt-1.5 w-full" disabled={locked || full || lv >= ROOM_MAX || s.cash < cost} onClick={() => run(buildRoom, r.id)}>
                    {lv >= ROOM_MAX ? 'Maxed' : full ? 'No space' : `${lv ? 'Upgrade' : 'Build'} ${money(cost)}`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {ONLINE && <RealHqs s={s} d={d} />}

      <Section flush title={ONLINE ? 'Raid AI Crews\' HQs' : 'Raid Rival HQs'} right={<button className="classic-btn-dark" onClick={() => run(refreshRivalHqs)}><RefreshCw size={12} /> New targets</button>}>
        <p className="border-b border-[#24272D] px-3 py-2 text-[11px] text-stone-400">Each raid costs {HQ_RAID.stamina} Stamina. Beat the HQ's defense to steal 20–30% of its safe. Up to 3 raids per target.</p>
        {s.hq.rivals.length === 0 && <div className="p-3"><button className="classic-btn" onClick={() => run(refreshRivalHqs)}>Find targets</button></div>}
        {s.hq.rivals.map((r) => {
          const f = getFaction(r.faction)
          const ratio = d.pAtk / Math.max(1, r.defense * (1 - d.pen))
          const odds = ratio > 1.3 ? ['Easy', '#4ADE80'] : ratio > 1.05 ? ['Favored', '#A3E635'] : ratio > 0.9 ? ['Even', '#FACC15'] : ['Risky', '#F87171']
          return (
            <div key={r.id} className="row flex-wrap sm:flex-nowrap">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded border border-black"><img src={art(HQ_TIERS[r.tier - 1].art)} alt="" className="h-full w-full object-cover" /></div>
              <Avatar factionId={r.faction} rank={r.rank} size={40} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold text-stone-100">{r.name}</div>
                <div className="truncate text-[11px]" style={{ color: f.accent }}>{HQ_TIERS[r.tier - 1].name} · Lv {r.level}</div>
                <div className="text-[11px] text-stone-400">Safe ~{money(r.safe)} · Defense {fmt(r.defense)} · <b style={{ color: odds[1] }}>{odds[0]}</b></div>
              </div>
              <button className="classic-btn w-full shrink-0 sm:w-28" style={{ '--accent': '#DC2626' }} disabled={s.stamina < HQ_RAID.stamina || r.hits >= 3 || s.health < 20} onClick={() => run(raidHq, r.id)}>
                <Swords size={12} /> {r.hits >= 3 ? 'Locked' : `Raid (${3 - r.hits})`}
              </button>
            </div>
          )
        })}
      </Section>
      <p className="flex items-center gap-1 text-[11px] text-stone-500"><Shield size={11} /> Rival crews try to raid your HQ about every {HQ_RAID.raidEveryHours} hours. Results show in Messages.</p>
    </div>
  )
}

function RealHqs({ s, d }) {
  const [list, setList] = useState(null)
  const load = () => api('GET', '/api/hq/targets').then((r) => r.status === 200 && setList(r.targets))
  useEffect(() => { load() }, [])
  const raid = async (u) => { await serverAct('/api/hq/raid', { username: u }); load() }
  return (
    <Section flush title="Raid Real Bosses' HQs" right={<button className="classic-btn-dark" onClick={load}><RefreshCw size={12} /> Refresh</button>}>
      <p className="border-b border-[#24272D] px-3 py-2 text-[11px] text-stone-400">Real players around your level (Level 5+). {HQ_RAID.stamina} Stamina per raid, up to 3 raids per boss a day. They'll know it was you.</p>
      {!list && <p className="px-3 py-2 text-[12px] text-stone-500">Loading…</p>}
      {list && list.length === 0 && <p className="px-3 py-2 text-[12px] text-stone-500">No real bosses near your level yet.</p>}
      {list?.map((r) => {
        const f = getFaction(r.faction)
        const ratio = d.pAtk / Math.max(1, r.defense * (1 - d.pen))
        const odds = ratio > 1.3 ? ['Easy', '#4ADE80'] : ratio > 1.05 ? ['Favored', '#A3E635'] : ratio > 0.9 ? ['Even', '#FACC15'] : ['Risky', '#F87171']
        return (
          <div key={r.username} className="row flex-wrap sm:flex-nowrap">
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded border border-black"><img src={art(HQ_TIERS[r.tier - 1].art)} alt="" className="h-full w-full object-cover" /></div>
            <Avatar factionId={r.faction} rank={r.rank} size={40} />
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold text-stone-100">{r.name} <span className="text-[11px] font-normal text-pink-300">@{r.username}</span></div>
              <div className="truncate text-[11px]" style={{ color: f.accent }}>{HQ_TIERS[r.tier - 1].name} · Lv {r.level}</div>
              <div className="text-[11px] text-stone-400">Safe ~{money(r.safe)} · Defense {fmt(r.defense)} · <b style={{ color: odds[1] }}>{odds[0]}</b></div>
            </div>
            <button className="classic-btn w-full shrink-0 sm:w-28" style={{ '--accent': '#DC2626' }} disabled={s.stamina < HQ_RAID.stamina || r.raidsLeft <= 0 || s.health < 20} onClick={() => raid(r.username)}>
              <Swords size={12} /> {r.raidsLeft <= 0 ? 'Done today' : `Raid (${r.raidsLeft})`}
            </button>
          </div>
        )
      })}
    </Section>
  )
}
