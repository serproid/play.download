import { Link, useRouterState } from '@tanstack/react-router'
import { BookOpen, Gamepad2, House, LayoutGrid, Clapperboard } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/', label: 'Início', icon: House },
  { to: '/jogos', label: 'Jogos', icon: Gamepad2 },
  { to: '/apps', label: 'Apps', icon: LayoutGrid },
  { to: '/filmes', label: 'Filmes', icon: Clapperboard },
  { to: '/livros', label: 'Livros', icon: BookOpen },
] as const

export function BottomNav() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-xl"
    >
      <div className="safe-bottom mx-auto grid max-w-3xl grid-cols-5 px-1 pt-1.5 pb-1.5">
        {items.map((item) => {
          const active =
            item.to === '/'
              ? pathname === '/'
              : pathname === item.to || pathname.startsWith(`${item.to}/`)

          return (
            <Link
              key={item.to}
              to={item.to}
              search={{}}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors',
                active
                  ? 'text-brand'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon
                className={cn('size-6 transition-transform', active && 'scale-105')}
                strokeWidth={active ? 2.35 : 1.9}
              />
              <span className="leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
