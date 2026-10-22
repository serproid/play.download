import { BrandLogo } from '@/components/brand-logo'

export function StoreShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex h-14 w-full max-w-[820px] items-center justify-between px-4">
          <BrandLogo />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[820px] flex-1 px-4 pt-3 pb-12 sm:px-6">
        {children}
      </main>
    </div>
  )
}
