import { Link, useRouterState } from '@tanstack/react-router'
import { BookOpen, Clapperboard, Gamepad2, House, LayoutGrid } from 'lucide-react'
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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background"
    >
      <div className="safe-bottom mx-auto grid grid-cols-5">
        {items.map((item) => {
          const active =
            item.to === '/'
              ? pathname === '/'
              : pathname === item.to ||
                pathname.startsWith(`${item.to}/`) ||
                (item.to === '/apps' && pathname.startsWith('/app/'))

          return (
            <Link
              key={item.to}
              to={item.to}
              search={{ q: undefined, category: undefined }}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                active ? 'text-brand' : 'text-[#5f6368] dark:text-[#9aa0a6]',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon className="size-[23px]" strokeWidth={active ? 2.2 : 1.8} />
              <span className="leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
