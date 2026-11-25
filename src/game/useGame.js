import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import * as E from './engine'
import { actionName } from './actions'
import { ONLINE, api, getToken, getUser, setSession } from './online'

// Single reducer: actions are engine functions. `INIT` replaces state (new game / reset).
function reducer(state, action) {
  switch (action.type) {
    case 'INIT': return action.state
    case 'TICK': return state ? E.tick(state) : state
    case 'RUN': return state ? action.fn(state, ...action.args) : state
    case 'INIT_DISPLAY': return state ? displayTick(state) : state
    case 'TOAST': return state ? { ...state, toast: { id: Date.now(), text: action.text, kind: 'error' } } : state
    default: return state
  }
}

/** Online: advance meters/timers on screen between server replies without inventing random events. */
function displayTick(s) {
  const rnd = Math.random
  Math.random = () => 0.9999
  try { return E.tick(s) } finally { Math.random = rnd }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, null, () => {
    if (ONLINE) return null
    const s = E.loadGame()
    return s ? E.tick(s) : null // apply offline progress on load
  })
  // Online session: 'login' | 'loading' | 'newboss' | 'ready'
  const [phase, setPhase] = useState(ONLINE ? (getToken() ? 'loading' : 'login') : 'ready')
  const [user, setUser] = useState(getUser())
  const busy = useRef(false)

  const load = useCallback(async () => {
    const r = await api('GET', '/api/state')
    if (r.status === 200) { dispatch({ type: 'INIT', state: r.state }); setPhase('ready') }
    else if (r.status === 404) setPhase('newboss')
    else if (r.status === 401) { setSession(null); setPhase('login') }
    else setPhase('error:' + (r.error || 'Server error.'))
  }, [])

  useEffect(() => { if (ONLINE && phase === 'loading') load() }, [phase, load])

  // 1-second loop (offline: the real game clock; online: on-screen meters only) + online sync every 20s
  useEffect(() => {
    const id = setInterval(() => (ONLINE ? dispatch({ type: 'INIT_DISPLAY' }) : dispatch({ type: 'TICK' })), 1000)
    const sync = ONLINE ? setInterval(() => { if (!busy.current && getToken()) api('GET', '/api/state').then((r) => r.status === 200 && dispatch({ type: 'INIT', state: r.state })) }, 20000) : null
    return () => { clearInterval(id); if (sync) clearInterval(sync) }
  }, [])

  // Offline: persist (throttled to once per 2s, plus on page hide)
  const latest = useRef(state)
  latest.current = state
  useEffect(() => {
    if (ONLINE) return undefined
    const id = setInterval(() => latest.current && E.saveGame(latest.current), 2000)
    const onHide = () => latest.current && E.saveGame(latest.current)
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onHide)
    return () => { clearInterval(id); window.removeEventListener('pagehide', onHide); document.removeEventListener('visibilitychange', onHide) }
  }, [])

  const run = useCallback(async (fn, ...args) => {
    if (!ONLINE) return dispatch({ type: 'RUN', fn, args })
    const action = actionName(fn)
    busy.current = true
    const r = await api('POST', '/api/act', { action, args })
    busy.current = false
    if (r.status === 200) dispatch({ type: 'INIT', state: r.state })
    else if (r.status === 401) { setSession(null); setPhase('login') }
    else dispatch({ type: 'TOAST', text: r.error || 'Something went wrong.' })
  }, [])

  const start = useCallback(async (name, factionId) => {
    if (!ONLINE) {
      const s = E.newGame(name, factionId)
      E.saveGame(s)
      return dispatch({ type: 'INIT', state: s })
    }
    const r = await api('POST', '/api/new', { name, factionId })
    if (r.status === 200) { dispatch({ type: 'INIT', state: r.state }); setPhase('ready') }
    else alert(r.error || 'Could not create your boss.')
  }, [])

  const signedIn = (r) => {
    setSession(r.token, r.username)
    setUser(r.username)
    setPhase(r.needsEmail ? 'addEmail' : 'loading')
  }
  /** mode: 'login' | 'signup' | 'forgot' | 'reset' | 'email'. Returns { error } or { info }. */
  const auth = useCallback(async (mode, f) => {
    if (mode === 'forgot') {
      const r = await api('POST', '/api/forgot', { email: f.email, site: location.origin + location.pathname })
      return r.status === 200 ? { info: 'If that email has an account, a reset link is on its way. Check your inbox (and spam) and open it within 1 hour.' } : { error: r.error || 'Something went wrong.' }
    }
    if (mode === 'email') {
      const r = await api('POST', '/api/email', { email: f.email })
      if (r.status !== 200) return { error: r.error || 'Something went wrong.' }
      setPhase('loading'); return {}
    }
    const path = { login: '/api/login', signup: '/api/signup', reset: '/api/reset' }[mode]
    const r = await api('POST', path, f)
    if (r.status !== 200) return { error: r.error || 'Something went wrong.' }
    if (mode === 'reset') history.replaceState(null, '', location.pathname)
    signedIn(r)
    return {}
  }, [])

  const logout = useCallback(async () => {
    await api('POST', '/api/logout')
    setSession(null)
    dispatch({ type: 'INIT', state: null })
    setPhase('login')
  }, [])

  const reset = useCallback(() => { E.clearSave(); dispatch({ type: 'INIT', state: null }) }, [])
  const restore = useCallback((code) => {
    const s = E.importSave(code) // throws with a readable message on bad input
    E.saveGame(s)
    dispatch({ type: 'INIT', state: s })
  }, [])

  const derived = useMemo(() => (state ? E.derive(state) : null), [state])
  const setServerState = useCallback((st) => dispatch({ type: 'INIT', state: st }), [])
  return { state, derived, run, start, reset, restore, setServerState, online: ONLINE, phase, user, auth, logout, retry: () => setPhase('loading') }
}
