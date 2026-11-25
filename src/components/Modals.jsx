import { useState } from 'react'
import { ONLINE, API_URL } from '../game/online'
import { exportSave } from '../game/engine'
import { soundEnabled, setSoundEnabled } from '../game/sound'
import { BUILD } from './UpdateBanner'
import { CHANGELOG } from '../data/changelog'
import { ArrowRight, Coins, Zap, Grab, Package, FlaskConical, Landmark, Stethoscope } from 'lucide-react'
import { getFaction, formatPerk, RANK_LEVELS } from '../data/factions'
import {
  dismissPromotion, goldRefill, openCrate, devLevels, devGold, devCash, deposit, withdraw, healAtDoctor, money, GOLD_PRICES,
} from '../game/engine'
import Avatar, { frameTier } from './Avatar'
import { Modal } from './ui'

export function PromotionModal({ s, run }) {
  if (!s.promotion) return null
  const f = getFaction(s.factionId)
  const { from, to } = s.promotion
  const close = () => run(dismissPromotion)
  return (
    <Modal open onClose={close} title="RANK PROMOTION!" wide accent={f.accent} top>
      <div className="text-center">
        <div className="label" style={{ color: f.accent }}>{f.name} · Level {RANK_LEVELS[to]}{to === 9 ? '+' : ''}</div>
        <h3 className="mt-1 font-display text-3xl font-extrabold gold-shine">{f.ranks[to].title}</h3>
        {s.promotion.gold > 0 && <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-sm font-bold text-gold"><Coins size={14} /> +{s.promotion.gold} Gold Bars</div>}
        <p className="mt-2 text-sm text-stone-400">{f.mentor}: "You've earned this. The streets will remember the name {s.bossName}."</p>
      </div>
      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <RankCard f={f} rank={from} dim />
        <ArrowRight className="mt-16 text-gold" />
        <RankCard f={f} rank={to} />
      </div>
      <button className="classic-btn classic-btn-gold mt-6 w-full" onClick={close}>Claim My Rank</button>
    </Modal>
  )
}

function RankCard({ f, rank, dim }) {
  const r = f.ranks[rank]
  return (
    <div className={`flex flex-col items-center text-center ${dim ? 'opacity-60' : ''}`}>
      <Avatar factionId={f.id} rank={rank} size={dim ? 110 : 140} />
      <div className="mt-2 font-semibold text-stone-100">{r.title}</div>
      <div className="text-[11px] text-stone-500">{frameTier(rank).name} Frame</div>
      <ul className="mt-2 space-y-0.5 text-xs" style={{ color: dim ? '#A8A29E' : f.accent }}>
        {Object.entries(r.perks).map(([k, v]) => <li key={k}>{formatPerk(k, v)}</li>)}
      </ul>
    </div>
  )
}

export function StoreModal({ open, onClose, s, run }) {
  return (
    <Modal open={open} onClose={onClose} title="Gold Store">
      <div className="mb-4 flex items-center gap-2 text-lg font-bold text-gold"><Coins /> {s.gold} Gold Bars</div>
      <div className="space-y-2">
        <StoreRow icon={Zap} color="#60A5FA" title="Refill Energy" desc="Instantly fill your Energy bar." price={GOLD_PRICES.energy} disabled={s.gold < GOLD_PRICES.energy} onClick={() => run(goldRefill, 'energy')} />
        <StoreRow icon={Grab} color="#F87171" title="Refill Stamina" desc="Instantly fill your Stamina bar." price={GOLD_PRICES.stamina} disabled={s.gold < GOLD_PRICES.stamina} onClick={() => run(goldRefill, 'stamina')} />
        <StoreRow icon={Package} color="#C084FC" title="Contraband Crate" desc="2 random contraband pieces." price={GOLD_PRICES.crate} disabled={s.gold < GOLD_PRICES.crate} onClick={() => run(openCrate)} />
      </div>
      <p className="mt-4 text-xs text-stone-500">Earn Gold Bars by leveling up (+2) and earning Job Mastery stars (+3).</p>

      {!ONLINE && <div className="mt-5 rounded-lg border border-dashed border-amber-600/50 bg-amber-950/20 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-300"><FlaskConical size={16} /> Dev Test Tools</div>
        <div className="flex flex-wrap gap-2">
          <button className="classic-btn-dark" onClick={() => run(devLevels, 5)}>+5 Levels</button>
          <button className="classic-btn-dark" onClick={() => run(devGold, 50)}>+50 Gold</button>
          <button className="classic-btn-dark" onClick={() => run(devCash, 100000)}>+$100,000</button>
        </div>
      </div>}
    </Modal>
  )
}

function StoreRow({ icon: Icon, color, title, desc, price, disabled, onClick }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-black/20 p-3">
      <Icon color={color} />
      <div className="flex-1"><div className="font-semibold text-stone-100">{title}</div><div className="text-xs text-stone-400">{desc}</div></div>
      <button className="classic-btn classic-btn-gold" disabled={disabled} onClick={onClick}>{price} <Coins size={14} /></button>
    </div>
  )
}

