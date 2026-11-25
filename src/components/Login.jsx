import { useState } from 'react'
import { LogIn, UserPlus, Mail, KeyRound } from 'lucide-react'

const resetToken = () => { try { return new URLSearchParams(location.search).get('reset') } catch { return null } }

export default function Login({ onAuth, addEmail = false }) {
  const [mode, setMode] = useState(addEmail ? 'email' : resetToken() ? 'reset' : 'login')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [busy, setBusy] = useState(false)
  const go = (m) => { setMode(m); setError(null); setInfo(null) }
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError(null); setInfo(null)
    const fields = mode === 'reset' ? { token: resetToken(), password } : { email: email.trim(), username: username.trim(), password }
    const r = await onAuth(mode, fields)
    setBusy(false)
    if (r?.error) setError(r.error)
    if (r?.info) setInfo(r.info)
  }
  const titles = { login: 'Log In', signup: 'Create Account', forgot: 'Forgot Password', reset: 'Set a New Password', email: 'Add Your Email' }
  const input = 'w-full rounded border border-line bg-black/40 px-3 py-2 text-stone-100 outline-none focus:border-gold'
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10 noir-grain">
      <form onSubmit={submit} className="box w-full max-w-sm">
        <div className="box-head"><span>{titles[mode]}</span></div>
        <div className="space-y-3 p-4">
          <div className="text-center font-display text-3xl font-extrabold tracking-widest gold-shine">SYNDICATE CITY</div>
          {mode === 'login' && <p className="text-center text-[12px] text-stone-400">The city is online. Log in to play with other bosses.</p>}
          {mode === 'forgot' && <p className="text-center text-[12px] text-stone-400">Enter your account email and we'll send you a link to set a new password.</p>}
          {mode === 'reset' && <p className="text-center text-[12px] text-stone-400">Choose a new password for your account.</p>}
          {mode === 'email' && <p className="text-center text-[12px] text-stone-400">Accounts now log in with email. Add yours so you can log in with it and reset your password if you forget it.</p>}

          {mode !== 'reset' && (
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={mode === 'login' ? 'Email' : 'Your email'} className={input} />
          )}
          {mode === 'signup' && (
            <input autoComplete="nickname" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Public name (other players see this)" className={input} />
          )}
          {['login', 'signup', 'reset'].includes(mode) && (
            <input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'reset' ? 'New password' : 'Password'} className={input} />
          )}
          {mode === 'signup' && <p className="text-[11px] text-stone-500">Your email stays private. Public name: 3–20 letters, numbers or _. Password: at least 6 characters.</p>}
          {error && <p className="text-[12px] text-red-400">{error}</p>}
          {info && <p className="text-[12px] text-green-400">{info}</p>}

          <button type="submit" className="classic-btn classic-btn-gold w-full"
            disabled={busy || (mode !== 'reset' && !email) || (['login', 'signup', 'reset'].includes(mode) && !password) || (mode === 'signup' && !username)}>
            {mode === 'login' && <><LogIn size={13} /> Log in</>}
            {mode === 'signup' && <><UserPlus size={13} /> Create account</>}
            {mode === 'forgot' && <><Mail size={13} /> Send reset link</>}
            {mode === 'reset' && <><KeyRound size={13} /> Save new password</>}
            {mode === 'email' && <><Mail size={13} /> Save email</>}
          </button>

          {mode === 'login' && <>
            <button type="button" className="w-full text-[12px] text-stone-400 hover:underline" onClick={() => go('forgot')}>Forgot your password?</button>
            <button type="button" className="w-full text-[12px] text-brass hover:underline" onClick={() => go('signup')}>New here? Create an account</button>
          </>}
          {(mode === 'signup' || mode === 'forgot' || mode === 'reset') && (
            <button type="button" className="w-full text-[12px] text-brass hover:underline" onClick={() => go('login')}>Back to log in</button>
          )}
        </div>
      </form>
    </div>
  )
}
