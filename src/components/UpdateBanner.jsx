import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

/* global __BUILD__ */
export const BUILD = typeof __BUILD__ !== 'undefined' ? __BUILD__ : 'dev'

// Checks version.json every few minutes (and when the tab regains focus). If the site has a newer
// build than the one running, shows a banner to reload.
export default function UpdateBanner() {
  const [newer, setNewer] = useState(false)
  useEffect(() => {
    if (!import.meta.env.PROD) return
    const check = async () => {
      try {
        const r = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' })
        const { build } = await r.json()
        if (build && build !== BUILD) setNewer(true)
      } catch { /* offline */ }
    }
    check()
    const id = setInterval(check, 3 * 60 * 1000)
    const onVis = () => document.visibilityState === 'visible' && check()
    document.addEventListener('visibilitychange', onVis)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis) }
  }, [])
  if (!newer) return null
  return (
    <div className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-3 bg-gold px-3 py-2 text-[13px] font-bold text-ink shadow-lg">
      A new version of Syndicate City is out.
      <button className="flex items-center gap-1 rounded bg-ink px-3 py-1 text-gold" onClick={() => window.location.reload()}><RefreshCw size={13} /> Update now</button>
    </div>
  )
}
