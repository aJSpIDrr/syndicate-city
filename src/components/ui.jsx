import { useEffect, useState } from 'react'
import {
  X, Sword, Shield, Car, Package, Cigarette, Wine, Gem, FileText, Briefcase, Bomb, Banknote, Crosshair, Coins,
} from 'lucide-react'
import { RARITY } from '../data/content'
import { ASSET_MAP } from '../assetMap'

export function Modal({ open, onClose, title, children, wide = false, accent, top = false }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className={`fixed inset-0 ${top ? 'z-[55]' : 'z-50'} flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4`} onClick={onClose}>
      <div
        className={`animate-pop panel rivets w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[92vh] overflow-y-auto rounded-b-none sm:rounded-xl shadow-2xl`}
        style={accent ? { borderColor: accent } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-panel/95 px-5 py-3 backdrop-blur">
          <h2 className="font-display text-xl font-bold text-stone-100">{title}</h2>
          {onClose && (
            <button onClick={onClose} className="rounded-md p-1.5 text-stone-400 hover:bg-white/5 hover:text-stone-100" aria-label="Close">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function Bar({ value, max, color, height = 6 }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  return (
    <div className="w-full overflow-hidden rounded-full bg-black/50" style={{ height }}>
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export function Toast({ toast }) {
  const [shown, setShown] = useState(null)
  useEffect(() => {
    if (!toast) return
    setShown(toast)
    const id = setTimeout(() => setShown((t) => (t?.id === toast.id ? null : t)), 3200)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast?.id])
  if (!shown) return null
  const color = { win: '#34D399', error: '#F87171', level: '#D4AF37', info: '#93C5FD' }[shown.kind] || '#93C5FD'
  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-[60] w-[calc(100%-32px)] max-w-md -translate-x-1/2 md:bottom-6">
      <div key={shown.id} className="animate-pop rounded-lg border bg-panel/95 px-4 py-3 text-sm text-stone-100 shadow-xl backdrop-blur" style={{ borderColor: color }}>
        {shown.text}
      </div>
    </div>
  )
}

const CONTRABAND_ICONS = { cigarettes: Cigarette, alcohol: Wine, plates: Banknote, jewels: Gem, bullion: Coins, evidence: FileText, briefcase: Briefcase, firearms: Bomb }
const CATEGORY_ICONS = { weapon: Sword, armor: Shield, vehicle: Car }

export function ItemArt({ kind, id, category, rarity, size = 56 }) {
  const url = kind === 'contraband' ? ASSET_MAP.contraband[id] : ASSET_MAP.items[id]
  const color = RARITY[rarity]?.color || '#9CA3AF'
  if (url) return <img src={url} alt="" className="h-full w-full object-contain" />
  const Icon = kind === 'contraband' ? CONTRABAND_ICONS[id] || Package : CATEGORY_ICONS[category] || Crosshair
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg" style={{ background: `radial-gradient(circle at 50% 40%, ${color}33, transparent 70%)` }}>
      <Icon size={size * 0.55} color={color} strokeWidth={1.6} />
    </div>
  )
}

export function RarityTag({ rarity }) {
  const r = RARITY[rarity]
  return <span className="chip" style={{ background: `${r.color}22`, color: r.color }}>{r.label}</span>
}

export function Section({ title, right, children, className = '' }) {
  return (
    <section className={`panel p-4 sm:p-5 ${className}`}>
      {(title || right) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && <h3 className="font-display text-lg font-bold text-stone-100">{title}</h3>}
          {right}
        </div>
      )}
      {children}
    </section>
  )
}

export function Stat({ label, value, sub, color }) {
  return (
    <div className="rounded-lg border border-line bg-black/20 px-3 py-2">
      <div className="label">{label}</div>
      <div className="text-lg font-bold tabular-nums" style={color ? { color } : undefined}>{value}</div>
      {sub && <div className="text-xs text-stone-400">{sub}</div>}
    </div>
  )
}

export function fmtTime(secs) {
  const s = Math.max(0, Math.ceil(secs))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}
