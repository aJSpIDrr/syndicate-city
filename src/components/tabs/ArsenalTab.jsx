import { useState } from 'react'
import { Coins, Hammer } from 'lucide-react'
import { getFaction } from '../../data/factions'
import { ITEMS, SIG_TIERS, RARITY } from '../../data/content'
import { upgradeSignature, buyItem, sellItem, money, fmt } from '../../game/engine'
import { Section, ItemArt, RarityTag } from '../ui'
import SignatureWeapon from '../../art/SignatureWeapon'

const pct = (v) => `${Math.round(v * 100)}%`

export default function ArsenalTab({ s, d, run }) {
  const [sub, setSub] = useState('forge')
  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-lg border border-line bg-black/30 p-1">
        {[['forge', 'Signature Weapon Forge'], ['shop', 'Black Market Shop']].map(([id, label]) => (
          <button key={id} onClick={() => setSub(id)} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${sub === id ? 'text-ink' : 'text-stone-300'}`} style={sub === id ? { background: 'var(--accent)' } : undefined}>
            {label}
          </button>
        ))}
      </div>
      {sub === 'forge' ? <Forge s={s} d={d} run={run} /> : <Shop s={s} d={d} run={run} />}
    </div>
  )
}

function Forge({ s, d, run }) {
  const f = getFaction(s.factionId)
  const cur = SIG_TIERS[s.sigTier - 1]
  const next = SIG_TIERS[s.sigTier]
  const img = null // SignatureWeapon resolves ASSET_MAP images per tier
  const glow = s.sigTier >= 6 ? '#D4AF37' : s.sigTier >= 4 ? f.accent : '#57534E'
  return (
    <>
      <Section>
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="relative mx-auto flex h-32 w-48 shrink-0 items-center justify-center rounded-xl border-2 border-gold bg-gradient-to-br from-[#2b2410] to-black sm:mx-0" style={{ boxShadow: `0 0 ${8 + s.sigTier * 3}px ${glow}` }}>
            {img ? <img src={img} alt="" className="h-full w-full object-contain p-2" /> : <SignatureWeapon factionId={s.factionId} tier={s.sigTier} width={184} />}
            <span className="chip absolute -bottom-2 bg-gold text-ink">Mk. {s.sigTier}</span>
          </div>
          <div className="min-w-0 flex-1">
            <span className="chip bg-gold text-ink">FACTION EXCLUSIVE</span>
            <h2 className="h-title mt-1">{cur.prefix} {f.weapon}</h2>
            <div className="text-sm text-stone-400">{f.weaponDesc} · bound to {s.bossName}</div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="chip bg-red-500/15 text-red-300">+{cur.atk} Atk</span>
              <span className="chip bg-blue-500/15 text-blue-300">+{cur.def} Def</span>
              {cur.crit > 0 && <span className="chip bg-white/10 text-stone-200">{pct(cur.crit)} Crit (1.5x)</span>}
              {cur.pen > 0 && <span className="chip bg-white/10 text-stone-200">{pct(cur.pen)} Armor Pen</span>}
              {cur.cash > 0 && <span className="chip bg-white/10 text-stone-200">+{pct(cur.cash)} Cash Stolen</span>}
            </div>
            {next ? (
              <div className="mt-4 rounded-lg border border-line bg-black/25 p-3">
                <div className="text-sm text-stone-300">Next: <b className="text-gold">{next.prefix}</b> — +{next.atk} Atk / +{next.def} Def
                  {next.crit > cur.crit && `, ${pct(next.crit)} Crit`}{next.pen > cur.pen && `, ${pct(next.pen)} Armor Pen`}{next.cash > cur.cash && `, +${pct(next.cash)} Cash Stolen`}
                </div>
                <div className="mt-1 text-xs text-stone-500">Requires Level {next.level} · {next.gold} Gold Bars (you have {s.gold})</div>
                <button className="classic-btn classic-btn-gold mt-3" disabled={s.gold < next.gold || s.level < next.level} onClick={() => run(upgradeSignature)}>
                  <Hammer size={15} /> Upgrade with Gold ({next.gold} <Coins size={14} />)
                </button>
              </div>
            ) : (
              <div className="mt-4 font-semibold text-gold">Mythic tier reached. This weapon is a legend.</div>
            )}
          </div>
        </div>
      </Section>
      <Section title="Upgrade Path">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {SIG_TIERS.map((t) => (
            <div key={t.tier} className={`rounded-lg border p-2 text-xs ${t.tier <= s.sigTier ? 'border-gold/60 bg-gold/5' : 'border-line bg-black/20 opacity-70'}`}>
              <SignatureWeapon factionId={s.factionId} tier={t.tier} width={96} />
              <div className="font-bold text-stone-200">Mk. {t.tier}</div>
              <div className="text-stone-400">{t.atk} / {t.def}</div>
              <div className="text-stone-500">Lv {t.level} · {t.gold}g</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

function Shop({ s, d, run }) {
  const [cat, setCat] = useState('weapon')
  const items = ITEMS.filter((i) => i.category === cat)
  const bonus = cat === 'weapon' ? d.perks.weapon : cat === 'vehicle' ? d.perks.vehicle : 0
  return (
    <Section
      flush
      title="Black Market"
      right={
        <div className="flex gap-1">
          {[['weapon', 'Weapons'], ['armor', 'Armor'], ['vehicle', 'Vehicles']].map(([id, label]) => (
            <button key={id} onClick={() => setCat(id)} className={cat === id ? 'classic-btn' : 'classic-btn-dark'}>{label}</button>
          ))}
        </div>
      }
    >
      {bonus > 0 && <p className="border-b border-[#24272D] px-3 py-1.5 text-[11px]" style={{ color: 'var(--accent)' }}>Faction perk: +{Math.round(bonus * 100)}% {cat} stats in combat</p>}
      <div className="row hidden bg-black/40 py-1 sm:flex">
        <span className="k w-16" /><span className="k flex-1">Item</span><span className="k w-24 text-center">Stats</span><span className="k w-16 text-center">Owned</span><span className="k w-[210px] text-right">Price</span>
      </div>
      <div>
        {items.map((item) => {
          const owned = s.inventory[item.id] || 0
          const color = RARITY[item.rarity].color
          return (
            <div key={item.id} className="row flex-wrap sm:flex-nowrap">
              <div className="h-16 w-16 shrink-0 rounded border-2 bg-black/40" style={{ borderColor: `${color}AA` }}>
                <ItemArt kind="item" id={item.id} category={item.category} rarity={item.rarity} size={60} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-stone-100">{item.name}</div>
                <RarityTag rarity={item.rarity} />
                <div className="text-[11px] text-stone-500">{item.upkeep ? `Upkeep ${money(item.upkeep)}/hr` : 'No upkeep'}</div>
              </div>
              <div className="w-24 shrink-0 text-center text-[12px]">
                <div className="font-bold text-red-300">{item.atk} Atk</div>
                <div className="font-bold text-blue-300">{item.def} Def</div>
              </div>
              <div className="w-16 shrink-0 text-center font-bold text-stone-200">x{fmt(owned)}</div>
              <div className="flex w-full shrink-0 items-center justify-end gap-1 sm:w-[210px]">
                <span className="mr-1 font-bold text-green-400">{money(item.price)}</span>
                <button className="classic-btn" disabled={s.cash < item.price} onClick={() => run(buyItem, item.id, 1)}>Buy</button>
                <button className="classic-btn-dark" disabled={s.cash < item.price * 5} onClick={() => run(buyItem, item.id, 5)} title="Buy 5">x5</button>
                <button className="classic-btn-dark" disabled={owned < 1} onClick={() => run(sellItem, item.id, 1)} title={`Sell for ${money(item.price / 2)}`}>Sell</button>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
