// Database: hosted Postgres when DATABASE_URL is set (Neon on Render), otherwise PGlite
// (embedded Postgres) in ./data/pglite for local play, or in memory for tests.
import { mkdirSync } from 'node:fs'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  username_lower TEXT NOT NULL UNIQUE,
  pass_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS players (
  account_id INT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  state JSONB NOT NULL,
  boss_name TEXT NOT NULL,
  faction TEXT NOT NULL,
  level INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS password_resets (
  token_hash TEXT PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS email TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS accounts_email_lower ON accounts (lower(email));
CREATE TABLE IF NOT EXISTS ledger (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL,
  kind TEXT NOT NULL,
  detail JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`

export async function openDb({ url = process.env.DATABASE_URL, dir, memory = false } = {}) {
  let db
  if (url) {
    const pg = (await import('pg')).default
    const pool = new pg.Pool({ connectionString: url, ssl: url.includes('localhost') ? false : { rejectUnauthorized: false }, max: 5 })
    db = {
      query: (sql, params) => pool.query(sql, params),
      async tx(fn) {
        const c = await pool.connect()
        try { await c.query('BEGIN'); const r = await fn({ query: (q, p) => c.query(q, p) }); await c.query('COMMIT'); return r }
        catch (e) { await c.query('ROLLBACK'); throw e }
        finally { c.release() }
      },
      close: () => pool.end(),
    }
  } else {
    const { PGlite } = await import('@electric-sql/pglite')
    if (!memory) mkdirSync(dir || './data/pglite', { recursive: true })
    const lite = memory ? new PGlite() : new PGlite(dir || './data/pglite')
    let chain = Promise.resolve() // PGlite has one connection: run transactions one at a time
    db = {
      query: (sql, params) => lite.query(sql, params),
      tx(fn) {
        const run = chain.then(() => lite.transaction((t) => fn({ query: (q, p) => t.query(q, p) })))
        chain = run.catch(() => {})
        return run
      },
      close: () => lite.close(),
    }
  }
  await db.query(SCHEMA.split(';').filter((x) => x.trim()).map((x) => x + ';').join('\n')).catch(async () => {
    for (const stmt of SCHEMA.split(';').map((x) => x.trim()).filter(Boolean)) await db.query(stmt)
  })
  return db
}
