import { Materials, m, useUid } from './defs'

// 400x150 illustrated district scenes (district cards + job banners) and 160x90 property art.
const win = (x, y, w, h, cols, rows, color, seed = 1) => {
  const out = []
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    if ((c * 7 + r * 13 + seed) % 3 === 0) continue
    out.push(<rect key={`${c}-${r}`} x={x + c * (w / cols) + 1} y={y + r * (h / rows) + 1} width={w / cols - 2.4} height={h / rows - 3} fill={color} opacity={0.5 + ((c + r + seed) % 3) * 0.2} />)
  }
  return out
}
const rain = (n = 40, op = 0.18) => Array.from({ length: n }, (_, i) => (
  <line key={i} x1={(i * 37) % 400} y1={(i * 53) % 150} x2={(i * 37) % 400 - 6} y2={(i * 53) % 150 + 14} stroke="#BFD3E6" strokeOpacity={op} strokeWidth=".8" />
))

const SCENES = {
  docks: { sky: ['#1D3557', '#0B1220'], draw: (u) => (
    <>
      <circle cx="320" cy="34" r="16" fill="#E9E3C8" opacity=".85" />
      <path d="M0 90 V60 H30 V45 H50 V70 H80 V52 H96 V90 Z" fill="#0A0F18" />
      {/* cranes */}
      <path d="M150 100 V30 H156 V100 M150 34 L230 34 L230 38 L156 40 M210 38 V60" stroke="#111A28" strokeWidth="4" fill="none" />
      <rect x="203" y="60" width="14" height="10" fill="#7A2E1E" />
      <path d="M260 100 V44 H265 V100 M260 48 H330 V51 H265" stroke="#111A28" strokeWidth="3.4" fill="none" />
      <path d="M0 100 H400 V150 H0 Z" fill={m(u, 'water')} />
      {[110, 122, 134].map((y, i) => <path key={y} d={`M0 ${y} q20 -3 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0`} stroke="#E9E3C8" strokeOpacity={0.12 - i * 0.03} fill="none" />)}
      <path d="M320 34 L330 150" stroke="#E9E3C8" strokeOpacity=".08" strokeWidth="18" />
      {/* pier & crates */}
      <path d="M0 96 H200 V102 H0 Z" fill="#3E2A1A" />
      {[10, 50, 90, 130, 170].map((x) => <rect key={x} x={x} y="102" width="5" height="40" fill="#24180E" />)}
      {[[24, 78, '#7A2E1E'], [60, 78, '#1F4E5F'], [40, 60, '#5C5346']].map(([x, y, c], i) => <rect key={i} x={x} y={y} width="34" height="18" fill={c} stroke="#000" strokeOpacity=".4" />)}
      <path d="M240 112 L380 112 L370 126 L250 126 Z" fill="#0A0F18" /><rect x="300" y="96" width="40" height="16" fill="#0A0F18" />
      <rect x="306" y="100" width="6" height="5" fill="#FFD27A" opacity=".8" />
    </>
  ) },
  midtown: { sky: ['#2B3A55', '#0B0F18'], draw: () => (
    <>
      {[[10, 50, 40, 100], [56, 30, 36, 120], [100, 64, 30, 86], [140, 12, 30, 138], [176, 44, 44, 106], [228, 26, 38, 124], [274, 58, 30, 92], [312, 36, 44, 114], [362, 70, 38, 80]].map(([x, y, w, h], i) => (
        <g key={i}><rect x={x} y={y} width={w} height={h} fill={i % 2 ? '#0E1422' : '#121A2B'} />{win(x + 3, y + 6, w - 6, h - 10, Math.floor(w / 7), Math.floor(h / 9), '#FFD27A', i)}</g>
      ))}
      <path d="M150 12 L155 -6 L160 12 Z" fill="#0E1422" /><rect x="154" y="-12" width="2" height="8" fill="#0E1422" />
      <path d="M0 130 H400 V150 H0 Z" fill="#07090E" />
      <path d="M0 132 H400" stroke="#C5A059" strokeOpacity=".4" />
      {[40, 120, 220, 330].map((x) => <g key={x}><rect x={x} y="112" width="2" height="20" fill="#222" /><circle cx={x + 1} cy="112" r="4" fill="#FFE29A" opacity=".8" /></g>)}
      <path d="M260 120 h44 l6 6 v6 h-56 v-6 Z" fill="#111" /><circle cx="270" cy="133" r="4" fill="#000" /><circle cx="300" cy="133" r="4" fill="#000" />
    </>
  ) },
  eastend: { sky: ['#3A3D3F', '#121314'], draw: () => (
    <>
      {rain(50, 0.22)}
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i} transform={`translate(${i * 46} 0)`}>
          <path d="M0 150 V70 L23 54 L46 70 V150 Z" fill={i % 2 ? '#2A1E1A' : '#33241E'} />
          <rect x="30" y="44" width="6" height="16" fill="#1A1210" />
          <rect x="8" y="80" width="10" height="14" fill={(i * 3) % 4 ? '#FFC16B' : '#1A1210'} opacity=".7" />
          <rect x="28" y="80" width="10" height="14" fill={(i * 5) % 3 ? '#FFC16B' : '#1A1210'} opacity=".6" />
          <rect x="16" y="112" width="14" height="38" fill="#14100D" />
        </g>
      ))}
      <rect x="230" y="100" width="70" height="14" fill="#5A1A1A" />
      <rect x="236" y="103" width="58" height="8" fill="#C8272D" opacity=".25" />
      <path d="M0 140 H400 V150 H0 Z" fill="#1A1A1A" />
      {[30, 90, 150, 210, 270, 330, 390].map((x) => <ellipse key={x} cx={x} cy="146" rx="16" ry="2" fill="#E9E3C8" opacity=".06" />)}
    </>
  ) },
  downtown: { sky: ['#4A1C1C', '#140A0A'], draw: () => (
    <>
      <path d="M40 150 V60 L120 36 L200 60 V150 Z" fill="#1E1414" />
      <path d="M48 64 H192 V70 H48 Z" fill="#2E2020" />
      {[56, 76, 96, 116, 136, 156, 176].map((x) => <rect key={x} x={x} y="72" width="8" height="70" fill="#2E2020" />)}
      <path d="M260 150 V20 L272 4 L284 20 V150 Z" fill="#170F0F" />
      <rect x="262" y="30" width="20" height="20" fill="#170F0F" /><circle cx="272" cy="40" r="7" fill="#E9C46A" opacity=".75" />
      <path d="M300 150 V80 H400 V150 Z" fill="#1A1111" />{win(304, 86, 92, 56, 8, 5, '#FFC16B', 2)}
      {rain(46, 0.16)}
      <path d="M0 142 H400 V150 H0 Z" fill="#0C0707" />
      <rect x="210" y="110" width="16" height="32" fill="#8E1B1B" /><rect x="212" y="112" width="12" height="10" fill="#FFD27A" opacity=".5" />
    </>
  ) },
  shinjuku: { sky: ['#2A0C14', '#09060A'], draw: () => (
    <>
      {[[0, 30, 50], [54, 10, 40], [98, 40, 44], [146, 20, 36], [186, 0, 50], [240, 34, 40], [284, 16, 46], [334, 40, 34], [372, 22, 28]].map(([x, y, w], i) => (
        <g key={i}><rect x={x} y={y} width={w} height={150 - y} fill="#0E0A10" />{win(x + 3, y + 8, w - 6, 140 - y, 4, 10, '#7A6BFF', i)}</g>
      ))}
      {[[20, 50, '#EF233C'], [70, 30, '#4CC9F0'], [118, 58, '#F72585'], [200, 20, '#FFD60A'], [258, 52, '#EF233C'], [300, 34, '#4CC9F0'], [346, 58, '#F72585']].map(([x, y, c], i) => (
        <g key={i}><rect x={x} y={y} width="10" height="44" rx="2" fill={c} opacity=".85" /><rect x={x - 4} y={y - 4} width="18" height="52" rx="4" fill={c} opacity=".15" /></g>
      ))}
      <path d="M0 132 H400 V150 H0 Z" fill="#120A12" />
      {[60, 160, 260, 360].map((x, i) => <ellipse key={x} cx={x} cy="140" rx="30" ry="4" fill={['#EF233C', '#4CC9F0', '#F72585', '#FFD60A'][i]} opacity=".15" />)}
      {rain(40, 0.14)}
    </>
  ) },
  kowloon: { sky: ['#00513D', '#04140F'], draw: (u) => (
    <>
      {[[10, 30, 30], [44, 10, 26], [74, 44, 34], [112, 0, 28], [144, 26, 40], [190, 50, 30]].map(([x, y, w], i) => (
        <g key={i}><rect x={x} y={y} width={w} height={110 - y} fill="#06201A" />{win(x + 3, y + 6, w - 6, 100 - y, 4, 9, '#FFD700', i)}</g>
      ))}
      <path d="M114 0 L126 -10 L138 0 Z" fill="#06201A" />
      <path d="M0 108 H400 V150 H0 Z" fill={m(u, 'water')} />
      {[0, 40, 112, 150].map((x, i) => <rect key={x} x={x + 14} y="110" width="3" height="30" fill="#FFD700" opacity={0.15 - i * 0.02} />)}
      {/* junk boat */}
      <path d="M250 116 H350 L340 128 H262 Z" fill="#2A1A10" />
      <path d="M280 116 V50 Q300 66 304 112 Z" fill="#A4161A" opacity=".85" />
      <path d="M312 116 V62 Q330 76 332 112 Z" fill="#A4161A" opacity=".7" />
      {[60, 70, 80, 90, 100].map((y) => <line key={y} x1="280" y1={y} x2={290 + (y - 50) / 4} y2={y} stroke="#2A1A10" strokeWidth=".8" />)}
      {[[230, 40], [370, 30]].map(([x, y], i) => <g key={i}><path d={`M${x} ${y} q6 -6 12 0 v10 q-6 4 -12 0 Z`} fill="#E63946" /><circle cx={x + 6} cy={y + 5} r="8" fill="#E63946" opacity=".15" /></g>)}
    </>
  ) },
  jozi: { sky: ['#6B5A3E', '#14100A'], draw: () => (
    <>
      <circle cx="80" cy="60" r="34" fill="#F4A261" opacity=".35" />
      <path d="M0 110 Q60 84 130 100 Q200 70 280 96 Q340 80 400 92 V150 H0 Z" fill="#2B2216" />
      <path d="M0 120 Q100 100 200 118 T400 112 V150 H0 Z" fill="#1E170E" />
      {/* mine headframe */}
      <path d="M150 104 L170 34 L190 104 M156 80 H184 M161 60 H179 M170 34 L210 104" stroke="#0E0A06" strokeWidth="4" fill="none" />
      <circle cx="170" cy="34" r="8" fill="none" stroke="#0E0A06" strokeWidth="3" />
      {/* skyline */}
      <path d="M260 100 V60 H272 V44 H280 V60 H292 V100 Z M300 100 V30 L306 20 L312 30 V100 Z M320 100 V66 H340 V100 Z" fill="#120E08" />
      {/* highway & cash van */}
      <path d="M0 132 H400 V140 H0 Z" fill="#0E0B07" />
      {[20, 80, 140, 200, 260, 320, 380].map((x) => <rect key={x} x={x} y="135.5" width="20" height="1.2" fill="#D4AF37" opacity=".6" />)}
      <path d="M220 116 h44 l8 8 v8 h-52 Z" fill="#3A3D42" /><rect x="224" y="119" width="20" height="8" fill="#D4AF37" opacity=".5" />
      <circle cx="232" cy="133" r="4" fill="#000" /><circle cx="262" cy="133" r="4" fill="#000" />
    </>
  ) },
  border: { sky: ['#7A3A2A', '#160A08'], draw: () => (
    <>
      <circle cx="300" cy="74" r="40" fill="#F4A261" opacity=".4" />
      <path d="M0 96 L60 56 L110 84 L170 40 L240 86 L300 60 L400 92 V150 H0 Z" fill="#2E1410" />
      <path d="M0 116 H400 V150 H0 Z" fill="#3A2416" />
      <path d="M60 130 L340 120 L344 128 L60 140 Z" fill="#1E140C" />
      {[90, 130, 170, 210, 250, 290].map((x, i) => <rect key={x} x={x} y={131 - i * 1.6} width="16" height="1.4" fill="#E9E3C8" opacity=".5" />)}
      {/* small plane */}
      <path d="M200 64 h44 q6 0 8 3 h-52 Z" fill="#120A08" /><path d="M218 66 l-6 14 h6 l10 -14 Z M218 64 l-6 -10 h5 l9 10 Z" fill="#120A08" />
      <path d="M248 60 v8" stroke="#120A08" strokeWidth="2" />
      {/* cacti & fence */}
      {[[30, 110], [370, 104]].map(([x, y], i) => <path key={i} d={`M${x} ${y + 12} V${y - 14} M${x} ${y - 2} H${x - 6} V${y - 10} M${x} ${y - 6} H${x + 6} V${y - 14}`} stroke="#120A08" strokeWidth="4" strokeLinecap="round" fill="none" />)}
      {[0, 30, 60, 90, 120].map((x) => <line key={x} x1={x + 280} y1="112" x2={x + 280} y2="128" stroke="#120A08" strokeWidth="2" />)}
      <path d="M280 116 H400 M280 122 H400" stroke="#120A08" />
    </>
  ) },
}

