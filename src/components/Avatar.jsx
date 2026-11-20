import { getFaction } from '../data/factions'
import { avatarUrl } from '../assetMap'

// Frame tiers (GDD §7.2): Iron → Brushed Steel → Enamel → Ornate Gold & Diamond.
export function frameTier(rank) {
  if (rank >= 8) return { name: 'Ornate Gold & Diamond Crest', key: 'gold' }
  if (rank >= 5) return { name: 'Enamel', key: 'enamel' }
  if (rank >= 2) return { name: 'Brushed Steel', key: 'steel' }
  return { name: 'Worn Iron', key: 'iron' }
}

const SKIN = { families: '#D9A77F', firm: '#E6BC98', yakuza: '#E2B68C', triad: '#D8AA7E', syndicate: '#8A5838', sinaloa: '#C48A5C' }
const JACKETS = ['#4B3F33', '#3E3A36', '#4A4D52', '#2E3136', '#24272C', '#17191C', '#1B2333', '#3B1D2A', '#111317', '#0A0A0B']

/**
 * Evolving boss portrait. Uses the ASSET_MAP image when provided, otherwise a stylised SVG
 * whose clothing, accessories, backdrop and frame change with each of the 10 ranks.
 */
export default function Avatar({ factionId, rank = 0, size = 72, locked = false, className = '' }) {
  const f = getFaction(factionId)
  const st = f.style
  const tier = frameTier(rank)
  const url = avatarUrl(factionId, rank)
  const uid = `${factionId}-${rank}-${size}`
  const skin = SKIN[factionId]
  const has = (k) => st[k] !== undefined && rank >= st[k]
  const hat = st.hats[rank]
  const suited = has('suit')
  let jacket = suited ? JACKETS[Math.min(9, Math.max(4, rank))] : JACKETS[Math.min(rank, 3)]
  if (has('whiteSuit')) jacket = '#E9E6DF'
  if (factionId === 'triad' && rank >= 9) jacket = '#0E2E24'
  if (factionId === 'sinaloa' && rank === 5) jacket = '#ECE8DC'
  const hair = has('grey') ? '#B9B9B9' : '#1B1612'
  const frame = {
    iron: { a: '#3B3E43', b: '#6B6F75', w: 4 },
    steel: { a: '#7C858E', b: '#D3D9DE', w: 4 },
    enamel: { a: f.enamel, b: '#E4C77A', w: 5 },
    gold: { a: '#8A6D1F', b: '#F5D77A', w: 6 },
  }[tier.key]

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="block" role="img" aria-label={`${f.ranks[rank].title} portrait`}>
        <defs>
          <radialGradient id={`bg-${uid}`} cx="50%" cy="35%" r="75%">
            <stop offset="0%" stopColor={rank >= 6 ? f.accent : f.deep} stopOpacity={rank >= 6 ? 0.55 : 0.9} />
            <stop offset="100%" stopColor="#07080A" />
          </radialGradient>
          <linearGradient id={`fr-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={frame.b} />
            <stop offset="50%" stopColor={frame.a} />
            <stop offset="100%" stopColor={frame.b} />
          </linearGradient>
          <pattern id={`pin-${uid}`} width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill={jacket} />
            <line x1="1" y1="0" x2="1" y2="4" stroke="#8090A8" strokeOpacity=".35" strokeWidth=".4" />
          </pattern>
          <clipPath id={`clip-${uid}`}><rect x="5" y="5" width="90" height="90" rx="6" /></clipPath>
        </defs>

        <g clipPath={`url(#clip-${uid})`} opacity={locked ? 0.35 : 1} style={locked ? { filter: 'grayscale(1)' } : undefined}>
          <rect x="0" y="0" width="100" height="100" fill={`url(#bg-${uid})`} />
          {/* Backdrop: rain for rookies, skyline for the top ranks */}
          {rank <= 1 && Array.from({ length: 14 }, (_, i) => (
            <line key={i} x1={8 + i * 7} y1={(i * 13) % 40} x2={4 + i * 7} y2={(i * 13) % 40 + 10} stroke="#9FB3C8" strokeOpacity=".25" strokeWidth=".6" />
          ))}
          {rank >= 7 && (
            <path d="M5 62 L5 48 L12 48 L12 40 L18 40 L18 52 L24 52 L24 34 L30 34 L30 50 L70 50 L70 38 L76 38 L76 28 L80 28 L80 44 L88 44 L88 36 L95 36 L95 62 Z" fill="#000" opacity=".45" />
          )}
          {rank >= 7 && [14, 27, 73, 78, 90].map((x, i) => <rect key={i} x={x} y={44 + (i % 2) * 4} width="1.6" height="1.6" fill={f.accent} opacity=".7" />)}
          {rank === 9 && <circle cx="50" cy="42" r="30" fill={f.accent} opacity=".18" />}

          {/* Shoulders / clothing */}
          <path d="M12 100 C12 80 28 71 50 71 C72 71 88 80 88 100 Z" fill={has('pinstripe') ? `url(#pin-${uid})` : jacket} />
          {has('kimono') && !has('whiteSuit') && <path d="M12 100 C12 80 28 71 50 71 C72 71 88 80 88 100 Z" fill="#101012" />}
          {(has('robe') || (has('kimono') && !has('whiteSuit'))) && (
            <>
              <path d="M38 73 L50 100 L62 73" fill="none" stroke={f.accent} strokeWidth="2.2" />
              {has('robe') && <path d="M20 88 q8 -6 14 0 q6 6 12 0" fill="none" stroke={f.accent} strokeWidth="1.2" opacity=".8" />}
            </>
          )}
          {/* Shirt & tie */}
          {suited && !has('robe') && !(has('kimono') && !has('whiteSuit')) && (
            <>
              <path d="M41 72 L50 92 L59 72 Z" fill={rank >= 9 && factionId === 'families' ? '#F4F1EA' : '#D8D4C8'} />
              <path d="M41 72 L36 84 L46 82 Z M59 72 L64 84 L54 82 Z" fill="#000" opacity=".35" />
            </>
          )}
          {has('tie') && suited && !has('robe') && !(has('kimono') && !has('whiteSuit')) && (
            <path d="M48.5 74 L51.5 74 L53 86 L50 90 L47 86 Z" fill={rank >= 6 ? f.accent : '#5A2A2A'} />
          )}
          {!suited && !has('robe') && <path d="M43 72 Q50 80 57 72" fill="none" stroke="#000" strokeOpacity=".4" strokeWidth="2" />}
          {has('mandarin') && !suited && <rect x="43" y="70" width="14" height="4" rx="1" fill="#0B0B0B" />}
          {has('rose') && <circle cx="34" cy="80" r="2.6" fill="#C1121F" />}
          {has('diamond') && <path d="M66 79 l2.5 -3 l2.5 3 l-2.5 3 Z" fill="#E8F6FF" />}
          {has('ring') && <circle cx="66" cy="80" r="2.3" fill="none" stroke="#D4AF37" strokeWidth="1.2" />}

          {/* Neck & tattoos */}
          <rect x="44" y="58" width="12" height="15" rx="3" fill={skin} />
          {has('tattoo') && <path d="M45 62 q3 3 0 6 M55 61 q-3 4 0 8" stroke="#1E3A5F" strokeWidth="1.2" fill="none" />}
          {has('chain') && <path d="M41 72 Q50 82 59 72" fill="none" stroke="#E2B93B" strokeWidth="1.6" />}
          {has('pendant') && <><path d="M44 71 Q50 78 56 71" fill="none" stroke="#3B3B3B" strokeWidth=".7" /><circle cx="50" cy="77" r="2" fill="#2E8B57" /></>}
          {hat === 'bandana' && <path d="M40 70 L60 70 L50 80 Z" fill="#8B1E2D" />}

          {/* Head */}
          <ellipse cx="50" cy="45" rx="14" ry="17" fill={skin} />
          <ellipse cx="36.5" cy="47" rx="2" ry="3.5" fill={skin} />
          <ellipse cx="63.5" cy="47" rx="2" ry="3.5" fill={skin} />
          {/* Hair */}
          {hat === 'none' && (factionId === 'yakuza' && rank === 0
            ? <path d="M37 40 Q38 27 50 27 Q62 27 63 40 L60 34 Q50 30 40 34 Z" fill={hair} />
            : <path d="M36 42 Q35 26 50 26 Q66 26 64 42 Q62 32 50 32 Q40 32 36 42 Z" fill={hair} />)}
          {/* Eyes, brows, mouth */}
          <path d="M41 41 L47 42 M53 42 L59 41" stroke="#1B1612" strokeWidth="1.4" strokeLinecap="round" />
          <ellipse cx="44.5" cy="45.5" rx="1.4" ry="1.1" fill="#16120F" />
          <ellipse cx="55.5" cy="45.5" rx="1.4" ry="1.1" fill="#16120F" />
          <path d="M49 47 L48 52 L51 52" fill="none" stroke="#000" strokeOpacity=".25" strokeWidth=".9" />
          <path d={rank >= 5 ? 'M45 56 Q50 57.5 55 56' : 'M45.5 56.5 Q50 55.5 54.5 56.5'} stroke="#5B3226" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          {rank <= 3 && <path d="M38 50 q8 7 24 0 q-2 10 -12 11 q-10 -1 -12 -11 Z" fill="#000" opacity=".08" />}
          {has('scar') && <path d="M57 38 L61 50" stroke="#9E3B3B" strokeWidth="1" />}
          {rank === 0 && <circle cx="58" cy="52" r="2.2" fill="#6E3B5C" opacity=".35" />}
          {has('glasses') && (rank >= 4 && factionId !== 'families'
            ? <path d="M40 43 h8 v4 q-4 2 -8 0 Z M52 43 h8 v4 q-4 2 -8 0 Z M48 44 h4" fill="#0B0D10" stroke="#0B0D10" strokeWidth=".8" />
            : <path d="M40.5 43.5 h7 v4 h-7 Z M52.5 43.5 h7 v4 h-7 Z M47.5 45 h5" fill="none" stroke="#C9C9C9" strokeWidth=".8" />)}
          {has('cigar') && <><rect x="54" y="55" width="11" height="2.4" rx="1" fill="#6B4226" /><circle cx="65.5" cy="56.2" r="1.3" fill="#FF6A2B" /></>}

          {/* Hats */}
          {hat === 'fedora' && (
            <>
              <ellipse cx="50" cy="31" rx="23" ry="4.5" fill="#15171A" />
              <path d="M36 31 Q36 16 50 16 Q64 16 64 31 Z" fill="#1E2126" />
              <rect x="36" y="27" width="28" height="3" fill={rank >= 5 ? f.accent : '#3A2A1F'} opacity=".85" />
            </>
          )}
          {hat === 'newsboy' && (
            <>
              <path d="M34 34 Q34 20 50 20 Q68 20 66 34 Z" fill="#5A4A3A" />
              <path d="M34 33 Q50 38 58 33 L50 37 Z" fill="#3E3328" />
              <circle cx="50" cy="21" r="1.4" fill="#3E3328" />
            </>
          )}
          {hat === 'flatcap' && (
            <>
              <path d="M35 34 Q36 22 52 22 Q66 23 65 33 Z" fill="#4E4B44" />
              <path d="M34 34 Q46 30 58 33 L52 37 Q42 37 34 34 Z" fill="#3A3833" />
            </>
          )}
          {hat === 'cap' && (
            <>
              <path d="M36 34 Q36 21 50 21 Q64 21 64 34 Z" fill="#2E3B2E" />
              <path d="M36 33 Q22 34 24 37 Q36 37 44 34 Z" fill="#253025" />
            </>
          )}
          {hat === 'cowboy' && (
            <>
              <path d="M22 33 Q50 41 78 33 Q74 37 50 38 Q26 37 22 33 Z" fill="#6E5236" />
              <path d="M36 33 Q36 17 44 19 Q50 22 56 19 Q64 17 64 33 Z" fill="#8A6A47" />
              <rect x="36" y="29" width="28" height="2.5" fill="#3B2A1A" />
            </>
          )}
        </g>

        {/* Frame */}
        <rect x={frame.w / 2 + 1} y={frame.w / 2 + 1} width={100 - frame.w - 2} height={100 - frame.w - 2} rx="8" fill="none" stroke={`url(#fr-${uid})`} strokeWidth={frame.w} />
        {tier.key === 'enamel' && <rect x="8" y="8" width="84" height="84" rx="5" fill="none" stroke="#E4C77A" strokeWidth=".8" />}
        {tier.key === 'gold' && [[6, 6], [94, 6], [6, 94], [94, 94]].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y - 4} l4 4 l-4 4 l-4 -4 Z`} fill="#E8F6FF" stroke="#8A6D1F" strokeWidth=".6" />
        ))}
        {tier.key === 'gold' && <path d="M42 4 l4 -3 l4 3 l4 -3 l4 3 v3 h-16 Z" fill="#F5D77A" stroke="#8A6D1F" strokeWidth=".5" />}
        {tier.key === 'iron' && [[9, 9], [91, 9], [9, 91], [91, 91]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.3" fill="#8E9297" />)}
      </svg>
      {url && (
        <img src={url} alt="" loading="lazy" className="absolute inset-[8%] h-[84%] w-[84%] rounded-md object-cover"
          style={locked ? { filter: 'grayscale(1) brightness(.45)' } : undefined} />
      )}
    </div>
  )
}
