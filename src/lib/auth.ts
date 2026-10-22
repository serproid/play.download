import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { admin } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { db, schema } from './db'

const configuredUrl = process.env.BETTER_AUTH_URL?.trim()
const configuredHost = (() => {
  if (!configuredUrl) return null
  try {
    return new URL(configuredUrl).host
  } catch {
    return null
  }
})()

const extraHosts = (process.env.BETTER_AUTH_ALLOWED_HOSTS ?? '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean)

const allowedHosts = Array.from(
  new Set(
    [
      'localhost:3000',
      'localhost:5173',
      '*.workers.dev',
      'play.download',
      'www.play.download',
      ...(configuredHost ? [configuredHost] : []),
      ...extraHosts,
    ].filter(Boolean),
  ),
)

export const auth = betterAuth({
  baseURL: {
    allowedHosts,
    fallback: configuredUrl || 'http://localhost:3000',
    protocol: process.env.NODE_ENV === 'development' ? 'http' : 'https',
  },
  secret:
    process.env.BETTER_AUTH_SECRET ??
    'baixapp-dev-secret-change-me-in-production-0123456789',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  plugins: [admin(), tanstackStartCookies()],
})

export type Session = typeof auth.$Infer.Session