export function DistrictScene({ id, className = '', align = 'xMidYMid' }) {
  const u = useUid()
  const sc = SCENES[id]
  if (!sc) return null
  return (
    <svg viewBox="0 0 400 150" preserveAspectRatio={`${align} slice`} className={`absolute inset-0 h-full w-full ${className}`}>
      <defs>
        <Materials id={u} />
        <linearGradient id={`${u}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={sc.sky[0]} /><stop offset="100%" stopColor={sc.sky[1]} /></linearGradient>
      </defs>
      <rect width="400" height="150" fill={`url(#${u}-sky)`} />
      {sc.draw(u)}
    </svg>
  )
}

// ---------- Properties (160x90) ----------
const PROPS = {
  newsstand: (u) => (
    <>
      <rect x="40" y="40" width="80" height="44" fill="#2B3A55" />
      <path d="M34 40 L48 26 H112 L126 40 Z" fill="#A4161A" />
      {[48, 60, 72, 84, 96, 108].map((x, i) => <path key={x} d={`M${x} 26 L${x - 3} 40`} stroke="#E9E6DF" strokeOpacity={i % 2 ? 0.6 : 0} strokeWidth="6" />)}
      {[46, 64, 82, 100].map((x, i) => <rect key={x} x={x} y="48" width="14" height="18" fill={['#E9E6DF', '#F2EBDD', '#E9D9A8', '#E9E6DF'][i]} transform={`rotate(${i - 1.5} ${x + 7} 57)`} />)}
      {[46, 64, 82, 100].map((x) => <rect key={x} x={x + 2} y="51" width="10" height="3" fill="#121417" />)}
      <rect x="40" y="70" width="80" height="14" fill="#1D2840" />
    </>
  ),
  laundromat: (u) => (
    <>
      <rect x="24" y="20" width="112" height="64" fill="#3A3D42" />
      <rect x="24" y="16" width="112" height="10" fill="#1F4E5F" />
      <rect x="30" y="32" width="100" height="36" fill={m(u, 'glass')} opacity=".7" />
      {[44, 68, 92, 116].map((x) => <g key={x}><rect x={x - 10} y="40" width="20" height="24" rx="2" fill="#E9E6DF" /><circle cx={x} cy="53" r="7" fill="#0E1A26" stroke="#9AA3AD" strokeWidth="1.4" /><circle cx={x} cy="53" r="3.5" fill="#4CC9F0" opacity=".5" /></g>)}
      <rect x="24" y="70" width="112" height="14" fill="#2A2D31" />
      <path d="M126 72 l6 -10 l2 2 l-6 10 Z" fill="#E0434F" opacity=".7" />
    </>
  ),
  speakeasy: () => (
    <>
      <rect x="20" y="10" width="120" height="80" fill="#2A1E1A" />
      {Array.from({ length: 6 }, (_, r) => Array.from({ length: 8 }, (_, c) => <rect key={`${r}${c}`} x={20 + c * 15 + (r % 2) * 7} y={10 + r * 10} width="14" height="9" fill="#3A2820" />))}
      <path d="M56 90 V40 Q80 26 104 40 V90 Z" fill="#1A1210" />
      <rect x="60" y="44" width="40" height="46" fill="#3E2210" />
      <rect x="74" y="52" width="12" height="5" fill="#0B0C0D" /><rect x="76" y="53" width="8" height="3" fill="#FFD27A" opacity=".8" />
      <circle cx="94" cy="70" r="2" fill="#C29A45" />
      <path d="M40 30 v10" stroke="#111" /><circle cx="40" cy="44" r="5" fill="#FFD27A" /><circle cx="40" cy="44" r="12" fill="#FFD27A" opacity=".15" />
      <path d="M44 86 h8 M108 86 h8" stroke="#111" strokeWidth="2" />
    </>
  ),
  nightclub: () => (
    <>
      <rect x="16" y="14" width="128" height="76" fill="#120A18" />
      <rect x="30" y="20" width="100" height="22" rx="4" fill="none" stroke="#F72585" strokeWidth="2.4" />
      <rect x="30" y="20" width="100" height="22" rx="4" fill="#F72585" opacity=".12" />
      <text x="80" y="36" textAnchor="middle" fontSize="13" fontWeight="800" fill="#FF8AD8" fontStyle="italic">PARADISE</text>
      <rect x="62" y="54" width="36" height="36" fill="#1E1028" /><rect x="64" y="56" width="32" height="34" fill="#7A6BFF" opacity=".35" />
      <path d="M40 88 h80" stroke="#A4161A" strokeWidth="3" />
      {[44, 54, 106, 116].map((x) => <rect key={x} x={x} y="76" width="2" height="12" fill="#C29A45" />)}
      {[[28, 50, '#4CC9F0'], [124, 52, '#FFD60A']].map(([x, y, c], i) => <circle key={i} cx={x} cy={y} r="4" fill={c} opacity=".8" />)}
    </>
  ),
  casino: () => (
    <>
      <rect x="54" y="4" width="52" height="86" fill="#1A1406" />
      {win(58, 8, 44, 60, 6, 9, '#FFD27A', 3)}
      <rect x="14" y="54" width="132" height="36" fill="#241A08" />
      <rect x="14" y="50" width="132" height="8" fill="#D4AF37" />
      {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={18 + i * 8.2} cy="54" r="1.6" fill="#FFF6D5" />)}
      <rect x="66" y="66" width="28" height="24" fill="#8A6D1F" opacity=".5" />
      <path d="M80 4 l4 -6 l4 6" fill="#1A1406" />
      {[24, 40, 112, 128].map((x) => <rect key={x} x={x} y="64" width="10" height="16" fill="#FFD27A" opacity=".5" />)}
    </>
  ),
  shipping: (u) => (
    <>
      <path d="M0 70 H160 V90 H0 Z" fill={m(u, 'water')} />
      <path d="M14 62 H140 L132 76 H22 Z" fill="#1C1E21" /><path d="M14 66 H140" stroke="#A4161A" strokeWidth="2" />
      {[[22, 46, '#A4161A'], [44, 46, '#1F4E5F'], [66, 46, '#D4AF37'], [88, 46, '#2F6B3A'], [33, 32, '#1F4E5F'], [55, 32, '#A4161A'], [77, 32, '#5C5346']].map(([x, y, c], i) => (
        <rect key={i} x={x} y={y} width="20" height="14" fill={c} stroke="#000" strokeOpacity=".4" />
      ))}
      <rect x="112" y="36" width="20" height="26" fill="#E9E6DF" /><rect x="114" y="40" width="16" height="4" fill="#0E1A26" />
      <path d="M150 70 V10 H154 V70 M118 14 H154 M126 14 V30" stroke="#2A2D31" strokeWidth="3" fill="none" />
    </>
  ),
}

export function PropertyArt({ id }) {
  const u = useUid()
  const draw = PROPS[id]
  if (!draw) return null
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMax meet" className="absolute inset-0 h-full w-full">
      <defs><Materials id={u} /></defs>
      <g filter={`url(#${u}-shadow)`}>{draw(u)}</g>
    </svg>
  )
}
