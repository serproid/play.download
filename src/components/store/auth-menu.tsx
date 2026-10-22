import { Link, useRouter } from '@tanstack/react-router'
import {
  LayoutDashboard,
  LogOut,
  PlusCircle,
  UserRound,
  LogIn,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import type { SessionUser } from '@/lib/types'
import { hasAdminRoleClient } from '@/lib/roles'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AuthMenu({ user }: { user: SessionUser | null }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  if (!user) {
    return (
      <Link
        to="/login"
        search={{ redirect: undefined }}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[13px] font-semibold text-foreground shadow-xs transition-colors hover:bg-accent"
      >
        <LogIn className="size-4" />
        Entrar
      </Link>
    )
  }

  const isAdmin = hasAdminRoleClient(user.role)
  const initial = user.name.trim().charAt(0).toUpperCase() || 'U'

  async function signOut() {
    setPending(true)
    try {
      await authClient.signOut()
      toast.success('Você saiu da sua conta.')
      await router.invalidate()
      await router.navigate({ to: '/' })
    } catch {
      toast.error('Não foi possível sair agora.')
    } finally {
      setPending(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'size-9 overflow-hidden rounded-full bg-brand-soft text-sm font-bold text-brand ring-1 ring-brand/15 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring',
            pending && 'opacity-60',
          )}
          aria-label="Abrir menu da conta"
        >
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center">
              {initial}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="space-y-0.5">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/minha-conta">
            <UserRound /> Minha conta
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/adicionar">
            <PlusCircle /> Adicionar app
          </Link>
        </DropdownMenuItem>
        {isAdmin ? (
          <DropdownMenuItem asChild>
            <Link to="/admin">
              <LayoutDashboard /> Painel admin
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={signOut}>
          <LogOut /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
