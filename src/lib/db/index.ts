import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL
const useSsl =
  process.env.DATABASE_SSL === 'true' ||
  Boolean(connectionString && /supabase|neon|sslmode=require/.test(connectionString))

declare global {
  var __baixappPool: Pool | undefined
}

export const pool =
  globalThis.__baixappPool ??
  new Pool({
    connectionString,
    max: 10,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__baixappPool = pool
}

export const db = drizzle(pool, { schema })
export { schema }
