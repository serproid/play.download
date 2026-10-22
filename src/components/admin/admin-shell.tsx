import { Link, useRouter, useRouterState } from '@tanstack/react-router'
import {
  AppWindow,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { BrandLogo } from '@/components/brand-logo'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { authClient } from '@/lib/auth-client'
import type { SessionUser } from '@/lib/types'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/admin', label: 'Visão geral', icon: LayoutDashboard, exact: true },
  { to: '/admin/apps', label: 'Apps', icon: AppWindow, exact: false },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users, exact: false },
] as const

function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = item.exact
          ? pathname === item.to
          : pathname === item.to || pathname.startsWith(`${item.to}/`)
        return (
          <Link
            key={item.to}
            to={item.to}
            search={{}}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-brand-soft text-brand'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <item.icon className="size-[18px]" strokeWidth={active ? 2.3 : 2} />
            {item.label}
          </Link>
        )
      })}
      <Link
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ExternalLink className="size-[18px]" />
        Ver site
      </Link>
    </nav>
  )
}

function UserFooter({ user }: { user: SessionUser }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function signOut() {
    setPending(true)
    try {
      await authClient.signOut()
      await router.invalidate()
      await router.navigate({ to: '/' })
      toast.success('Sessão encerrada.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-2.5">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-foreground">
          {user.name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground">
            {user.name}
          </p>
          <p className="truncate text-[10px] text-muted-foreground">
            {user.email}
          </p>
        </div>
        <button
          onClick={signOut}
          disabled={pending}
          aria-label="Sair"
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive disabled:opacity-50"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function AdminShell({
  user,
  children,
}: {
  user: SessionUser
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh bg-[#f5f7f6]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <BrandLogo />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Administração
          </p>
          <AdminNav />
        </div>
        <div className="border-t border-border p-3">
          <UserFooter user={user} />
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="inline-flex size-9 items-center justify-center rounded-full hover:bg-accent"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Menu administrativo</SheetTitle>
            <div className="flex h-16 items-center border-b border-border px-5">
              <BrandLogo />
            </div>
            <div className="p-3">
              <AdminNav />
            </div>
            <div className="mt-auto border-t border-border p-3">
              <UserFooter user={user} />
            </div>
          </SheetContent>
        </Sheet>
        <p className="text-sm font-semibold text-foreground">Admin</p>
        <span className="flex size-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-foreground">
          {user.name.trim().charAt(0).toUpperCase()}
        </span>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
