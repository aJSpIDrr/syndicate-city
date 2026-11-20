import { Building2, Lock } from 'lucide-react'
import { PROPERTIES } from '../../data/content'
import { buyProperty, collectIncome, propertyPrice, money, fmt } from '../../game/engine'
import { ASSET_MAP } from '../../assetMap'
import { Section, Stat } from '../ui'

export default function RealEstateTab({ s, d, run }) {
  const pi = d.perks.propertyIncome || 0
  return (
    <div className="space-y-4">
      <Section title="Empire Income">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Gross / hr" value={money(d.grossIncome)} color="#4ADE80" sub={pi ? `incl. +${Math.round(pi * 100)}% faction perk` : undefined} />
          <Stat label="Gear upkeep / hr" value={`-${money(d.upkeep)}`} color="#F87171" />
          <Stat label="Net / hr" value={money(d.netIncome)} color={d.netIncome >= 0 ? '#4ADE80' : '#F87171'} />
          <Stat label="Ready to collect" value={money(s.pendingIncome)} color="#D4AF37" sub="Holds up to 24h" />
        </div>
        <button className="btn-gold mt-3 w-full sm:w-auto" disabled={s.pendingIncome < 1} onClick={() => run(collectIncome)}>
          Collect {money(s.pendingIncome)}
        </button>
      </Section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {PROPERTIES.map((p) => {
          const owned = s.properties[p.id] || 0
          const price = propertyPrice(s, p)
          const locked = s.level < p.level
          const img = ASSET_MAP.properties[p.id]
          return (
            <div key={p.id} className="panel overflow-hidden">
              <div className="relative flex h-24 items-center justify-center bg-gradient-to-br from-[#2A2E35] to-[#0B0C0E]">
                {img ? <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <Building2 size={38} className="text-stone-500" />}
                <span className="chip absolute right-2 top-2 bg-black/60 text-stone-200">Owned: {owned}</span>
              </div>
              <div className="p-4">
                <div className="font-semibold text-stone-100">{p.name}</div>
                <div className="mt-1 text-sm text-green-400">+{money(p.income * (1 + pi))} / hr each</div>
                <div className="text-xs text-stone-500">Your total: {money(owned * p.income * (1 + pi))} / hr</div>
                <button className="btn-accent mt-3 w-full" disabled={locked || s.cash < price} onClick={() => run(buyProperty, p.id)}>
                  {locked ? <><Lock size={14} /> Level {p.level}</> : `Buy for ${money(price)}`}
                </button>
                {!locked && <div className="mt-1 text-center text-[11px] text-stone-500">Price rises 15% per property owned ({fmt(owned)} owned)</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
