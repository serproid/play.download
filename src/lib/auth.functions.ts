import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from './auth'

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

export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  if (isDemoMode()) return null
  const headers = getRequestHeaders()
  return auth.api.getSession({ headers })
})

export const requireUser = createServerOnlyFn(async () => {
  if (isDemoMode()) {
    throw new Error('Configure o banco de dados (DATABASE_URL) para continuar.')
  }
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
