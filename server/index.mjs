import { createServer } from 'node:http'
import { openDb } from './db.mjs'
import { makeApp } from './app.mjs'

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required in production.')
  process.exit(1)
}
const db = await openDb()
const port = Number(process.env.PORT || 3001)
createServer(makeApp(db)).listen(port, '0.0.0.0', () => console.log(`Syndicate City server on :${port}`))
