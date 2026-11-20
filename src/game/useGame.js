import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import * as E from './engine'

// Single reducer: actions are engine functions. `INIT` replaces state (new game / reset).
function reducer(state, action) {
  switch (action.type) {
    case 'INIT': return action.state
    case 'TICK': return state ? E.tick(state) : state
    case 'RUN': return state ? action.fn(state, ...action.args) : state
    default: return state
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, null, () => {
    const s = E.loadGame()
    return s ? E.tick(s) : null // apply offline progress on load
  })

  // 1-second game loop
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(id)
  }, [])

  // Persist (throttled to once per 2s, plus on page hide)
  const latest = useRef(state)
  latest.current = state
  useEffect(() => {
    const id = setInterval(() => latest.current && E.saveGame(latest.current), 2000)
    const onHide = () => latest.current && E.saveGame(latest.current)
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onHide)
    return () => { clearInterval(id); window.removeEventListener('pagehide', onHide); document.removeEventListener('visibilitychange', onHide) }
  }, [])

  const run = useCallback((fn, ...args) => dispatch({ type: 'RUN', fn, args }), [])
  const start = useCallback((name, factionId) => {
    const s = E.newGame(name, factionId)
    E.saveGame(s)
    dispatch({ type: 'INIT', state: s })
  }, [])
  const reset = useCallback(() => { E.clearSave(); dispatch({ type: 'INIT', state: null }) }, [])

  const derived = useMemo(() => (state ? E.derive(state) : null), [state])
  return { state, derived, run, start, reset }
}