export function BankModal({ open, onClose, s, d, run }) {
  const [amt, setAmt] = useState('')
  const n = Math.max(0, Math.floor(Number(amt) || 0))
  const fee = Math.ceil(Math.min(n, s.cash) * d.bankFee)
  return (
    <Modal open={open} onClose={onClose} title="The Vault">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-line bg-black/20 p-3"><div className="label">Cash on hand</div><div className="text-xl font-bold text-green-400">{money(s.cash)}</div><div className="text-xs text-stone-500">Can be stolen</div></div>
        <div className="rounded-lg border border-gold/40 bg-gold/5 p-3"><div className="label">Banked</div><div className="text-xl font-bold text-gold">{money(s.bank)}</div><div className="text-xs text-stone-500">Safe from rivals</div></div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-stone-300"><Landmark size={16} /> Laundering fee: <b>{Math.round(d.bankFee * 100)}%</b>{d.bankFee < 0.1 && <span className="text-xs" style={{ color: 'var(--accent)' }}>(faction perk)</span>} · withdrawals are free</div>
      <input
        inputMode="numeric"
        value={amt}
        onChange={(e) => setAmt(e.target.value.replace(/[^0-9]/g, ''))}
        placeholder="Amount"
        className="mt-3 w-full rounded-lg border border-line bg-black/40 px-3 py-2 text-stone-100 outline-none focus:border-gold"
      />
      {n > 0 && <div className="mt-1 text-xs text-stone-500">Depositing {money(Math.min(n, s.cash))} banks {money(Math.min(n, s.cash) - fee)} after a {money(fee)} fee.</div>}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="classic-btn classic-btn-gold" disabled={n <= 0 || s.cash <= 0} onClick={() => { run(deposit, n); setAmt('') }}>Deposit</button>
        <button className="classic-btn-dark" disabled={n <= 0 || s.bank <= 0} onClick={() => { run(withdraw, n); setAmt('') }}>Withdraw</button>
        <button className="classic-btn classic-btn-gold" disabled={s.cash <= 0} onClick={() => run(deposit, s.cash)}>Deposit All</button>
        <button className="classic-btn-dark" disabled={s.bank <= 0} onClick={() => run(withdraw, s.bank)}>Withdraw All</button>
      </div>
    </Modal>
  )
}

export function DoctorModal({ open, onClose, s, d, run }) {
  const cost = s.level * 150
  return (
    <Modal open={open} onClose={onClose} title="Street Doctor">
      <div className="flex items-start gap-3">
        <Stethoscope className="mt-1 text-red-300" />
        <p className="text-sm text-stone-300">"Cash up front, no questions asked." Restores you to full health ({s.health} → {d.maxHealth}).</p>
      </div>
      <button className="classic-btn classic-btn-gold mt-4 w-full" disabled={s.cash < cost || s.health >= d.maxHealth} onClick={() => { run(healAtDoctor); onClose() }}>
        Pay {money(cost)}
      </button>
      <p className="mt-2 text-xs text-stone-500">Or wait: health regenerates on its own over time.</p>
    </Modal>
  )
}

