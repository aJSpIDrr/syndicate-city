// Tiny WebAudio synth for UI sound effects (no audio files). Mute preference is per-browser.
const KEY = 'syndicate-city-sound'
let ctx = null
let enabled = (() => { try { return localStorage.getItem(KEY) !== 'off' } catch { return true } })()

export const soundEnabled = () => enabled
export function setSoundEnabled(on) {
  enabled = on
  try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch { /* ignore */ }
  if (on) play('click')
}

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(c, { freq, type = 'square', start = 0, dur = 0.12, vol = 0.08, slide }) {
  const t = c.currentTime + start
  const o = c.createOscillator(), g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(c.destination)
  o.start(t); o.stop(t + dur + 0.02)
}

function noise(c, { start = 0, dur = 0.15, vol = 0.12 }) {
  const t = c.currentTime + start
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  const src = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter()
  f.type = 'lowpass'; f.frequency.value = 900
  g.gain.value = vol
  src.buffer = buf
  src.connect(f).connect(g).connect(c.destination)
  src.start(t)
}

const SFX = {
  click: (c) => tone(c, { freq: 660, dur: 0.05, vol: 0.04 }),
  coin: (c) => { tone(c, { freq: 988, dur: 0.08, vol: 0.06 }); tone(c, { freq: 1319, start: 0.07, dur: 0.18, vol: 0.06 }) },
  hit: (c) => { noise(c, { dur: 0.12, vol: 0.18 }); tone(c, { freq: 180, slide: 60, type: 'sawtooth', dur: 0.15, vol: 0.08 }) },
  thud: (c) => { noise(c, { dur: 0.2, vol: 0.14 }); tone(c, { freq: 110, slide: 45, type: 'triangle', dur: 0.25, vol: 0.12 }) },
  fanfare: (c) => [523, 659, 784, 1047].forEach((f, i) => tone(c, { freq: f, type: 'triangle', start: i * 0.1, dur: 0.22, vol: 0.09 })),
}

export function play(name) {
  if (!enabled) return
  try { const c = ac(); if (c && SFX[name]) SFX[name](c) } catch { /* audio unavailable */ }
}

// Map a game toast to a sound
export function playForToast(toast) {
  if (!toast) return
  const t = toast.text || ''
  if (toast.kind === 'level') return play('fanfare')
  if (toast.kind === 'error') return play('thud')
  if (toast.kind === 'win') return play(/beat|REVENGE|hit /i.test(t) ? 'hit' : 'coin')
  play('click')
}
