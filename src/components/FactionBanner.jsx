import { ASSET_MAP } from '../assetMap'
import { getFaction } from '../data/factions'

// City silhouettes for each faction banner (400x120). Replaced by ASSET_MAP.factionBanners when set.
const SKYLINES = {
  families: (c) => (
    <>
      <path d="M0 120 V82 H20 V60 H32 V40 H40 V60 H52 V75 H70 V50 H78 V30 H84 V50 H92 V85 H400 V120 Z" fill="#000" opacity=".55" />
      <path d="M150 120 V40 H158 V120 M290 120 V40 H298 V120" stroke="#000" strokeWidth="6" opacity=".7" />
      <path d="M100 95 Q154 35 154 40 Q224 100 294 40 Q300 35 360 95" fill="none" stroke={c} strokeWidth="1.2" opacity=".6" />
      <path d="M100 95 H400" stroke="#000" strokeWidth="5" opacity=".7" />
      {[170, 190, 210, 230, 250, 270].map((x) => <line key={x} x1={x} y1="95" x2={x} y2={60 + Math.abs(x - 224) * 0.6} stroke={c} strokeWidth=".6" opacity=".45" />)}
    </>
  ),
  firm: (c) => (
    <>
      <path d="M0 120 V90 H40 V80 H70 V92 H120 V84 H150 V120 Z M210 120 V88 H260 V78 H300 V90 H400 V120 Z" fill="#000" opacity=".55" />
      <path d="M170 120 V40 L176 22 L182 40 V120 Z" fill="#000" opacity=".8" />
      <rect x="166" y="40" width="20" height="18" fill="#000" opacity=".85" />
      <circle cx="176" cy="49" r="6" fill={c} opacity=".55" />
      <path d="M176 49 V45 M176 49 H179" stroke="#000" strokeWidth="1" />
    </>
  ),
  yakuza: (c) => (
    <>
      <path d="M0 120 V70 H30 V50 H60 V80 H90 V40 H120 V75 H160 V55 H200 V85 H240 V45 H280 V70 H320 V35 H350 V80 H400 V120 Z" fill="#000" opacity=".6" />
      {[[38, 56], [98, 48], [168, 62], [248, 52], [326, 42]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="8" height="26" rx="1" fill={c} opacity={0.5 + (i % 2) * 0.3} />
      ))}
      {Array.from({ length: 20 }, (_, i) => <line key={i} x1={i * 21} y1="0" x2={i * 21 - 8} y2="30" stroke="#fff" strokeOpacity=".08" />)}
    </>
  ),
  triad: (c) => (
    <>
      <path d="M0 120 V60 H20 V30 H34 V60 H50 V20 L58 10 L66 20 V60 H90 V45 H110 V70 H140 V35 H156 V75 H400 V120 Z" fill="#000" opacity=".55" />
      <path d="M0 100 H400" stroke={c} strokeOpacity=".3" />
      <path d="M260 98 L300 98 L295 104 L265 104 Z" fill="#000" opacity=".8" />
      <path d="M280 98 V62 Q300 72 304 92 Z" fill={c} opacity=".35" />
    </>
  ),
  syndicate: (c) => (
    <>
      <path d="M0 120 V90 Q80 70 160 88 Q260 66 400 86 V120 Z" fill="#000" opacity=".55" />
      <path d="M90 92 L110 30 L130 92 M98 70 H122 M103 52 H117" stroke="#000" strokeWidth="4" fill="none" opacity=".8" />
      <circle cx="110" cy="30" r="6" fill="none" stroke="#000" strokeWidth="3" opacity=".8" />
      <rect x="250" y="86" width="44" height="18" rx="3" fill="#000" opacity=".8" />
      <circle cx="292" cy="94" r="3" fill={c} opacity=".9" />
    </>
  ),
  sinaloa: (c) => (
    <>
      <path d="M0 120 V80 L60 40 L110 75 L170 30 L240 78 L300 50 L400 85 V120 Z" fill="#000" opacity=".4" />
      <path d="M120 120 V88 H280 V120 Z" fill="#000" opacity=".7" />
      {[140, 170, 200, 230, 260].map((x) => <path key={x} d={`M${x - 10} 120 V104 Q${x} 92 ${x + 10} 104 V120`} fill={c} opacity=".25" />)}
      <path d="M340 120 V84 M340 96 H332 V88 M340 92 H348 V84" stroke="#000" strokeWidth="4" fill="none" opacity=".75" />
    </>
  ),
}

export default function FactionBanner({ factionId, height = 120, children, header = false }) {
  const f = getFaction(factionId)
  const url = (header && ASSET_MAP.headerBanners[factionId]) || ASSET_MAP.factionBanners[factionId]
  return (
    <div className="relative w-full overflow-hidden" style={{ height, background: `linear-gradient(135deg, ${f.deep}, #0B0C0E 85%)` }}>
      {url ? (
        <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
          <circle cx="330" cy="30" r="40" fill={f.accent} opacity=".08" />
          {SKYLINES[factionId](f.accent)}
        </svg>
      )}
      <div className={`absolute inset-0 bg-gradient-to-t ${url ? 'from-black/95 via-black/50' : 'from-black/70 via-transparent'} to-transparent`} />
      {header && url && <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/20" />}
      <div className="relative h-full">{children}</div>
    </div>
  )
}