const KIND_COLOR = { win: '#4ADE80', loss: '#F87171', level: '#D4AF37', mentor: '#93C5FD', info: '#A8A29E' }
export function LogModal({ open, onClose, s }) {
  return (
    <Modal open={open} onClose={onClose} title="Messages & Battle Log">
      {s.log.length === 0 ? <p className="text-sm text-stone-500">Nothing yet.</p> : (
        <ul className="space-y-2">
          {s.log.map((l) => (
            <li key={l.id} className="border-l-2 pl-3" style={{ borderColor: KIND_COLOR[l.kind] }}>
              <div className="text-sm text-stone-200">{l.text}</div>
              <div className="text-[11px] text-stone-500">{new Date(l.t).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}

export function BackupPanel({ s, onRestore }) {
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState(null)
  const copy = async () => {
    const text = exportSave(s)
    try { await navigator.clipboard.writeText(text); setMsg({ ok: true, t: 'Backup code copied. Paste it somewhere safe.' }) }
    catch { setCode(text); setMsg({ ok: true, t: 'Copy the code from the box below.' }) }
  }
  const restore = () => {
    try { onRestore(code); setMsg(null); setCode('') } catch (e) { setMsg({ ok: false, t: e.message }) }
  }
  return (
    <div className="rounded-lg border border-line bg-black/20 p-3">
      <div className="text-sm font-semibold text-stone-200">Save Backup</div>
      <p className="mt-1 text-xs text-stone-400">Saves live in this browser only. Copy a backup code to move your boss to another device or keep it safe.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {s && <button className="classic-btn classic-btn-gold" onClick={copy}>Copy Backup Code</button>}
      </div>
      <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={3} placeholder="Paste a backup code here to restore it"
        className="mt-2 w-full resize-none rounded border border-line bg-black/40 p-2 font-mono text-[11px] text-stone-300 outline-none focus:border-gold" />
      <button className="classic-btn-dark mt-1" disabled={!code.trim()} onClick={restore}>Restore From Code</button>
      {msg && <p className={`mt-1 text-xs ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.t}</p>}
    </div>
  )
}

export function SettingsModal({ open, onClose, s, onReset, onRestore, onUpdates, online, user, onLogout }) {
  const [sound, setSound] = useState(soundEnabled())
  const [confirm, setConfirm] = useState(false)
  const f = getFaction(s.factionId)
  return (
    <Modal open={open} onClose={() => { setConfirm(false); onClose() }} title="Settings">
      <div className="space-y-1 text-sm text-stone-300">
        <div>Boss: <b>{s.bossName}</b></div>
        <div>Faction: <b style={{ color: f.accent }}>{f.name}</b></div>
        <div>Jobs done: {s.stats.jobs.toLocaleString()} · Lifetime earnings: {money(s.stats.cashEarned)}</div>
        <div className="text-xs text-stone-500">{ONLINE ? `Online mode · server ${API_URL}` : 'Offline mode: progress saves in this browser.'} Version {BUILD}</div>
        {onUpdates && <button className="mt-1 text-xs font-semibold text-gold hover:underline" onClick={onUpdates}>See the update history</button>}
      </div>
      <label className="mt-4 flex cursor-pointer items-center justify-between rounded-lg border border-line bg-black/20 p-3">
        <span className="text-sm font-semibold text-stone-200">Sound effects</span>
        <input type="checkbox" checked={sound} onChange={(e) => { setSound(e.target.checked); setSoundEnabled(e.target.checked) }} className="h-4 w-4 accent-[var(--accent)]" />
      </label>
      {online ? (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-line bg-black/20 p-3">
          <span className="text-sm text-stone-300">Logged in as <b className="text-stone-100">{user}</b>. Your boss is saved online.</span>
          <button className="classic-btn-dark" onClick={onLogout}>Log out</button>
        </div>
      ) : <div className="mt-3"><BackupPanel s={s} onRestore={onRestore} /></div>}
      {!online && <div className="mt-5 rounded-lg border border-red-900/60 bg-red-950/20 p-3">
        <div className="text-sm font-semibold text-red-300">Reset Save</div>
        <p className="mt-1 text-xs text-stone-400">Deletes this boss and starts over at faction selection. This can't be undone.</p>
        {confirm ? (
          <div className="mt-3 flex gap-2">
            <button className="btn bg-red-600 text-white hover:bg-red-500" onClick={() => { setConfirm(false); onReset() }}>Yes, delete everything</button>
            <button className="classic-btn-dark" onClick={() => setConfirm(false)}>Cancel</button>
          </div>
        ) : (
          <button className="classic-btn-dark mt-3 border-red-900 text-red-300" onClick={() => setConfirm(true)}>Reset Save…</button>
        )}
      </div>}
    </Modal>
  )
}

export function UpdatesModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="What's New" wide>
      <ol className="relative space-y-4 border-l border-line pl-5">
        {CHANGELOG.map((u, i) => (
          <li key={u.id} className="relative">
            <span className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 ${i === 0 ? 'border-gold bg-gold' : 'border-stone-500 bg-ink'}`} />
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-base font-bold text-stone-100">{u.title}</span>
              <span className="text-[11px] font-semibold text-stone-500">v{u.id} · {new Date(u.date + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              {i === 0 && <span className="chip bg-gold text-ink">LATEST</span>}
            </div>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[13px] text-stone-300">
              {u.items.map((t, j) => <li key={j}>{t}</li>)}
            </ul>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[11px] text-stone-500">Build {BUILD}</p>
    </Modal>
  )
}
