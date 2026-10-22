import { useRouter } from '@tanstack/react-router'
import {
  Ban,
  CheckCircle2,
  MoreVertical,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserRound,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  adminBanUser,
  adminCreateUser,
  adminDeleteUser,
  adminSetUserRole,
  adminUnbanUser,
} from '@/lib/apps.functions'
import { hasAdminRoleClient } from '@/lib/roles'
import type { UserRow } from '@/lib/types'
import { cn } from '@/lib/utils'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function UsersManager({ users }: { users: UserRow[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [pendingId, setPendingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return users.filter((item) => {
      const matchesTerm = term
        ? `${item.name} ${item.email}`.toLowerCase().includes(term)
        : true
      const isAdmin = hasAdminRoleClient(item.role)
      const matchesRole =
        roleFilter === 'all'
          ? true
          : roleFilter === 'admin'
            ? isAdmin
            : !isAdmin
      return matchesTerm && matchesRole
    })
  }, [users, query, roleFilter])

  async function run(
    action: () => Promise<unknown>,
    message: string,
    id: string,
  ) {
    setPendingId(id)
    try {
      await action()
      toast.success(message)
      await router.invalidate()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Não foi possível concluir.',
      )
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight lg:text-2xl">
            Usuários
          </h1>
          <p className="text-[11px] text-muted-foreground">
            {users.length} contas cadastradas
          </p>
        </div>
        <CreateUserDialog onCreated={() => router.invalidate()} />
      </div>

      <div className="flex flex-col gap-2.5 rounded-2xl border border-border/80 bg-card p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
          />
        </div>
        <div className="flex gap-1.5">
          {[
            ['all', 'Todos'],
            ['admin', 'Admins'],
            ['user', 'Usuários'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setRoleFilter(value as typeof roleFilter)}
              className={cn(
                'min-h-10 rounded-full px-3 py-2.5 text-[11px] font-semibold transition-colors',
                roleFilter === value
                  ? 'bg-brand text-brand-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
          <div className="divide-y divide-border">
            {filtered.map((item) => {
              const isAdmin = hasAdminRoleClient(item.role)
              return (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 sm:px-4',
                    pendingId === item.id && 'opacity-60',
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-full rounded-full object-cover"
                      />
                    ) : (
                      item.name.trim().charAt(0).toUpperCase()
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {item.name}
                      </p>
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-soft px-1.5 py-0.5 text-[9px] font-bold text-brand">
                          <ShieldCheck className="size-2.5" /> admin
                        </span>
                      ) : null}
                      {item.banned ? (
                        <span className="rounded-full bg-[#fdeceb] px-1.5 py-0.5 text-[9px] font-bold text-[#b0342a]">
                          bloqueado
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {item.email} · desde{' '}
                      {dateFormatter.format(new Date(item.createdAt))}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                        aria-label={`Ações de ${item.name}`}
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel className="text-[10px] text-muted-foreground">
                        Permissões
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        disabled={isAdmin}
                        onSelect={() =>
                          run(
                            () =>
                              adminSetUserRole({
                                data: { userId: item.id, role: 'admin' },
                              }),
                            'Usuário promovido a admin.',
                            item.id,
                          )
                        }
                      >
                        <ShieldCheck /> Tornar admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!isAdmin}
                        onSelect={() =>
                          run(
                            () =>
                              adminSetUserRole({
                                data: { userId: item.id, role: 'user' },
                              }),
                            'Permissão de admin removida.',
                            item.id,
                          )
                        }
                      >
                        <UserRound /> Remover admin
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {item.banned ? (
                        <DropdownMenuItem
                          onSelect={() =>
                            run(
                              () =>
                                adminUnbanUser({ data: { userId: item.id } }),
                              'Usuário desbloqueado.',
                              item.id,
                            )
                          }
                        >
                          <CheckCircle2 /> Desbloquear
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onSelect={() =>
                            run(
                              () =>
                                adminBanUser({
                                  data: {
                                    userId: item.id,
                                    banReason: 'Violação dos termos de uso',
                                  },
                                }),
                              'Usuário bloqueado.',
                              item.id,
                            )
                          }
                        >
                          <Ban /> Bloquear
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => {
                          if (
                            !window.confirm(
                              `Excluir a conta de ${item.name}? Essa ação é permanente.`,
                            )
                          ) {
                            return
                          }
                          void run(
                            () =>
                              adminDeleteUser({ data: { userId: item.id } }),
                            'Usuário excluído.',
                            item.id,
                          )
                        }}
                      >
                        <Trash2 /> Excluir conta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <Users className="size-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm font-semibold">
            Nenhum usuário encontrado
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ajuste a busca ou crie uma nova conta.
          </p>
        </div>
      )}
    </div>
  )
}

function CreateUserDialog({ onCreated }: { onCreated: () => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [pending, setPending] = useState(false)

  function reset() {
    setName('')
    setEmail('')
    setPassword('')
    setRole('user')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    try {
      await adminCreateUser({
        data: { name, email, password, role },
      })
      toast.success('Usuário criado com sucesso.')
      setOpen(false)
      reset()
      await onCreated()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Não foi possível criar.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand px-4 text-xs font-bold text-brand-foreground">
          <UserPlus className="size-4" />
          Novo usuário
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Novo usuário</DialogTitle>
          <DialogDescription className="text-xs">
            Crie uma conta manualmente e defina o nível de acesso.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-name" className="text-xs font-semibold">
              Nome
            </Label>
            <Input
              id="new-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome completo"
              required
              minLength={2}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-email" className="text-xs font-semibold">
              E-mail
            </Label>
            <Input
              id="new-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="pessoa@email.com"
              required
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs font-semibold">
              Senha inicial
            </Label>
            <Input
              id="new-password"
              type="text"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo de 8 caracteres"
              required
              minLength={8}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Permissão</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as 'user' | 'admin')}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-brand text-xs font-bold text-brand-foreground disabled:opacity-60"
          >
            <UserPlus className="size-4" />
            {pending ? 'Criando...' : 'Criar usuário'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
