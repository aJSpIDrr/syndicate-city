import { Materials, m, useUid } from './defs'
import { getFaction } from '../data/factions'

// 128x64 hero art for each faction's exclusive weapon. Finish evolves with forge tier:
// Mk I–III gunmetal, Mk IV engraved, Mk V gold-plated, Mk VI–X mythic gold with faction glow.
function finish(tier) {
  if (tier >= 6) return { body: 'gold', trim: 'gold', engraved: true, mythic: true }
  if (tier === 5) return { body: 'gold', trim: 'metal', engraved: true }
  if (tier === 4) return { body: 'steel', trim: 'metal', engraved: true }
  return { body: tier >= 2 ? 'steel' : 'metal', trim: 'black' }
}

const Engrave = ({ d }) => <path d={d} fill="none" stroke="#FFF6D5" strokeOpacity=".7" strokeWidth=".6" strokeDasharray="1.2 1" />

const W = {
  families: (u, f) => ( // Thompson SMG
    <g>
      <rect x="62" y="27" width="50" height="5" rx="1.5" fill={m(u, f.body)} />
      {[70, 76, 82, 88, 94, 100].map((x) => <rect key={x} x={x} y="26" width="2.4" height="7" fill={m(u, f.trim)} />)}
      <rect x="110" y="28" width="8" height="3" fill={m(u, f.trim)} />
      <path d="M36 24 H66 V36 H36 Z" fill={m(u, f.body)} />
      <circle cx="58" cy="44" r="10" fill={m(u, f.trim)} /><circle cx="58" cy="44" r="6" fill={m(u, f.body)} opacity=".6" />
      <path d="M40 36 H50 L48 52 Q48 56 44 56 H40 Q36 56 37 52 Z" fill={m(u, 'wood')} />
      <path d="M68 33 H82 L80 42 Q79 46 75 45 L72 44 Z" fill={m(u, 'wood')} />
      <path d="M36 25 L6 28 L4 40 Q12 42 18 40 L36 34 Z" fill={m(u, 'wood')} />
      <path d="M52 36 q4 2 3 8 h-5" fill="none" stroke={m(u, f.body)} strokeWidth="1.6" />
      {f.engraved && <Engrave d="M40 28 q6 -3 12 0 t12 0 M10 33 q8 -3 20 -1" />}
    </g>
  ),
  firm: (u, f) => ( // Silenced Walther PPK
    <g>
      <rect x="84" y="24" width="38" height="9" rx="4.5" fill={m(u, 'black')} />
      {[90, 98, 106, 114].map((x) => <line key={x} x1={x} y1="24.5" x2={x} y2="32.5" stroke="#000" strokeOpacity=".6" />)}
      <path d="M30 22 H86 V34 H30 Z" fill={m(u, f.body)} />
      {[66, 70, 74, 78].map((x) => <line key={x} x1={x} y1="23" x2={x} y2="33" stroke="#000" strokeOpacity=".45" />)}
      <path d="M30 34 H68 V38 H50 L46 44 H40 Z" fill={m(u, f.trim)} />
      <path d="M32 34 H46 L52 58 Q52 62 47 62 H40 Q35 62 35 58 Z" fill={m(u, 'black')} />
      {[40, 45, 50, 55].map((y) => <line key={y} x1="37" y1={y} x2="48" y2={y + 1} stroke="#3A3D42" />)}
      <path d="M50 38 q6 2 4 8 h-6" fill="none" stroke={m(u, f.body)} strokeWidth="1.6" />
      {f.engraved && <Engrave d="M34 26 q8 4 16 0 t16 0 t16 0" />}
    </g>
  ),
  yakuza: (u, f) => ( // Masterwork katana
    <g transform="rotate(-8 64 32)">
      <path d="M44 30 L118 26 Q124 26 122 29 L118 32 L44 34 Z" fill={m(u, 'chrome')} />
      <path d="M48 32.6 Q80 32 118 30.8" stroke="#6A7480" strokeWidth=".7" fill="none" strokeDasharray="3 2" />
      <path d="M46 30.5 L118 26.8" stroke="#fff" strokeOpacity=".8" strokeWidth=".6" />
      <rect x="40" y="27" width="5" height="10" rx="1" fill={m(u, f.trim === 'black' ? 'brass' : 'gold')} />
      <ellipse cx="42.5" cy="32" rx="3" ry="8" fill={m(u, f.body)} />
      <path d="M8 29.5 H40 V34.5 H8 Q5 34.5 5 32 Q5 29.5 8 29.5 Z" fill={m(u, 'black')} />
      {[12, 18, 24, 30, 36].map((x) => <path key={x} d={`M${x} 29.5 L${x + 3} 34.5 M${x + 3} 29.5 L${x} 34.5`} stroke={f.mythic ? '#EF233C' : '#E9E6DF'} strokeWidth=".8" />)}
      {f.engraved && <Engrave d="M60 31 q10 -2 20 -1 t20 -1" />}
    </g>
  ),
  triad: (u, f) => ( // Type 59 pistol
    <g>
      <path d="M36 22 H104 Q108 22 108 26 V34 H36 Z" fill={m(u, f.body)} />
      {[84, 88, 92, 96].map((x) => <line key={x} x1={x} y1="23" x2={x} y2="33" stroke="#000" strokeOpacity=".5" />)}
      <rect x="104" y="27" width="6" height="4" fill={m(u, f.trim)} />
      <path d="M36 34 H80 V38 H58 L54 44 H46 Z" fill={m(u, f.trim)} />
      <path d="M38 34 H54 L60 58 Q60 62 55 62 H46 Q41 62 41 58 Z" fill={m(u, 'jade')} />
      <circle cx="49" cy="48" r="3.5" fill="none" stroke={m(u, 'gold')} strokeWidth="1" />
      <path d="M58 38 q6 2 4 8 h-6" fill="none" stroke={m(u, f.body)} strokeWidth="1.6" />
      {f.engraved && <Engrave d="M40 26 q6 4 12 0 t12 0 t12 0 t12 0" />}
    </g>
  ),
  syndicate: (u, f) => ( // R4 assault rifle
    <g>
      <rect x="78" y="26" width="42" height="4" fill={m(u, f.body)} />
      <rect x="116" y="25" width="6" height="6" fill={m(u, f.trim)} />
      <path d="M78 24 H100 V32 H78 Z" fill={m(u, 'khaki')} />
      <path d="M40 22 H80 V34 H40 Z" fill={m(u, f.body)} />
      <rect x="54" y="18" width="18" height="4" fill={m(u, f.trim)} />
      <path d="M58 34 H70 L74 54 Q66 56 60 52 Z" fill={m(u, f.trim)} />
      <path d="M44 34 H54 L50 50 Q49 53 45 52 L42 51 Z" fill={m(u, 'black')} />
      <path d="M40 24 L10 22 L8 36 Q20 38 26 36 L40 32 Z" fill={m(u, 'black')} />
      <path d="M12 26 L36 27" stroke="#3A3D42" strokeWidth="3" />
      {f.engraved && <Engrave d="M44 26 q8 4 16 0 t16 0" />}
    </g>
  ),
  sinaloa: (u, f) => ( // Gold-engraved Desert AK-47
    <g>
      <rect x="80" y="26" width="40" height="3.4" fill={m(u, f.body)} />
      <rect x="80" y="22.5" width="30" height="2.6" fill={m(u, f.body)} />
      <rect x="116" y="21" width="3" height="5" fill={m(u, f.trim)} />
      <path d="M80 25 H100 V32 H80 Z" fill={m(u, 'wood')} />
      <path d="M42 22 H82 V34 H42 Z" fill={m(u, f.body)} />
      <path d="M60 34 Q64 50 76 56 L80 52 Q70 46 68 34 Z" fill={m(u, f.trim === 'black' ? 'metal' : 'gold')} />
      <path d="M46 34 H56 L52 50 Q51 53 47 52 L44 51 Z" fill={m(u, 'wood')} />
      <path d="M42 24 L8 28 L6 40 Q16 42 22 38 L42 32 Z" fill={m(u, 'wood')} />
      {f.engraved && <Engrave d="M46 26 q4 -3 8 0 t8 0 t8 0 t8 0 M12 32 q6 -3 14 -2" />}
    </g>
  ),
}

export default function SignatureWeapon({ factionId, tier = 1, width = 128 }) {
  const u = useUid()
  const fac = getFaction(factionId)
  const f = finish(tier)
  return (
    <svg viewBox="0 0 128 64" width={width} height={width / 2} className="block overflow-visible">
      <defs>
        <Materials id={u} />
        <radialGradient id={`${u}-aura`}>
          <stop offset="0%" stopColor={fac.accent} stopOpacity=".55" /><stop offset="100%" stopColor={fac.accent} stopOpacity="0" />
        </radialGradient>
        <filter id={`${u}-glow`} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {f.mythic && <ellipse cx="64" cy="34" rx="64" ry="30" fill={`url(#${u}-aura)`} />}
      <g filter={f.mythic ? `url(#${u}-glow)` : `url(#${u}-shadow)`}>{W[factionId](u, f)}</g>
      {f.mythic && [[20, 14], [96, 12], [110, 46], [30, 52]].slice(0, tier - 5).map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 3} l1 2 l2 1 l-2 1 l-1 2 l-1 -2 l-2 -1 l2 -1 Z`} fill="#FFF6D5" />
      ))}
    </svg>
  )
}
