import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { FACTIONS, formatPerk } from '../data/factions'
import FactionBanner from './FactionBanner'
import Avatar from './Avatar'
import { BackupPanel } from './Modals'
import SignatureWeapon from '../art/SignatureWeapon'
import { ASSET_MAP } from '../assetMap'

export default function FactionSelect({ onStart, onRestore }) {
  const [showRestore, setShowRestore] = useState(false)
  const [picked, setPicked] = useState(null)
  const [name, setName] = useState('')
  const f = FACTIONS.find((x) => x.id === picked)

  return (
    <div className="min-h-full noir-grain px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <div className="label mb-2 text-brass">A Global Underworld RPG</div>
          <h1><img src={ASSET_MAP.logo} alt="Syndicate City" className="mx-auto w-full max-w-[420px] drop-shadow-[0_6px_16px_rgba(0,0,0,.8)]" /></h1>
          {onRestore && <button className="mt-2 text-xs text-brass underline-offset-2 hover:underline" onClick={() => setShowRestore((v) => !v)}>Have a backup code? Restore your boss</button>}
          {showRestore && <div className="mx-auto mt-3 max-w-md text-left"><BackupPanel s={null} onRestore={onRestore} /></div>}
          <p className="mx-auto mt-3 max-w-xl text-stone-400">Choose your syndicate. Rise from street rookie to supreme boss. Every rank changes how you look and how you fight.</p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FACTIONS.map((fac) => {
            const active = picked === fac.id
            return (
              <button
                key={fac.id}
                onClick={() => setPicked(fac.id)}
                className={`panel group overflow-hidden text-left transition hover:-translate-y-0.5 ${active ? 'ring-2' : ''}`}
                style={active ? { '--tw-ring-color': fac.accent, borderColor: fac.accent } : undefined}
              >
                <FactionBanner factionId={fac.id} height={140}>
                  <div className="relative flex h-full flex-col justify-end p-3 [text-shadow:0_2px_6px_#000]">
                    <div className="text-[11px] uppercase tracking-widest" style={{ color: fac.accent }}>{fac.city}</div>
                    <div className="font-display text-xl font-bold text-white">{fac.name}</div>
                  </div>
                </FactionBanner>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar factionId={fac.id} rank={0} size={64} />
                    <ChevronRight size={16} className="text-stone-500" />
                    <Avatar factionId={fac.id} rank={9} size={64} />
                    <div className="ml-1 min-w-0 text-xs text-stone-400">
                      <div className="truncate"><span className="text-stone-300">{fac.ranks[0].title}</span></div>
                      <div className="truncate">→ <span style={{ color: fac.accent }}>{fac.ranks[9].title}</span></div>
                      <div className="mt-1 truncate">Mentor: <span className="text-stone-300">{fac.mentor}</span></div>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-stone-400">{fac.vibe}</p>
                  <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-gold/40 bg-gold/5 px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="shrink-0"><SignatureWeapon factionId={fac.id} tier={5} width={64} /></div>
                      <span className="truncate text-sm font-semibold text-stone-200">{fac.weapon}</span>
                    </div>
                    <span className="chip shrink-0 bg-gold text-ink">FACTION EXCLUSIVE</span>
                  </div>
                  <div className="mt-2 text-xs text-stone-400">Specialty: <span className="text-stone-300">{fac.specialty}</span></div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="panel sticky bottom-4 mt-6 flex flex-col gap-3 p-4 shadow-2xl sm:flex-row sm:items-center" style={f ? { borderColor: f.accent } : undefined}>
          <div className="min-w-0 flex-1">
            {f ? (
              <div className="text-sm text-stone-300">
                <span className="font-semibold" style={{ color: f.accent }}>{f.name}</span> — starting perks:{' '}
                {Object.entries(f.ranks[0].perks).map(([k, v]) => formatPerk(k, v)).join(', ')}
              </div>
            ) : (
              <div className="text-sm text-stone-400">Pick a syndicate above.</div>
            )}
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 24))}
            placeholder="Boss name"
            className="w-full rounded-lg border border-line bg-black/40 px-3 py-2 text-stone-100 outline-none focus:border-gold sm:w-56"
            onKeyDown={(e) => e.key === 'Enter' && f && name.trim() && onStart(name, f.id)}
          />
          <button className="btn-gold px-5" disabled={!f || !name.trim()} onClick={() => onStart(name, f.id)}>
            Take Over the City
          </button>
        </div>
      </div>
    </div>
  )
}
