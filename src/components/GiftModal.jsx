import { useEffect, useState } from 'react'
import { Gift, Search, Coins } from 'lucide-react'
import { ITEMS } from '../data/content'
import { getFaction } from '../data/factions'
import { GIFT, giftQuote } from '../game/gifts'
import { api } from '../game/online'
import { money } from '../game/engine'
import { Modal, ItemArt } from './ui'

export default function GiftModal({ open, onClose, s, onState }) {
  const [q, setQ] = useState('')
  const [players, setPlayers] = useState([])
  const [to, setTo] = useState(null)
  const [kind, setKind] = useState('cash')
  const [amount, setAmount] = useState('')
  const [itemId, setItemId] = useState('')
  const [qty, setQty] = useState(1)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const t = setTimeout(() => api('GET', `/api/players?q=${encodeURIComponent(q)}`).then((r) => r.status === 200 && setPlayers(r.players)), 250)
    return () => clearTimeout(t)
  }, [q, open])

  const owned = ITEMS.filter((i) => !i.unique && (s.inventory[i.id] || 0) > 0)
  const quote = to ? giftQuote(s, { kind, amount, itemId, qty }) : null
  const send = async () => {
    setBusy(true); setMsg(null)
    const r = await api('POST', '/api/gift', { to: to.username, kind, amount: Number(amount), itemId, qty: Number(qty) })
    setBusy(false)
    if (r.status === 200) { onState(r.state); setMsg({ ok: true, t: 'Gift sent!' }); setAmount(''); setQty(1) }
    else setMsg({ ok: false, t: r.error || 'Could not send.' })
  }

  return (
    <Modal open={open} onClose={onClose} title="Send a Gift">
      {s.level < GIFT.minLevel && <p className="mb-2 rounded border border-line bg-black/30 p-2 text-[12px] text-stone-300">You can send gifts from Level {GIFT.minLevel}.</p>}
      {!to ? (
        <>
          <div className="flex items-center gap-2 rounded border border-line bg-black/40 px-2"><Search size={14} className="text-stone-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a player by username or boss name" className="w-full bg-transparent py-2 text-stone-100 outline-none" /></div>
          <div className="mt-2 max-h-72 overflow-y-auto">
            {players.length === 0 && <p className="p-2 text-[12px] text-stone-500">No players found.</p>}
            {players.map((p) => (
              <button key={p.username} className="row w-full text-left hover:bg-white/5" onClick={() => setTo(p)}>
                <span className="flex-1"><b className="text-stone-100">{p.boss_name}</b> <span className="text-[11px] text-stone-500">@{p.username}</span></span>
                <span className="text-[11px]" style={{ color: getFaction(p.faction).accent }}>{getFaction(p.faction).name}</span>
                <span className="w-14 text-right text-[12px] text-stone-300">Lv {p.level}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm"><span>To <b className="text-stone-100">{to.boss_name}</b> <span className="text-stone-500">@{to.username}</span></span>
            <button className="text-[12px] text-brass hover:underline" onClick={() => { setTo(null); setMsg(null) }}>Change</button></div>
          <div className="flex gap-1">{[['cash', 'Cash'], ['gold', 'Gold'], ['item', 'Item']].map(([k, l]) => (
            <button key={k} className={kind === k ? 'classic-btn' : 'classic-btn-dark'} onClick={() => { setKind(k); setMsg(null) }}>{l}</button>))}</div>
          {kind !== 'item' ? (
            <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder={kind === 'cash' ? 'Amount of cash' : 'Gold Bars'}
              className="w-full rounded border border-line bg-black/40 px-3 py-2 text-stone-100 outline-none focus:border-gold" />
          ) : (
            <>
              <div className="max-h-48 overflow-y-auto rounded border border-line">
                {owned.length === 0 && <p className="p-2 text-[12px] text-stone-500">You have no giftable items.</p>}
                {owned.map((i) => (
                  <button key={i.id} className={`row w-full text-left ${itemId === i.id ? 'bg-gold/10' : 'hover:bg-white/5'}`} onClick={() => setItemId(i.id)}>
                    <div className="h-8 w-8 shrink-0"><ItemArt kind="item" id={i.id} category={i.category} rarity={i.rarity} size={32} /></div>
                    <span className="flex-1 text-stone-200">{i.name}</span><span className="text-[11px] text-stone-500">x{s.inventory[i.id]}</span>
                  </button>
                ))}
              </div>
              <input inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/[^0-9]/g, ''))} placeholder="How many"
                className="w-32 rounded border border-line bg-black/40 px-3 py-2 text-stone-100 outline-none focus:border-gold" />
            </>
          )}
          <div className="rounded border border-line bg-black/30 p-2 text-[12px] text-stone-300">
            {kind === 'item' ? `Shipping: 10% of the item price (at least ${money(GIFT.itemFeeMin)}), ${money(GIFT.exclusiveFee)} per Gold Exclusive. Boss trophies can't be sent.`
              : `Fee: 5% on top. ${to.boss_name} receives the full amount.`}
            {quote && !quote.error && <div className="mt-1 font-bold text-gold">You pay: {quote.kind === 'gold' ? <><Coins size={11} className="inline" /> {quote.amount + quote.fee} Gold</> : quote.kind === 'cash' ? money(quote.amount + quote.fee) : `${money(quote.fee)} shipping`}</div>}
            {quote?.error && (amount || itemId) && <div className="mt-1 text-red-400">{quote.error}</div>}
          </div>
          <button className="classic-btn classic-btn-gold w-full" disabled={busy || !quote || !!quote.error} onClick={send}><Gift size={13} /> Send gift</button>
          {msg && <p className={`text-[12px] ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.t}</p>}
        </div>
      )}
    </Modal>
  )
}
