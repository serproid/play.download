import { useRouter } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

export function UserAuthPanel({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter()
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

      toast.success('Sessão iniciada.')
      await router.invalidate()
      window.location.assign(redirectTo ?? '/users')
    } catch {
      setError('Não foi possível continuar. Tente novamente.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="user-email" className="text-xs font-medium">
          E-mail
        </Label>
        <Input
          id="user-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          className="h-11 rounded-lg"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="user-password" className="text-xs font-medium">
          Senha
        </Label>
        <Input
          id="user-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          minLength={8}
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
  )
}
