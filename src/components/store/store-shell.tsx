import { CircleHelp, Search } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { NavigationProgress } from '@/components/navigation-progress'
import type { SessionUser } from '@/lib/types'

export function StoreShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: SessionUser | null
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <NavigationProgress />
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex h-14 w-full max-w-[820px] items-center justify-between px-4">
          <BrandLogo />
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span
              aria-hidden
              className="inline-flex size-8 items-center justify-center text-[#5f6368] dark:text-[#9aa0a6]"
            >
              <Search className="size-[22px]" strokeWidth={2} />
            </span>
            <span
              aria-hidden
              className="inline-flex size-8 items-center justify-center text-[#5f6368] dark:text-[#9aa0a6]"
            >
              <CircleHelp className="size-[22px]" strokeWidth={2} />
            </span>
            <span
              aria-hidden
              className="flex size-8 items-center justify-center rounded-full bg-[#c2185b] text-sm font-medium text-white"
            >
              {user?.name?.trim().charAt(0).toUpperCase() || 'G'}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[820px] flex-1 px-4 pt-3 pb-12 sm:px-6">
        {children}
      </main>
    </div>
  )
}
