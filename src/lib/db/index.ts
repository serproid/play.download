import { AsyncLocalStorage } from 'node:async_hooks'
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL ?? ''
const sslDisabled = process.env.DATABASE_SSL === 'false'
const useSsl =
  !sslDisabled &&
  (process.env.DATABASE_SSL === 'true' ||
    Boolean(
      connectionString &&
      /supabase|neon|sslmode=require/.test(connectionString),
    ))

type Database = PostgresJsDatabase<typeof schema>
type RequestStore = { db: Database }

const storage = new AsyncLocalStorage<RequestStore>()

function createClient() {
  return postgres(connectionString, {
    max: 5,
    idle_timeout: 5,
    connect_timeout: 10,
    prepare: false,
    ssl: useSsl ? 'require' : false,
  })
}

const baseDb = drizzle(createClient(), { schema })

export async function withDatabase<T>(fn: () => Promise<T>): Promise<T> {
  if (storage.getStore()) return fn()

  const requestDb = drizzle(createClient(), { schema })
  return storage.run({ db: requestDb }, fn)
}

export const db = new Proxy(baseDb, {
  get(target, property) {
    const store = storage.getStore()
    const instance = store?.db ?? target
    const value = Reflect.get(instance, property, instance)
    return typeof value === 'function' ? value.bind(instance) : value
  },
}) as Database

export { schema }
