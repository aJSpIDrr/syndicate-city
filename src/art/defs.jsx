import { useId } from 'react'

// Shared material gradients for the built-in SVG art. Each artwork renders <Materials id={uid} />
// in its <defs> and references fills with m(uid, 'metal') etc.
export function useUid() {
  return 'a' + useId().replace(/[^a-zA-Z0-9]/g, '')
}

export const m = (uid, name) => `url(#${uid}-${name})`

const LINEAR = {
  metal: ['#5B6169', '#2A2E33', '#16181B'],
  steel: ['#C9CFD6', '#7D858E', '#3D434A'],
  chrome: ['#F2F5F8', '#9AA3AD', '#4A525B'],
  wood: ['#9A5B2E', '#6B3A1C', '#3E2210'],
  darkwood: ['#5E3A22', '#3A2314', '#1E120A'],
  brass: ['#F3D58A', '#C29A45', '#7A5A1E'],
  gold: ['#FFF0B0', '#E2B93B', '#8A6D1F'],
  leather: ['#6E4A33', '#4A2F1F', '#2A1A10'],
  black: ['#3A3D42', '#1C1E21', '#0B0C0D'],
  khaki: ['#A39477', '#7A6D55', '#4D4434'],
  olive: ['#6B7350', '#4A5038', '#2C3022'],
  red: ['#E0434F', '#A4161A', '#5C0B0E'],
  cream: ['#F2EBDD', '#D6CCB8', '#A69C88'],
  paper: ['#E9D9A8', '#CBB57A', '#9C8650'],
  jade: ['#5FD3A5', '#1F9E6E', '#0B5A3C'],
  water: ['#1F3A57', '#132538', '#0A1520'],
}

export function Materials({ id }) {
  return (
    <>
      {Object.entries(LINEAR).map(([name, [a, b, c]]) => (
        <linearGradient key={name} id={`${id}-${name}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="55%" stopColor={b} />
          <stop offset="100%" stopColor={c} />
        </linearGradient>
      ))}
      <radialGradient id={`${id}-glass`} cx="35%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#CFE8FF" stopOpacity=".9" />
        <stop offset="60%" stopColor="#3A5A78" stopOpacity=".8" />
        <stop offset="100%" stopColor="#0E1A26" />
      </radialGradient>
      <radialGradient id={`${id}-flame`} cx="50%" cy="70%" r="60%">
        <stop offset="0%" stopColor="#FFF3B0" />
        <stop offset="45%" stopColor="#FF9F1C" />
        <stop offset="100%" stopColor="#D62828" stopOpacity="0" />
      </radialGradient>
      <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.6" floodColor="#000" floodOpacity=".6" />
      </filter>
    </>
  )
}
