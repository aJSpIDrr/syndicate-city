// HTTP API for the online game. The server is the source of truth: it loads a player's save, runs the
// same engine the browser uses, and stores the result. The browser only shows state and sends actions.
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import * as E from '../src/game/engine.js'
import { ACTIONS, DEV_ACTIONS, cleanArgs } from '../src/game/actions.js'
import { FACTIONS } from '../src/data/factions.js'
import { giftQuote, applyGiftOut, applyGiftIn } from '../src/game/gifts.js'

const NAME_RE = /^[A-Za-z0-9_]{3,20}$/
const hash = (pw, salt = randomBytes(16).toString('hex')) => `${salt}:${scryptSync(pw, salt, 32).toString('hex')}`
const verify = (pw, stored) => {
  const [salt, h] = stored.split(':')
  const a = Buffer.from(h, 'hex'), b = scryptSync(pw, salt, 32)
  return a.length === b.length && timingSafeEqual(a, b)
}
const strip = (s) => { const { toast: _t, ...rest } = s; return rest }

export function makeApp(db, { dev = process.env.DEV_TOOLS === '1', origins = (process.env.CORS_ORIGINS || '*').split(',') } = {}) {
  async function auth(req) {
    const m = /^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization || '')
    if (!m) return null
    const r = await db.query('SELECT account_id FROM sessions WHERE token = $1', [m[1]])
    return r.rows[0]?.account_id ?? null
  }
  async function session(accountId) {
    const token = randomBytes(32).toString('hex')
    await db.query('INSERT INTO sessions (token, account_id) VALUES ($1, $2)', [token, accountId])
    return token
  }
  /** Load, tick and lock a player's save inside a transaction; fn returns the new state to store. */
  async function withPlayer(accountId, fn) {
    return db.tx(async (t) => {
      const r = await t.query('SELECT state FROM players WHERE account_id = $1 FOR UPDATE', [accountId])
      if (!r.rows[0]) return { status: 404, body: { error: 'No boss yet.' } }
      let s = r.rows[0].state
      s = E.migrate(s)
      s = E.tick(s)
      const out = await fn(s, t)
      if (out.status) return out
      const next = out.state
      await t.query('UPDATE players SET state = $2, level = $3, updated_at = now() WHERE account_id = $1', [accountId, strip(next), next.level])
      return { status: 200, body: { state: next } }
    })
  }

  const routes = {
    'POST /api/signup': async ({ body }) => {
      const { username, password } = body || {}
      if (!NAME_RE.test(username || '')) return { status: 400, body: { error: 'Username: 3–20 letters, numbers or _.' } }
      if (typeof password !== 'string' || password.length < 6 || password.length > 200) return { status: 400, body: { error: 'Password needs at least 6 characters.' } }
      const exists = await db.query('SELECT 1 FROM accounts WHERE username_lower = $1', [username.toLowerCase()])
      if (exists.rows.length) return { status: 409, body: { error: 'That username is taken.' } }
      const r = await db.query('INSERT INTO accounts (username, username_lower, pass_hash) VALUES ($1, $2, $3) RETURNING id', [username, username.toLowerCase(), hash(password)])
      return { status: 200, body: { token: await session(r.rows[0].id), username } }
    },
    'POST /api/login': async ({ body }) => {
      const { username, password } = body || {}
      const r = await db.query('SELECT id, username, pass_hash FROM accounts WHERE username_lower = $1', [String(username || '').toLowerCase()])
      const a = r.rows[0]
      if (!a || typeof password !== 'string' || !verify(password, a.pass_hash)) return { status: 401, body: { error: 'Wrong username or password.' } }
      return { status: 200, body: { token: await session(a.id), username: a.username } }
    },
    'POST /api/logout': async ({ req }) => {
      const m = /^Bearer (\w+)$/.exec(req.headers.authorization || '')
      if (m) await db.query('DELETE FROM sessions WHERE token = $1', [m[1]])
      return { status: 200, body: { ok: true } }
    },
    'GET /api/state': async ({ user }) => withPlayer(user, (s) => ({ state: s })),
    'POST /api/new': async ({ user, body }) => {
      const { name, factionId } = body || {}
      if (!FACTIONS.some((f) => f.id === factionId)) return { status: 400, body: { error: 'Pick a faction.' } }
      const boss = String(name || '').replace(/[^\p{L}\p{N} '._-]/gu, '').trim().slice(0, 24)
      if (boss.length < 2) return { status: 400, body: { error: 'Give your boss a name.' } }
      const has = await db.query('SELECT 1 FROM players WHERE account_id = $1', [user])
      if (has.rows.length) return { status: 409, body: { error: 'You already have a boss.' } }
      const s = E.newGame(boss, factionId)
      await db.query('INSERT INTO players (account_id, state, boss_name, faction, level) VALUES ($1, $2, $3, $4, 1)', [user, strip(s), boss, factionId])
      return { status: 200, body: { state: s } }
    },
    'POST /api/act': async ({ user, body }) => {
      const { action } = body || {}
      const fn = ACTIONS[action] || (dev && DEV_ACTIONS[action])
      const args = cleanArgs(body?.args ?? [])
      if (!fn) return { status: 400, body: { error: 'Unknown action.' } }
      if (!args) return { status: 400, body: { error: 'Bad action arguments.' } }
      return withPlayer(user, (s) => ({ state: fn(s, ...args) }))
    },
    'GET /api/players': async ({ user, url }) => {
      const q = String(url.searchParams.get('q') || '').trim().toLowerCase().slice(0, 24)
      const r = await db.query(
        `SELECT a.username, p.boss_name, p.faction, p.level FROM players p JOIN accounts a ON a.id = p.account_id
         WHERE p.account_id <> $1 AND ($2 = '' OR a.username_lower LIKE $3 OR lower(p.boss_name) LIKE $3)
         ORDER BY p.level DESC LIMIT 20`, [user, q, `%${q.replace(/[%_]/g, '')}%`])
      return { status: 200, body: { players: r.rows } }
    },
    'POST /api/gift': async ({ user, body }) => {
      const to = String(body?.to || '').toLowerCase()
      const target = (await db.query('SELECT a.id, a.username FROM accounts a JOIN players p ON p.account_id = a.id WHERE a.username_lower = $1', [to])).rows[0]
      if (!target) return { status: 404, body: { error: 'No player with that username.' } }
      if (target.id === user) return { status: 400, body: { error: 'You can\'t send a gift to yourself.' } }
      return db.tx(async (t) => {
        // Lock both players in a fixed order so two gifts can't deadlock
        const ids = [user, target.id].sort((a, b) => a - b)
        const rows = (await t.query('SELECT account_id, state FROM players WHERE account_id = ANY($1) ORDER BY account_id FOR UPDATE', [ids])).rows
        const me = rows.find((r) => r.account_id === user), them = rows.find((r) => r.account_id === target.id)
        const sender = E.tick(E.migrate(me.state)), receiver = E.tick(E.migrate(them.state))
        const quote = giftQuote(sender, { kind: body?.kind, amount: body?.amount, itemId: body?.itemId, qty: body?.qty })
        if (quote.error) return { status: 400, body: { error: quote.error } }
        const fromName = (await t.query('SELECT username FROM accounts WHERE id = $1', [user])).rows[0].username
        const s1 = applyGiftOut(sender, quote, target.username)
        const s2 = applyGiftIn(receiver, quote, `${sender.bossName} (${fromName})`)
        await t.query('UPDATE players SET state = $2, level = $3, updated_at = now() WHERE account_id = $1', [user, strip(s1), s1.level])
        await t.query('UPDATE players SET state = $2, level = $3, updated_at = now() WHERE account_id = $1', [target.id, strip(s2), s2.level])
        await t.query('INSERT INTO ledger (account_id, kind, detail) VALUES ($1, $2, $3)', [user, 'gift', { to: target.id, ...quote }])
        return { status: 200, body: { state: s1 } }
      })
    },
    'GET /api/health': async () => ({ status: 200, body: { ok: true, dev } }),
  }

  return async function handle(req, res) {
    const origin = req.headers.origin
    const allow = origins.includes('*') ? '*' : origins.includes(origin) ? origin : null
    if (allow) {
      res.setHeader('Access-Control-Allow-Origin', allow)
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    }
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end() }
    const url = new URL(req.url, 'http://x')
    const route = routes[`${req.method} ${url.pathname}`]
    const send = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)) }
    if (!route) return send(404, { error: 'Not found.' })
    try {
      let body = null
      if (req.method === 'POST') {
        let raw = ''
        for await (const chunk of req) { raw += chunk; if (raw.length > 20000) return send(413, { error: 'Too large.' }) }
        try { body = raw ? JSON.parse(raw) : {} } catch { return send(400, { error: 'Bad JSON.' }) }
      }
      const open = ['POST /api/signup', 'POST /api/login', 'GET /api/health', 'POST /api/logout'].includes(`${req.method} ${url.pathname}`)
      const user = open ? null : await auth(req)
      if (!open && !user) return send(401, { error: 'Please log in.' })
      const out = await route({ req, body, user, url })
      send(out.status, out.body)
    } catch (e) {
      console.error(e)
      send(500, { error: 'Server error.' })
    }
  }
}
