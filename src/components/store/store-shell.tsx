import { Link } from '@tanstack/react-router'
import { Plus, Search } from 'lucide-react'
import type { SessionUser } from '@/lib/types'
import { BrandLogo } from '@/components/brand-logo'
import { BottomNav } from '@/components/store/bottom-nav'
import { AuthMenu } from '@/components/store/auth-menu'

export function StoreShell({
  user,
  children,
}: {
  user: SessionUser | null
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
          <BrandLogo />
          <div className="flex items-center gap-1.5">
            <Link
              to="/buscar"
              search={{ q: undefined }}
              className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Buscar"
            >
              <Search className="size-[21px]" />
            </Link>
            <Link
              to="/adicionar"
              className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Adicionar app"
            >
              <Plus className="size-[22px]" />
            </Link>
            <AuthMenu user={user} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-4 pb-28 sm:px-6">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
