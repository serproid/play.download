import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth, type Session } from './auth'

export function hasAdminRole(role?: string | null) {
  return Boolean(
    role
      ?.split(',')
      .map((value) => value.trim())
      .includes('admin'),
  )
}

export function isDemoMode() {
  return !process.env.DATABASE_URL
}

const now = new Date()

export const demoSession = {
  user: {
    id: 'demo-admin',
    name: 'Administrador Demo',
    email: 'admin@demo.googleplay',
    emailVerified: true,
    image: null,
    role: 'admin',
    banned: false,
    banReason: null,
    banExpires: null,
    createdAt: now,
    updatedAt: now,
  },
  session: {
    id: 'demo-session',
    token: 'demo-session-token',
    userId: 'demo-admin',
    expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30),
    createdAt: now,
    updatedAt: now,
    ipAddress: null,
    userAgent: null,
    impersonatedBy: null,
  },
} as Session

export const getSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    if (isDemoMode()) return demoSession
    const headers = getRequestHeaders()
    return auth.api.getSession({ headers })
  },
)

export const requireUser = createServerOnlyFn(async () => {
  if (isDemoMode()) return demoSession
  const session = await auth.api.getSession({ headers: getRequestHeaders() })
  if (!session) {
    throw new Error('Você precisa entrar na sua conta.')
  }
  return session
})

export const requireAdmin = createServerOnlyFn(async () => {
  const session = await requireUser()
  if (!hasAdminRole(session.user.role)) {
    throw new Error('Acesso restrito a administradores.')
  }
  return session
})
