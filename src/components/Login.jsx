import { useState } from 'react'
import { LogIn, UserPlus } from 'lucide-react'

export default function Login({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError(null)
    const err = await onAuth(mode, username.trim(), password)
    setBusy(false)
    if (err) setError(err)
  }
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10 noir-grain">
      <form onSubmit={submit} className="box w-full max-w-sm">
        <div className="box-head"><span>{mode === 'login' ? 'Log In' : 'Create Account'}</span></div>
        <div className="space-y-3 p-4">
          <div className="text-center font-display text-3xl font-extrabold tracking-widest gold-shine">SYNDICATE CITY</div>
          <p className="text-center text-[12px] text-stone-400">The city is online. Log in to play with other bosses.</p>
          <input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username"
            className="w-full rounded border border-line bg-black/40 px-3 py-2 text-stone-100 outline-none focus:border-gold" />
          <input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
            className="w-full rounded border border-line bg-black/40 px-3 py-2 text-stone-100 outline-none focus:border-gold" />
          {mode === 'signup' && <p className="text-[11px] text-stone-500">Username: 3–20 letters, numbers or _. Password: at least 6 characters.</p>}
          {error && <p className="text-[12px] text-red-400">{error}</p>}
          <button type="submit" className="classic-btn classic-btn-gold w-full" disabled={busy || !username || !password}>
            {mode === 'login' ? <><LogIn size={13} /> Log in</> : <><UserPlus size={13} /> Create account</>}
          </button>
          <button type="button" className="w-full text-[12px] text-brass hover:underline" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}>
            {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}
          </button>
        </div>
      </form>
    </div>
  )
}
