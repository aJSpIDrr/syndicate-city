import { Materials, m, useUid } from './defs'

const Crate = ({ u, children }) => (
  <g>
    <path d="M8 26 L32 18 L56 26 V50 L32 58 L8 50 Z" fill={m(u, 'wood')} />
    <path d="M8 26 L32 34 L56 26 M32 34 V58" fill="none" stroke="#3E2210" strokeWidth="1.4" />
    <path d="M8 26 L32 18 L56 26 L32 34 Z" fill="#B07040" opacity=".55" />
    <path d="M10 38 L30 45 M34 45 L54 38" stroke="#3E2210" strokeWidth="1" />
    {children}
  </g>
)

const S = {
  cigarettes: (u) => (
    <Crate u={u}>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${16 + i * 9} ${12 - i * 1.5})`}>
          <rect width="8" height="12" rx="1" fill="#E9E6DF" /><rect width="8" height="4" fill="#A4161A" />
          <rect x="2" y="-2" width="1.5" height="3" fill="#E9D9A8" /><rect x="4.5" y="-1.5" width="1.5" height="3" fill="#E9D9A8" />
        </g>
      ))}
    </Crate>
  ),
  alcohol: (u) => (
    <Crate u={u}>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${17 + i * 9} ${6 - i})`}>
          <rect x="2.2" y="0" width="3" height="6" fill="#3B2A1A" />
          <path d="M1 6 h5.4 q1.6 2 1.6 5 v12 h-8.6 v-12 q0 -3 1.6 -5 Z" fill={i === 1 ? '#7A3E12' : '#2F5A2E'} />
          <rect x="0.8" y="13" width="7" height="5" fill="#E9D9A8" />
        </g>
      ))}
    </Crate>
  ),
  plates: (u) => (
    <g>
      <rect x="8" y="22" width="40" height="24" rx="2" fill={m(u, 'steel')} transform="rotate(-8 28 34)" />
      <rect x="16" y="16" width="40" height="24" rx="2" fill={m(u, 'chrome')} />
      <rect x="19" y="19" width="34" height="18" rx="1" fill="none" stroke="#4A525B" strokeWidth=".8" />
      <circle cx="36" cy="28" r="6" fill="none" stroke="#4A525B" strokeWidth="1" />
      <text x="36" y="31" textAnchor="middle" fontSize="7" fontWeight="700" fill="#4A525B">$</text>
      <text x="23" y="24" fontSize="4" fill="#4A525B">100</text><text x="45" y="35" fontSize="4" fill="#4A525B">100</text>
      <g transform="translate(10 44)"><rect width="30" height="13" rx="1" fill="#6E9A6A" /><rect x="2" y="2" width="26" height="9" fill="none" stroke="#2F5A2E" strokeWidth=".6" /></g>
    </g>
  ),
  jewels: (u) => (
    <g>
      <ellipse cx="32" cy="52" rx="24" ry="6" fill="#000" opacity=".35" />
      {[[20, 40, '#E0434F'], [36, 42, '#4CC9F0'], [28, 30, '#F5F7FA'], [44, 32, '#5FD3A5'], [14, 30, '#C084FC']].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M-7 -3 L-4 -8 H4 L7 -3 L0 8 Z" fill={c} />
          <path d="M-7 -3 H7 M-4 -8 L-2 -3 L0 8 M4 -8 L2 -3 L0 8" stroke="#fff" strokeOpacity=".5" strokeWidth=".5" fill="none" />
        </g>
      ))}
      <path d="M10 48 Q32 58 54 48" fill="none" stroke={m(u, 'gold')} strokeWidth="1.6" />
      {[16, 24, 32, 40, 48].map((x, i) => <circle key={x} cx={x} cy={50 + (i % 2)} r="1.6" fill="#F5F7FA" />)}
    </g>
  ),
  bullion: (u) => (
    <g>
      {[[10, 40], [30, 40], [20, 28]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M4 0 H20 L24 12 H0 Z" fill={m(u, 'gold')} />
          <path d="M4 0 H20 L18 4 H6 Z" fill="#FFF6D5" opacity=".6" />
          <text x="12" y="10" textAnchor="middle" fontSize="4" fontWeight="700" fill="#8A6D1F">999.9</text>
        </g>
      ))}
    </g>
  ),
  evidence: (u) => (
    <g>
      <path d="M10 18 H26 L30 22 H54 V54 H10 Z" fill={m(u, 'paper')} />
      <rect x="14" y="26" width="36" height="24" fill="#F2EBDD" transform="rotate(-4 32 38)" />
      {[30, 34, 38, 42].map((y) => <line key={y} x1="18" y1={y} x2="44" y2={y - 1.5} stroke="#9C8650" strokeWidth=".8" />)}
      <rect x="30" y="40" width="20" height="9" rx="1" fill="none" stroke="#A4161A" strokeWidth="1.4" transform="rotate(-12 40 44)" />
      <text x="40" y="46.5" textAnchor="middle" fontSize="5" fontWeight="800" fill="#A4161A" transform="rotate(-12 40 44)">SECRET</text>
      <rect x="18" y="20" width="8" height="12" fill="#E9E6DF" transform="rotate(8 22 26)" /><rect x="19" y="21" width="6" height="7" fill="#3A3D42" transform="rotate(8 22 26)" />
    </g>
  ),
  briefcase: (u) => (
    <g>
      <path d="M24 18 Q24 12 30 12 H34 Q40 12 40 18" fill="none" stroke="#1C1E21" strokeWidth="3" />
      <rect x="6" y="18" width="52" height="34" rx="4" fill={m(u, 'leather')} />
      <path d="M6 30 H58" stroke="#2A1A10" strokeWidth="1.4" />
      <rect x="16" y="27" width="6" height="6" rx="1" fill={m(u, 'brass')} /><rect x="42" y="27" width="6" height="6" rx="1" fill={m(u, 'brass')} />
      <rect x="6" y="18" width="52" height="34" rx="4" fill="none" stroke="#2A1A10" />
      <path d="M10 22 Q12 36 10 48" stroke="#fff" strokeOpacity=".15" strokeWidth="2" fill="none" />
    </g>
  ),
  firearms: (u) => (
    <g>
      <rect x="6" y="24" width="52" height="28" rx="2" fill={m(u, 'olive')} />
      <rect x="6" y="24" width="52" height="7" fill="#2C3022" />
      {[12, 50].map((x) => <rect key={x} x={x} y="22" width="4" height="32" fill="#1E2216" />)}
      <path d="M18 42 H40 L44 39 H48 V43 H44 L40 46 H26 L22 50 H18 Z" fill="#E9E6DF" opacity=".75" />
      <text x="32" y="36" textAnchor="middle" fontSize="5" fontWeight="800" fill="#E9E6DF" opacity=".8">EXPORT</text>
      <path d="M2 20 L22 10 L24 14 L4 24 Z" fill={m(u, 'black')} />
    </g>
  ),
}

export default function ContrabandSprite({ id, size = 64, glow }) {
  const u = useUid()
  const draw = S[id]
  if (!draw) return null
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="block overflow-visible">
      <defs>
        <Materials id={u} />
        {glow && <radialGradient id={`${u}-halo`}><stop offset="0%" stopColor={glow} stopOpacity=".35" /><stop offset="100%" stopColor={glow} stopOpacity="0" /></radialGradient>}
      </defs>
      {glow && <circle cx="32" cy="36" r="30" fill={`url(#${u}-halo)`} />}
      <g filter={`url(#${u}-shadow)`}>{draw(u)}</g>
    </svg>
  )
}
