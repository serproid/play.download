import { useRouter } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

type Mode = 'login' | 'signup'

export function UserAuthPanel({
  redirectTo,
  initialMode = 'login',
}: {
  redirectTo?: string
  initialMode?: Mode
}) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    try {
      if (mode === 'login') {
        const result = await authClient.signIn.email({ email, password })
        if (result.error) {
          setError('E-mail ou senha inválidos.')
          return
        }
      } else {
        if (password.length < 8) {
          setError('A senha precisa ter pelo menos 8 caracteres.')
          return
        }
        const result = await authClient.signUp.email({ name, email, password })
        if (result.error) {
          setError(result.error.message ?? 'Não foi possível criar a conta.')
          return
        }
      }

      toast.success(mode === 'login' ? 'Sessão iniciada.' : 'Conta criada.')
      await router.invalidate()
      window.location.assign(redirectTo ?? '/users')
    } catch {
      setError('Não foi possível continuar. Tente novamente.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <div className="flex gap-6 border-b border-border">
        {(
          [
            ['login', 'Entrar'],
            ['signup', 'Criar conta'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value)
              setError(null)
            }}
            className={cn(
              '-mb-px border-b-2 pb-3 text-sm font-medium',
              mode === value
                ? 'border-brand text-brand'
                : 'border-transparent text-[#5f6368] dark:text-[#9aa0a6]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {mode === 'signup' ? (
          <div className="space-y-1.5">
            <Label htmlFor="user-name" className="text-xs font-medium">
              Nome
            </Label>
            <Input
              id="user-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
              minLength={2}
              className="h-11 rounded-lg"
            />
          </div>
        ) : null}

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
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={8}
            className="h-11 rounded-lg"
          />
        </div>

        {error ? (
          <p className="text-[13px] text-[#c5221f]">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>
    </div>
  )
}
