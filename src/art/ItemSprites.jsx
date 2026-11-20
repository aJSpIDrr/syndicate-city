import { Materials, m, useUid } from './defs'

// Hand-built 64x64 SVG art for every Black Market item.
const S = {
  // ---------- Weapons ----------
  bat: (u) => (
    <g transform="rotate(-40 32 32)">
      <path d="M8 30 L44 28.5 Q58 28 58 32 Q58 36 44 35.5 L8 34 Z" fill={m(u, 'wood')} />
      <rect x="6" y="29.5" width="12" height="5" rx="1" fill="#1C1C1C" />
      {[8, 11, 14].map((x) => <line key={x} x1={x} y1="29.5" x2={x + 1.5} y2="34.5" stroke="#3A3A3A" strokeWidth=".6" />)}
      <ellipse cx="5.5" cy="32" rx="1.6" ry="3.2" fill={m(u, 'darkwood')} />
      <path d="M20 30 L50 29.2" stroke="#fff" strokeOpacity=".25" strokeWidth=".8" />
    </g>
  ),
  switchblade: (u) => (
    <g transform="rotate(-30 32 32)">
      <path d="M6 30 h26 q3 0 3 2.5 q0 2.5 -3 2.5 h-26 q-2 0 -2 -2.5 q0 -2.5 2 -2.5 Z" fill={m(u, 'black')} />
      <circle cx="10" cy="32.5" r="1" fill={m(u, 'chrome')} /><circle cx="28" cy="32.5" r="1" fill={m(u, 'chrome')} />
      <path d="M35 31 L60 29 L56 33.5 L35 34 Z" fill={m(u, 'chrome')} />
      <path d="M36 32 L57 30.5" stroke="#fff" strokeOpacity=".6" strokeWidth=".5" />
      <rect x="32" y="29.5" width="3" height="6" rx=".8" fill={m(u, 'steel')} />
    </g>
  ),
  knuckles: (u) => (
    <g>
      <path d="M10 24 Q10 18 16 18 H48 Q54 18 54 24 V30 Q54 34 50 34 H14 Q10 34 10 30 Z" fill={m(u, 'brass')} />
      {[18, 27, 36, 45].map((x) => <circle key={x} cx={x} cy="25.5" r="4.2" fill="#121417" stroke="#7A5A1E" strokeWidth=".8" />)}
      <path d="M16 34 Q32 50 48 34 L44 34 Q32 44 20 34 Z" fill={m(u, 'brass')} />
      <path d="M14 19.5 H50" stroke="#FFF6D5" strokeOpacity=".7" strokeWidth=".8" />
    </g>
  ),
  revolver: (u) => (
    <g>
      <path d="M14 24 H44 V30 H14 Z" fill={m(u, 'steel')} />
      <rect x="44" y="25" width="8" height="4" fill={m(u, 'steel')} />
      <rect x="22" y="22" width="14" height="11" rx="3" fill={m(u, 'metal')} />
      {[25, 29, 33].map((x) => <line key={x} x1={x} y1="23" x2={x} y2="32" stroke="#000" strokeOpacity=".5" />)}
      <path d="M14 30 H26 L24 36 Q22 38 20 36 L18 33 Z" fill={m(u, 'metal')} />
      <path d="M12 28 Q8 30 9 40 L11 50 Q12 53 16 52 L20 50 Q22 49 21 46 L20 38 Q20 34 22 32 L18 28 Z" fill={m(u, 'wood')} />
      <path d="M22 34 q2 4 -1 6" fill="none" stroke={m(u, 'steel')} strokeWidth="1.4" />
      <path d="M15 24.6 H44" stroke="#fff" strokeOpacity=".5" strokeWidth=".6" />
    </g>
  ),
  shotgun: (u) => (
    <g transform="rotate(-12 32 32)">
      <rect x="22" y="24" width="38" height="3.4" rx="1" fill={m(u, 'metal')} />
      <rect x="22" y="27.6" width="38" height="3.4" rx="1" fill={m(u, 'metal')} />
      <circle cx="60" cy="25.7" r="1.3" fill="#000" /><circle cx="60" cy="29.3" r="1.3" fill="#000" />
      <path d="M16 23 H30 V33 H24 L22 36 H16 Z" fill={m(u, 'steel')} />
      <path d="M17 26 Q8 28 4 38 Q4 42 9 41 L18 33 Z" fill={m(u, 'wood')} />
      <path d="M24 31 h12 l-2 5 h-8 Z" fill={m(u, 'wood')} />
      <path d="M22 24.5 H60" stroke="#fff" strokeOpacity=".35" strokeWidth=".6" />
    </g>
  ),
  pistol45: (u) => (
    <g>
      <path d="M12 21 H54 Q56 21 56 23 V28 H12 Z" fill={m(u, 'metal')} />
      {[40, 43, 46, 49].map((x) => <line key={x} x1={x} y1="22" x2={x} y2="27" stroke="#000" strokeOpacity=".6" strokeWidth=".8" />)}
      <path d="M12 28 H46 V31 H30 L28 35 H22 Z" fill={m(u, 'black')} />
      <path d="M14 28 L22 28 L27 46 Q27 50 23 50 H17 Q13 50 13 46 Z" fill={m(u, 'darkwood')} />
      {[34, 38, 42].map((y) => <line key={y} x1="16" y1={y} x2="23" y2={y + 1} stroke="#000" strokeOpacity=".35" />)}
      <path d="M28 31 q4 1 3 6 h-4" fill="none" stroke={m(u, 'steel')} strokeWidth="1.4" />
      <path d="M13 22 H54" stroke="#fff" strokeOpacity=".4" strokeWidth=".6" />
    </g>
  ),
  molotov: (u) => (
    <g>
      <ellipse cx="32" cy="16" rx="9" ry="11" fill={m(u, 'flame')} />
      <path d="M29 22 Q31 12 34 18 Q35 13 37 20 L35 24 H29 Z" fill="#FFB703" opacity=".9" />
      <path d="M29 24 h6 l1 4 q-4 2 -8 0 Z" fill="#E9E3D2" />
      <path d="M28 28 h8 v6 q8 4 8 12 v8 q0 4 -4 4 h-16 q-4 0 -4 -4 v-8 q0 -8 8 -12 Z" fill="#2F6B3A" opacity=".9" />
      <path d="M22 46 h20 v8 q0 3 -3 3 h-14 q-3 0 -3 -3 Z" fill="#C97A1C" opacity=".7" />
      <path d="M26 38 q-2 6 0 14" stroke="#fff" strokeOpacity=".4" strokeWidth="1.4" fill="none" />
    </g>
  ),
  grenade: (u) => (
    <g>
      <ellipse cx="30" cy="40" rx="14" ry="16" fill={m(u, 'olive')} />
      {[30, 36, 42, 48].map((y) => <line key={y} x1="17" y1={y} x2="43" y2={y} stroke="#1E2216" strokeWidth="1.2" />)}
      {[24, 30, 36].map((x) => <line key={x} x1={x} y1="25" x2={x} y2="55" stroke="#1E2216" strokeWidth="1.2" />)}
      <rect x="25" y="18" width="10" height="8" rx="1.5" fill={m(u, 'steel')} />
      <path d="M35 20 L46 26 L46 44 Q46 46 44 45 L42 28 L35 24 Z" fill={m(u, 'steel')} />
      <circle cx="22" cy="18" r="5" fill="none" stroke={m(u, 'chrome')} strokeWidth="1.6" />
      <ellipse cx="24" cy="34" rx="4" ry="6" fill="#fff" opacity=".12" />
    </g>
  ),
  sniper: (u) => (
    <g transform="rotate(-10 32 32)">
      <rect x="28" y="30" width="34" height="2.4" fill={m(u, 'metal')} />
      <rect x="58" y="29.4" width="4" height="3.6" fill={m(u, 'black')} />
      <path d="M14 29 H40 V35 H14 Z" fill={m(u, 'black')} />
      <path d="M14 30 L2 31 L2 39 Q6 40 9 38 L16 35 Z" fill={m(u, 'olive')} />
      <rect x="20" y="22" width="18" height="4.6" rx="2.2" fill={m(u, 'black')} />
      <circle cx="38" cy="24.3" r="2.8" fill={m(u, 'glass')} />
      <rect x="25" y="26" width="2" height="3" fill="#111" /><rect x="32" y="26" width="2" height="3" fill="#111" />
      <path d="M30 35 l3 9 l2 0 l-1 -9 Z M44 32 l-2 10 l2 1 l3 -11 Z" fill="#222" />
      <path d="M22 35 h6 l-2 6 h-4 Z" fill={m(u, 'black')} />
    </g>
  ),
  // ---------- Armor ----------
  trench: (u) => (
    <g>
      <path d="M22 10 L32 16 L42 10 L52 16 L50 56 H40 L32 30 L24 56 H14 L12 16 Z" fill={m(u, 'khaki')} />
      <path d="M22 10 L28 26 L32 16 M42 10 L36 26 L32 16" fill="none" stroke="#3E3628" strokeWidth="1.2" />
      <rect x="13" y="32" width="38" height="4" fill="#4D4434" />
      <rect x="29" y="31.5" width="6" height="5" rx="1" fill="none" stroke={m(u, 'brass')} strokeWidth="1" />
      {[24, 40].map((x) => [20, 26].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1" fill="#2B251C" />))}
    </g>
  ),
  leather: (u) => (
    <g>
      <path d="M20 12 L32 18 L44 12 L54 18 L52 52 H12 L10 18 Z" fill={m(u, 'leather')} />
      <path d="M20 12 L26 24 L32 18 L38 24 L44 12" fill="#2A1A10" />
      <line x1="32" y1="20" x2="32" y2="52" stroke={m(u, 'chrome')} strokeWidth="1.2" />
      <rect x="12" y="48" width="40" height="4" fill="#2A1A10" />
      <path d="M16 34 h8 M40 34 h8" stroke="#1A100A" strokeWidth="1.2" />
      <path d="M14 20 Q16 34 14 46" stroke="#fff" strokeOpacity=".15" strokeWidth="2" fill="none" />
    </g>
  ),
  kevlar: (u) => (
    <g>
      <path d="M20 10 H26 Q28 16 32 16 Q36 16 38 10 H44 L50 18 V54 H14 V18 Z" fill={m(u, 'black')} />
      <rect x="18" y="26" width="28" height="10" rx="1.5" fill="#2A2D31" />
      <rect x="18" y="40" width="28" height="10" rx="1.5" fill="#2A2D31" />
      {[22, 28, 34, 40].map((x) => <rect key={x} x={x} y="42" width="4" height="6" rx=".5" fill="#3B3F45" />)}
      <rect x="24" y="28" width="16" height="6" rx="1" fill="#E9E6DF" opacity=".85" />
      <path d="M20 18 V54 M44 18 V54" stroke="#000" strokeOpacity=".4" />
    </g>
  ),
  gasmask: (u) => (
    <g>
      <path d="M14 22 Q14 8 32 8 Q50 8 50 22 V34 Q50 46 38 50 H26 Q14 46 14 34 Z" fill={m(u, 'black')} />
      <circle cx="24" cy="24" r="7" fill={m(u, 'glass')} stroke={m(u, 'steel')} strokeWidth="1.8" />
      <circle cx="40" cy="24" r="7" fill={m(u, 'glass')} stroke={m(u, 'steel')} strokeWidth="1.8" />
      <path d="M26 40 h12 v8 h-12 Z" fill="#2A2D31" />
      <rect x="25" y="46" width="14" height="12" rx="3" fill={m(u, 'olive')} />
      {[49, 52, 55].map((y) => <line key={y} x1="26" y1={y} x2="38" y2={y} stroke="#1E2216" />)}
      <path d="M8 22 L14 22 M50 22 L56 22" stroke="#1C1E21" strokeWidth="3" />
    </g>
  ),
  riotshield: (u) => (
    <g>
      <path d="M16 6 H48 Q52 6 52 10 V48 Q52 56 32 60 Q12 56 12 48 V10 Q12 6 16 6 Z" fill={m(u, 'glass')} opacity=".9" />
      <path d="M16 6 H48 Q52 6 52 10 V48 Q52 56 32 60 Q12 56 12 48 V10 Q12 6 16 6 Z" fill="none" stroke={m(u, 'black')} strokeWidth="2.4" />
      <rect x="18" y="14" width="28" height="12" rx="2" fill="#0E1A26" opacity=".6" />
      <rect x="16" y="34" width="32" height="6" fill="#E9E6DF" opacity=".75" />
      <path d="M18 10 Q20 30 16 46" stroke="#fff" strokeOpacity=".35" strokeWidth="2" fill="none" />
    </g>
  ),
  limodoor: (u) => (
    <g>
      <path d="M6 30 L14 14 H50 Q56 14 58 22 V30 Z" fill={m(u, 'glass')} />
      <path d="M6 30 L14 14 H50 Q56 14 58 22 V30 Z" fill="none" stroke={m(u, 'chrome')} strokeWidth="1.6" />
      <path d="M6 30 H58 V50 Q58 54 54 54 H10 Q6 54 6 50 Z" fill={m(u, 'black')} />
      <rect x="40" y="35" width="10" height="2.6" rx="1.3" fill={m(u, 'chrome')} />
      <path d="M6 31 H58" stroke={m(u, 'chrome')} strokeWidth="1" />
      {[[22, 22], [32, 19], [26, 42]].map(([x, y], i) => (
        <g key={i}><circle cx={x} cy={y} r="2" fill="#0B0C0D" /><path d={`M${x - 4} ${y} h8 M${x} ${y - 4} v8`} stroke="#fff" strokeOpacity=".4" strokeWidth=".5" /></g>
      ))}
    </g>
  ),
  nvg: (u) => (
    <g>
      <path d="M10 30 Q10 22 18 22 H46 Q54 22 54 30 V36 Q54 40 50 40 H14 Q10 40 10 36 Z" fill={m(u, 'olive')} />
      <rect x="14" y="30" width="14" height="14" rx="3" fill={m(u, 'black')} />
      <rect x="36" y="30" width="14" height="14" rx="3" fill={m(u, 'black')} />
      <circle cx="21" cy="44" r="6.5" fill="#0B1A0E" stroke={m(u, 'black')} strokeWidth="2" />
      <circle cx="43" cy="44" r="6.5" fill="#0B1A0E" stroke={m(u, 'black')} strokeWidth="2" />
      <circle cx="21" cy="44" r="3.5" fill="#39FF6A" opacity=".75" /><circle cx="43" cy="44" r="3.5" fill="#39FF6A" opacity=".75" />
      <path d="M18 22 Q32 6 46 22" fill="none" stroke="#1C1E21" strokeWidth="3" />
      <rect x="28" y="16" width="8" height="8" rx="1" fill={m(u, 'black')} />
    </g>
  ),
  tacsuit: (u) => (
    <g>
      <circle cx="32" cy="12" r="7" fill={m(u, 'black')} />
      <rect x="27" y="10" width="10" height="3" rx="1.5" fill={m(u, 'glass')} />
      <path d="M18 20 H46 L52 28 V50 H12 V28 Z" fill={m(u, 'black')} />
      <path d="M8 24 L18 20 L16 40 L8 38 Z M56 24 L46 20 L48 40 L56 38 Z" fill="#2A2D31" />
      {[[20, 26], [34, 26], [20, 37], [34, 37]].map(([x, y], i) => <rect key={i} x={x} y={y} width="10" height="9" rx="1.5" fill="#3B3F45" stroke="#14161A" />)}
      <rect x="12" y="48" width="40" height="5" fill="#14161A" />
      <path d="M20 54 V62 M44 54 V62" stroke="#1C1E21" strokeWidth="6" />
    </g>
  ),
  // ---------- Vehicles ----------
  modelt: (u) => (
    <g>
      <path d="M8 40 V30 H22 V16 H44 V30 H56 V40 Z" fill={m(u, 'metal')} />
      <path d="M22 16 H44" stroke="#9AA3AD" strokeWidth="1.2" />
      <rect x="25" y="19" width="16" height="10" fill={m(u, 'glass')} />
      <rect x="48" y="30" width="8" height="6" fill="#2A2D31" />
      <rect x="54" y="31" width="3" height="4" rx="1" fill="#FFE29A" />
      <Wheel u={u} x={18} y={44} r={7} spokes /><Wheel u={u} x={48} y={44} r={7} spokes />
      <path d="M6 40 H58" stroke={m(u, 'chrome')} strokeWidth="1.2" />
    </g>
  ),
  pickup: (u) => (
    <g>
      <path d="M4 42 V32 H30 V22 Q30 20 32 20 H44 Q48 20 50 26 L52 32 H60 V42 Z" fill={m(u, 'red')} />
      <path d="M34 23 H44 Q46 23 47 26 L48 31 H34 Z" fill={m(u, 'glass')} />
      <rect x="4" y="30" width="26" height="3" fill="#5C0B0E" />
      <rect x="57" y="34" width="3" height="3" fill="#FFE29A" />
      <Wheel u={u} x={16} y={44} r={7} /><Wheel u={u} x={48} y={44} r={7} />
    </g>
  ),
  motorcycle: (u) => (
    <g>
      <Wheel u={u} x={14} y={44} r={9} spokes /><Wheel u={u} x={50} y={44} r={9} spokes />
      <path d="M14 44 L26 32 H40 L50 44" fill="none" stroke={m(u, 'chrome')} strokeWidth="2.4" />
      <path d="M24 30 Q30 24 40 26 L42 32 H26 Z" fill={m(u, 'red')} />
      <rect x="28" y="32" width="10" height="8" rx="2" fill={m(u, 'steel')} />
      <path d="M42 26 L48 20 H52" fill="none" stroke={m(u, 'chrome')} strokeWidth="2" />
      <path d="M18 30 h8 v3 h-8 Z" fill="#111" />
      <path d="M30 40 L10 42" stroke={m(u, 'chrome')} strokeWidth="1.6" />
    </g>
  ),
  musclecar: (u) => (
    <g>
      <path d="M2 42 V36 Q2 32 8 31 L20 30 L28 22 H42 L50 30 L58 31 Q62 32 62 36 V42 Z" fill={m(u, 'black')} />
      <path d="M30 24 H41 L47 30 H24 Z" fill={m(u, 'glass')} />
      <path d="M4 34 H60" stroke="#D4AF37" strokeWidth="2" /><path d="M4 37 H60" stroke="#D4AF37" strokeWidth="1" />
      <rect x="59" y="33" width="3" height="3" fill="#FFE29A" /><rect x="2" y="33" width="2" height="3" fill="#E0434F" />
      <Wheel u={u} x={15} y={43} r={7} /><Wheel u={u} x={49} y={43} r={7} />
    </g>
  ),
  armoredsedan: (u) => (
    <g>
      <path d="M4 44 V32 Q4 30 6 30 H16 L22 20 H42 L48 30 H58 Q60 30 60 32 V44 Z" fill={m(u, 'metal')} />
      <path d="M24 23 H40 L44 30 H20 Z" fill="#0E1A26" />
      <path d="M24 26 h20" stroke="#3A5A78" strokeWidth=".6" />
      {[10, 22, 34, 46].map((x) => <rect key={x} x={x} y="33" width="10" height="7" fill="#3D434A" stroke="#16181B" />)}
      <rect x="2" y="38" width="6" height="5" fill="#16181B" /><rect x="56" y="38" width="6" height="5" fill="#16181B" />
      <Wheel u={u} x={16} y={45} r={7} /><Wheel u={u} x={48} y={45} r={7} />
    </g>
  ),
  hearse: (u) => (
    <g>
      <path d="M2 42 V26 Q2 22 6 22 H40 L48 30 H58 Q62 31 62 35 V42 Z" fill={m(u, 'black')} />
      <path d="M38 24 L45 30 H34 V24 Z" fill={m(u, 'glass')} />
      <rect x="8" y="25" width="22" height="9" rx="1" fill="#2A2D31" />
      <path d="M12 26 q4 4 0 7 M26 26 q-4 4 0 7" stroke={m(u, 'chrome')} strokeWidth="1" fill="none" />
      <path d="M2 36 H62" stroke={m(u, 'chrome')} strokeWidth="1" />
      <Wheel u={u} x={14} y={43} r={6.5} /><Wheel u={u} x={50} y={43} r={6.5} />
    </g>
  ),
  speedboat: (u) => (
    <g>
      <path d="M0 48 Q16 44 32 48 T64 48 V64 H0 Z" fill={m(u, 'water')} />
      <path d="M4 40 H56 L62 34 L60 44 Q50 48 10 48 Z" fill={m(u, 'cream')} />
      <path d="M4 42 H58" stroke="#A4161A" strokeWidth="2" />
      <path d="M22 40 L28 30 H40 L44 40 Z" fill={m(u, 'glass')} />
      <path d="M2 50 q8 -3 14 0 M40 52 q8 -3 16 0" stroke="#fff" strokeOpacity=".5" fill="none" />
    </g>
  ),
  helicopter: (u) => (
    <g>
      <path d="M2 16 H62" stroke="#1C1E21" strokeWidth="2" />
      <rect x="30" y="16" width="4" height="6" fill="#1C1E21" />
      <path d="M14 30 Q14 22 24 22 H40 Q50 22 52 32 L54 40 H18 Q14 40 14 34 Z" fill={m(u, 'olive')} />
      <path d="M40 24 Q48 24 50 32 H40 Z" fill={m(u, 'glass')} />
      <path d="M14 28 L-2 26 V30 L14 34 Z" fill={m(u, 'olive')} />
      <rect x="-2" y="20" width="3" height="12" fill="#1C1E21" />
      <path d="M22 44 H52 M26 40 V44 M46 40 V44" stroke="#1C1E21" strokeWidth="2" />
      <rect x="20" y="36" width="14" height="3" fill="#2C3022" /><circle cx="34" cy="37.5" r="1.5" fill="#111" />
    </g>
  ),
}

function Wheel({ u, x, y, r, spokes }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#0B0C0D" />
      <circle cx={x} cy={y} r={r * 0.55} fill={m(u, 'chrome')} />
      {spokes && [0, 45, 90, 135].map((a) => (
        <line key={a} x1={x} y1={y - r * 0.85} x2={x} y2={y + r * 0.85} stroke="#9AA3AD" strokeWidth=".6" transform={`rotate(${a} ${x} ${y})`} />
      ))}
      <circle cx={x} cy={y} r={r * 0.18} fill="#16181B" />
    </g>
  )
}

export const hasItemSprite = (id) => !!S[id]

export default function ItemSprite({ id, size = 64, glow }) {
  const u = useUid()
  const draw = S[id]
  if (!draw) return null
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="block overflow-visible">
      <defs>
        <Materials id={u} />
        {glow && (
          <radialGradient id={`${u}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={glow} stopOpacity=".35" /><stop offset="100%" stopColor={glow} stopOpacity="0" />
          </radialGradient>
        )}
      </defs>
      {glow && <circle cx="32" cy="34" r="30" fill={`url(#${u}-halo)`} />}
      <g filter={`url(#${u}-shadow)`}>{draw(u)}</g>
    </svg>
  )
}
