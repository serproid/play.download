import { Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { BottomNav } from '@/components/store/bottom-nav'

export function StoreShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex h-14 w-full max-w-[820px] items-center justify-between px-4">
          <BrandLogo />
          <div className="flex items-center gap-1">
            <Link
              to="/buscar"
              search={{ q: undefined }}
              className="inline-flex size-10 items-center justify-center rounded-full text-[#5f6368] hover:bg-muted dark:text-[#9aa0a6]"
              aria-label="Pesquisar"
            >
              <Search className="size-[22px]" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[820px] flex-1 px-4 pt-3 pb-24 sm:px-6">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
