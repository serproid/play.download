import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { AuthShell } from '@/components/auth-shell'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { getSession, hasAdminRole } from '@/lib/auth.functions'
import { hasAdminRoleClient } from '@/lib/roles'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === 'string' && search.redirect.startsWith('/')
        ? search.redirect
        : undefined,
  }),
  beforeLoad: async () => {
    const session = await getSession()
    if (session) {
      throw redirect({
        to: hasAdminRole(session.user.role) ? '/admin' : '/',
      })
    }
  },
  head: () => ({
    meta: [{ title: 'Entrar — Play Download' }],
  }),
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const { redirect: redirectTo } = Route.useSearch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    try {
      const result = await authClient.signIn.email({ email, password })
      if (result.error) {
        setError(result.error.message ?? 'E-mail ou senha inválidos.')
        return
      }

      toast.success('Bem-vindo de volta!')
      await router.invalidate()
      const target =
        redirectTo ??
        (hasAdminRoleClient(result.data?.user?.role) ? '/admin' : '/')
      window.location.assign(target)
    } catch {
      setError('Não foi possível entrar agora. Tente novamente.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthShell
      title="Entrar"
      subtitle="Acesse sua conta para avaliar, salvar favoritos e enviar seus apps."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link
            to="/cadastro"
            search={{ redirect: redirectTo }}
            className="font-semibold text-brand hover:underline"
          >
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@email.com"
            required
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-semibold">
            Senha
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              required
              minLength={8}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {error ? (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-[11px] font-medium text-destructive">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-bold text-brand-foreground transition-opacity disabled:opacity-70"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogIn className="size-4" />
          )}
          {pending ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </AuthShell>
  )
}
