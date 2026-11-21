import { Crown, Skull, Swords, Gem, Flame, Star, Spade, Flower2 } from 'lucide-react'

const ICONS = { crown: Crown, skull: Skull, swords: Swords, gem: Gem, flame: Flame, star: Star, spade: Spade, rose: Flower2 }
const PATHS = {
  shield: 'M50 4 L92 18 V48 C92 74 72 90 50 98 C28 90 8 74 8 48 V18 Z',
  circle: 'M50 4 A46 46 0 1 1 49.9 4 Z',
  diamond: 'M50 2 L96 50 L50 98 L4 50 Z',
  hex: 'M50 3 L92 27 V73 L50 97 L8 73 V27 Z',
}

/** Family crest drawn from the designer's choices (no images needed). */
export default function Crest({ crest, size = 64, tag }) {
  const c = crest || { shape: 'shield', c1: '#D4AF37', c2: '#111827', symbol: 'crown' }
  const Icon = ICONS[c.symbol] || Crown
  const id = `cr${c.shape}${c.c1}${c.c2}`.replace(/#/g, '')
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="block drop-shadow">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c.c2} />
            <stop offset="100%" stopColor="#000" stopOpacity=".85" />
          </linearGradient>
        </defs>
        <path d={PATHS[c.shape] || PATHS.shield} fill={`url(#${id})`} stroke={c.c1} strokeWidth="5" />
        <path d={PATHS[c.shape] || PATHS.shield} fill="none" stroke="#000" strokeOpacity=".35" strokeWidth="1.5" transform="translate(50 50) scale(.84) translate(-50 -50)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Icon size={size * 0.4} color={c.c1} strokeWidth={2} />
        {tag && size >= 56 && <span className="mt-0.5 text-[10px] font-extrabold tracking-widest" style={{ color: c.c1 }}>{tag}</span>}
      </div>
    </div>
  )
}
