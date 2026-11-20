import { Lock } from 'lucide-react'
import { PROPERTIES } from '../../data/content'
import { buyProperty, collectIncome, propertyPrice, money, fmt } from '../../game/engine'
import { ASSET_MAP } from '../../assetMap'
import { Section, Stat } from '../ui'
import { PropertyArt } from '../../art/Scenes'

export default function RealEstateTab({ s, d, run }) {
  const pi = d.perks.propertyIncome || 0
  return (
    <div className="space-y-3">
      <Section title="Empire Income">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Gross / hr" value={money(d.grossIncome)} color="#4ADE80" sub={pi ? `incl. +${Math.round(pi * 100)}% faction perk` : undefined} />
          <Stat label="Gear upkeep / hr" value={`-${money(d.upkeep)}`} color="#F87171" />
          <Stat label="Net / hr" value={money(d.netIncome)} color={d.netIncome >= 0 ? '#4ADE80' : '#F87171'} />
          <Stat label="Ready to collect" value={money(s.pendingIncome)} color="#D4AF37" sub="Holds up to 24h" />
        </div>
        <button className="classic-btn classic-btn-gold mt-3 w-full sm:w-auto" disabled={s.pendingIncome < 1} onClick={() => run(collectIncome)}>
          Collect {money(s.pendingIncome)}
        </button>
      </Section>

      <Section flush title="Properties For Sale">
        <div className="row hidden bg-black/40 py-1 sm:flex">
          <span className="k w-28" /><span className="k flex-1">Property</span><span className="k w-28 text-center">Income / hr</span><span className="k w-16 text-center">Owned</span><span className="k w-40 text-right">Price</span>
        </div>
        <div>
          {PROPERTIES.map((p) => {
            const owned = s.properties[p.id] || 0
            const price = propertyPrice(s, p)
            const locked = s.level < p.level
            const img = ASSET_MAP.properties[p.id]
            return (
              <div key={p.id} className={`row flex-wrap sm:flex-nowrap ${locked ? 'opacity-60' : ''}`}>
                <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded border border-black bg-gradient-to-b from-[#1F2733] to-[#0B0C0E]">
                  {img ? <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <PropertyArt id={p.id} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-stone-100">{p.name}</div>
                  <div className="text-[11px] text-stone-500">{locked ? `Unlocks at Level ${p.level}` : 'Price rises 15% per one owned'}</div>
                  <div className="text-[11px] text-stone-400">Your total: {money(owned * p.income * (1 + pi))} / hr</div>
                </div>
                <div className="w-28 shrink-0 text-center font-bold text-green-400">+{money(p.income * (1 + pi))}</div>
                <div className="w-16 shrink-0 text-center font-bold text-stone-200">{fmt(owned)}</div>
                <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-40">
                  {!locked && <span className="font-bold text-stone-200">{money(price)}</span>}
                  <button className="classic-btn" disabled={locked || s.cash < price} onClick={() => run(buyProperty, p.id)}>
                    {locked ? <><Lock size={12} /> Lv {p.level}</> : 'Buy'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
