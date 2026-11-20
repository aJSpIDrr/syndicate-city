import { useState } from 'react'
import { Coins, Hammer } from 'lucide-react'
import { getFaction } from '../../data/factions'
import { ITEMS, SIG_TIERS, RARITY } from '../../data/content'
import { upgradeSignature, buyItem, sellItem, money, fmt } from '../../game/engine'
import { ASSET_MAP } from '../../assetMap'
import { Section, ItemArt, RarityTag } from '../ui'
import SignatureWeapon from '../../art/SignatureWeapon'

const pct = (v) => `${Math.round(v * 100)}%`

export default function ArsenalTab({ s, d, run }) {
  const [sub, setSub] = useState('forge')
  return (
    <div className="space-y-4">
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
  const img = ASSET_MAP.signatureWeapons[s.factionId]
  const glow = s.sigTier >= 6 ? '#D4AF37' : s.sigTier >= 4 ? f.accent : '#57534E'
  return (
    <>
      <Section>
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="relative mx-auto flex h-32 w-48 shrink-0 items-center justify-center rounded-xl border-2 border-gold bg-gradient-to-br from-[#2b2410] to-black sm:mx-0" style={{ boxShadow: `0 0 ${8 + s.sigTier * 3}px ${glow}` }}>
            {img ? <img src={img} alt="" className="h-full w-full object-contain p-2" /> : <SignatureWeapon factionId={s.factionId} tier={s.sigTier} width={172} />}
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
                <button className="btn-gold mt-3" disabled={s.gold < next.gold || s.level < next.level} onClick={() => run(upgradeSignature)}>
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
      title="Black Market"
      right={
        <div className="flex gap-1">
          {[['weapon', 'Weapons'], ['armor', 'Armor'], ['vehicle', 'Vehicles']].map(([id, label]) => (
            <button key={id} onClick={() => setCat(id)} className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${cat === id ? 'border-transparent text-ink' : 'border-line text-stone-300'}`} style={cat === id ? { background: 'var(--accent)' } : undefined}>{label}</button>
          ))}
        </div>
      }
    >
      {bonus > 0 && <p className="mb-3 text-xs" style={{ color: 'var(--accent)' }}>Faction perk: +{Math.round(bonus * 100)}% {cat} stats in combat</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const owned = s.inventory[item.id] || 0
          const color = RARITY[item.rarity].color
          return (
            <div key={item.id} className="flex flex-col rounded-xl border-2 bg-black/25 p-3" style={{ borderColor: `${color}88` }}>
              <div className="mx-auto h-24 w-24"><ItemArt kind="item" id={item.id} category={item.category} rarity={item.rarity} size={96} /></div>
              <div className="mt-2 text-sm font-semibold leading-tight text-stone-100">{item.name}</div>
              <div className="mt-1 flex items-center justify-between"><RarityTag rarity={item.rarity} /><span className="text-xs text-stone-400">x{fmt(owned)}</span></div>
              <div className="mt-1.5 text-xs text-stone-300"><span className="text-red-300">+{item.atk} Atk</span> · <span className="text-blue-300">+{item.def} Def</span></div>
              <div className="text-[11px] text-stone-500">{item.upkeep ? `Upkeep ${money(item.upkeep)}/hr` : 'No upkeep'}</div>
              <div className="mt-auto flex gap-1.5 pt-2">
                <button className="btn-accent flex-1 px-2 py-1.5 text-xs" disabled={s.cash < item.price} onClick={() => run(buyItem, item.id, 1)}>{money(item.price)}</button>
                <button className="btn-ghost px-2 py-1.5 text-xs" disabled={s.cash < item.price * 5} onClick={() => run(buyItem, item.id, 5)} title="Buy 5">x5</button>
                <button className="btn-ghost px-2 py-1.5 text-xs" disabled={owned < 1} onClick={() => run(sellItem, item.id, 1)} title={`Sell for ${money(item.price / 2)}`}>Sell</button>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
