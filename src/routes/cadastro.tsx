import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { Loader2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { AuthShell } from '@/components/auth-shell'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { getSession, hasAdminRole } from '@/lib/auth.functions'

export const Route = createFileRoute('/cadastro')({
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
    meta: [{ title: 'Criar conta — Play Download' }],
  }),
  component: CadastroPage,
})

function CadastroPage() {
  const router = useRouter()
  const { redirect: redirectTo } = Route.useSearch()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.')
      return
    }

    setPending(true)
    try {
      const result = await authClient.signUp.email({ name, email, password })
      if (result.error) {
        setError(result.error.message ?? 'Não foi possível criar sua conta.')
        return
      }

      toast.success('Conta criada com sucesso!')
      await router.invalidate()
      window.location.assign(redirectTo ?? '/')
    } catch {
      setError('Não foi possível criar sua conta agora.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthShell
      title="Criar conta"
      subtitle="É rápido e grátis. Avalie apps, salve favoritos e publique seus envios."
      footer={
        <>
          Já tem conta?{' '}
          <Link
            to="/login"
            search={{ redirect: redirectTo }}
            className="font-semibold text-brand hover:underline"
          >
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold">
            Nome
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seu nome"
            autoComplete="name"
            required
            minLength={2}
            className="h-11"
          />
        </div>

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
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo de 8 caracteres"
            required
            minLength={8}
            className="h-11"
          />
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
            <UserPlus className="size-4" />
          )}
          {pending ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>
    </AuthShell>
  )
}
