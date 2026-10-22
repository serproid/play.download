import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { BrandLogo } from '@/components/brand-logo'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { hasAdminRoleClient } from '@/lib/roles'

export function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    try {
      const result = await authClient.signIn.email({ email, password })
      if (result.error) {
        setError('E-mail ou senha inválidos.')
        return
      }

      if (!hasAdminRoleClient(result.data?.user?.role)) {
        await authClient.signOut()
        setError('Esta conta não tem acesso administrativo.')
        return
      }

      toast.success('Acesso liberado.')
      window.location.assign('/admin/painel')
    } catch {
      setError('Não foi possível entrar. Tente novamente.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-[360px]">
        <div className="flex justify-center">
          <BrandLogo />
        </div>
        <h1 className="mt-8 text-center text-xl font-normal text-foreground">
          Acesso administrativo
        </h1>
        <p className="mt-1 text-center text-sm text-[#5f6368] dark:text-[#9aa0a6]">
          Entre com uma conta de administrador.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="admin-email" className="text-xs font-medium">
              E-mail
            </Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="h-11 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-password" className="text-xs font-medium">
              Senha
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="h-11 rounded-lg"
            />
          </div>

          {error ? <p className="text-[13px] text-[#c5221f]">{error}</p> : null}

          <button
            type="submit"
            disabled={pending}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
