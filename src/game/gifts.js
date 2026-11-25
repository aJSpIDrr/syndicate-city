// Gifting between real players (online only). Pure rules used by the server.
import { getItem } from '../data/content.js'
import { clone, log, toast, money } from './engine.js'

export const GIFT = { feePct: 0.05, minLevel: 5, maxQty: 50, itemFeePct: 0.1, itemFeeMin: 500, exclusiveFee: 25000 }

export function itemGiftFee(item, qty) {
  const each = item.exclusive ? GIFT.exclusiveFee : Math.max(GIFT.itemFeeMin, Math.round(item.price * GIFT.itemFeePct))
  return each * qty
}

/** What the sender pays for a gift (amount + fee), or an error. */
export function giftQuote(s, { kind, amount, itemId, qty }) {
  if (s.level < GIFT.minLevel) return { error: `You can send gifts from Level ${GIFT.minLevel}.` }
  if (kind === 'cash' || kind === 'gold') {
    const n = Math.floor(Number(amount))
    if (!(n >= 1)) return { error: 'Enter an amount.' }
    const fee = Math.ceil(n * GIFT.feePct)
    const have = kind === 'cash' ? s.cash : s.gold
    if (have < n + fee) return { error: `You need ${kind === 'cash' ? money(n + fee) : `${n + fee} Gold`} (gift + 5% fee).` }
    return { kind, amount: n, fee }
  }
  if (kind === 'item') {
    const item = getItem(itemId)
    const q = Math.floor(Number(qty) || 1)
    if (!item) return { error: 'Pick an item.' }
    if (item.unique) return { error: 'Boss trophies can\'t be gifted.' }
    if (q < 1 || q > GIFT.maxQty) return { error: `Send 1 to ${GIFT.maxQty} at a time.` }
    if ((s.inventory[itemId] || 0) < q) return { error: `You only have ${s.inventory[itemId] || 0}.` }
    const fee = itemGiftFee(item, q)
    if (s.cash < fee) return { error: `Shipping costs ${money(fee)} cash on hand.` }
    return { kind, itemId, qty: q, fee }
  }
  return { error: 'Unknown gift.' }
}

export function applyGiftOut(state, quote, toName) {
  const s = clone(state)
  if (quote.kind === 'cash') s.cash -= quote.amount + quote.fee
  if (quote.kind === 'gold') s.gold -= quote.amount + quote.fee
  if (quote.kind === 'item') { s.inventory[quote.itemId] -= quote.qty; s.cash -= quote.fee }
  const what = describe(quote)
  toast(s, `Sent ${what} to ${toName}. Fee: ${quote.kind === 'gold' ? `${quote.fee} Gold` : money(quote.fee)}.`, 'win')
  log(s, `You sent ${what} to ${toName}.`, 'info')
  return s
}

export function applyGiftIn(state, quote, fromName) {
  const s = clone(state)
  if (quote.kind === 'cash') s.cash += quote.amount
  if (quote.kind === 'gold') s.gold += quote.amount
  if (quote.kind === 'item') s.inventory[quote.itemId] = (s.inventory[quote.itemId] || 0) + quote.qty
  log(s, `🎁 ${fromName} sent you ${describe(quote)}.`, 'win')
  s.unread = (s.unread || 0) + 1
  return s
}

export function describe(q) {
  if (q.kind === 'cash') return money(q.amount)
  if (q.kind === 'gold') return `${q.amount} Gold`
  return `${q.qty}x ${getItem(q.itemId).name}`
}
