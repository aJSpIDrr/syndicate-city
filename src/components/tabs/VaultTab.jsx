import { Check, Coins, Package } from 'lucide-react'
import { CONTRABAND, COLLECTIONS, RARITY, ITEMS, BOSSES, DISTRICTS, getContraband, getItem } from '../../data/content'
import { vaultCollection, collectionReady, openCrate, GOLD_PRICES } from '../../game/engine'
import { Section, ItemArt } from '../ui'

export default function VaultTab({ s, run }) {
  return (
    <div className="space-y-3">
      <Section
        title="Contraband"
        right={<button className="classic-btn classic-btn-gold px-3 py-1.5 text-xs" disabled={s.gold < GOLD_PRICES.crate} onClick={() => run(openCrate)}><Package size={14} /> Open Crate · {GOLD_PRICES.crate} <Coins size={12} /></button>}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CONTRABAND.map((c) => {
            const qty = s.contraband[c.id] || 0
            const color = RARITY[c.rarity].color
            return (
              <div key={c.id} className={`rounded-xl border-2 bg-black/25 p-3 text-center ${qty ? '' : 'opacity-45'}`} style={{ borderColor: `${color}88` }}>
                <div className="mx-auto h-20 w-20"><ItemArt kind="contraband" id={c.id} rarity={c.rarity} size={80} /></div>
                <div className="mt-1 text-sm font-semibold leading-tight text-stone-100">{c.name}</div>
                <div className="text-xs text-stone-400">x{qty}</div>
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-stone-500">Contraband drops from Jobs (and Fight Club wins). Crates give 2 random pieces.</p>
      </Section>

      <Section title="Boss Trophies">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ITEMS.filter((i) => i.unique).map((t) => {
            const owned = (s.inventory[t.id] || 0) > 0
            const district = DISTRICTS.find((x) => BOSSES[x.id].reward.item === t.id)
            return (
              <div key={t.id} className={`rounded border-2 bg-black/30 p-2 text-center ${owned ? 'border-gold/70' : 'border-[#2A2E35] opacity-50'}`}>
                <div className="mx-auto h-16 w-16" style={owned ? undefined : { filter: 'grayscale(1) brightness(.5)' }}>
                  <ItemArt kind="item" id={t.id} category={t.category} rarity={t.rarity} size={64} />
                </div>
                <div className="text-[12px] font-bold leading-tight text-stone-100">{t.name}</div>
                <div className="text-[11px] text-stone-400">{t.atk} Atk / {t.def} Def · {t.category}</div>
                <div className="text-[10px] text-stone-500">{owned ? 'Equipped automatically' : `Beat ${BOSSES[district.id].name.split(',')[0]} (${district.name})`}</div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Collections">
        <div className="grid gap-3 lg:grid-cols-3">
          {COLLECTIONS.map((col) => {
            const ready = collectionReady(s, col)
            const times = s.collections[col.id] || 0
            return (
              <div key={col.id} className="rounded-xl border border-line bg-black/20 p-4">
                <div className="font-semibold text-stone-100">{col.name}</div>
                <div className="text-sm text-gold">Reward: {col.rewardText}, +5 Gold</div>
                <ul className="my-3 space-y-1.5">
                  {col.parts.map((p) => {
                    const isItem = p.startsWith('item:')
                    const name = isItem ? getItem(p.slice(5)).name : getContraband(p).name
                    const have = isItem ? s.inventory[p.slice(5)] || 0 : s.contraband[p] || 0
                    return (
                      <li key={p} className="flex items-center gap-2 text-sm">
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full ${have ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-stone-600'}`}><Check size={12} /></span>
                        <span className={have ? 'text-stone-200' : 'text-stone-500'}>{name}</span>
                        <span className="ml-auto text-xs text-stone-500">x{have}</span>
                      </li>
                    )
                  })}
                </ul>
                <button className="classic-btn w-full" disabled={!ready} onClick={() => run(vaultCollection, col.id)}>Vault Set for Bonus</button>
                {times > 0 && <div className="mt-1 text-center text-xs text-stone-500">Vaulted {times}x</div>}
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
