// Talking to the online server. VITE_API_URL is set at build time (empty = offline game).
// Fallback for the hosted copies (GitHub Pages / Render) if the build didn't get an address.
const HOSTED = typeof location !== 'undefined' && /(\.github\.io|\.onrender\.com)$/.test(location.hostname)
const DEFAULT_API = 'https://syndicate-city-eu.onrender.com' // Frankfurt, next to the database
export const API_URL = (import.meta.env.VITE_API_URL || (HOSTED ? DEFAULT_API : '')).trim().replace(/\/$/, '')
export const ONLINE = !!API_URL
const TOKEN_KEY = 'syndicate-city-token'
const USER_KEY = 'syndicate-city-user'

export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } }
export const getUser = () => { try { return localStorage.getItem(USER_KEY) } catch { return null } }
export function setSession(token, user) {
  try {
    if (token) { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, user) }
    else { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY) }
  } catch { /* ignore */ }
}

export async function api(method, path, body) {
  const token = getToken()
  let r
  try {
    r = await fetch(API_URL + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    return { status: 0, error: 'Can\'t reach the server. Check your connection; it may also be waking up (up to a minute).' }
  }
  let data = {}
  try { data = await r.json() } catch { /* empty */ }
  return { status: r.status, ...data }
}

// Lets screens call multiplayer endpoints; useGame registers how to apply the returned save / show errors.
let applier = { state: () => {}, error: () => {} }
export const setApplier = (a) => { applier = a }
export async function serverAct(path, body) {
  const r = await api('POST', path, body)
  if (r.status === 200 && r.state) applier.state(r.state)
  else applier.error(r.error || 'Something went wrong.')
  return r
}
