import { Link } from '@tanstack/react-router'
import {
  BookOpen,
  Clapperboard,
  Gamepad2,
  LayoutGrid,
  PackageOpen,
  PlusCircle,
} from 'lucide-react'
import type { CatalogApp } from '@/lib/types'
import type { AppType } from '@/lib/db/schema'
import { AppGridCard } from '@/components/store/app-cards'
import { SearchField } from '@/components/store/search-field'
import { EmptyState } from '@/components/store/section'
import { cn } from '@/lib/utils'

type CatalogCategory = {
  id: string
  name: string
  slug: string
  type: AppType | null
}

const meta: Record<
  AppType,
  {
    title: string
    subtitle: string
    icon: typeof LayoutGrid
    tone: string
    to: '/jogos' | '/apps' | '/filmes' | '/livros'
  }
> = {
  game: {
    title: 'Jogos',
    subtitle: 'Ação, aventura e diversão para todos os estilos',
    icon: Gamepad2,
    tone: 'bg-[#eef7f1] text-[#0d8a4f]',
    to: '/jogos',
  },
  app: {
    title: 'Apps',
    subtitle: 'Ferramentas e aplicativos para o seu dia a dia',
    icon: LayoutGrid,
    tone: 'bg-[#eef1fb] text-[#4a63c8]',
    to: '/apps',
  },
  movie: {
    title: 'Filmes',
    subtitle: 'Lançamentos e clássicos para assistir quando quiser',
    icon: Clapperboard,
    tone: 'bg-[#fdf1ee] text-[#c25a3c]',
    to: '/filmes',
  },
  book: {
    title: 'Livros',
    subtitle: 'Leituras para aprender, sonhar e se inspirar',
    icon: BookOpen,
    tone: 'bg-[#fbf5e8] text-[#a97a19]',
    to: '/livros',
  },
}

export function CatalogPage({
  type,
  apps,
  categories,
  query,
  category,
}: {
  type: AppType
  apps: CatalogApp[]
  categories: CatalogCategory[]
  query?: string
  category?: string
}) {
  const config = meta[type]
  const Icon = config.icon
  const relevantCategories = categories.filter(
    (item) => item.type === null || item.type === type,
  )

  return (
    <div className="space-y-5 animate-rise-in">
      <header className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-2xl',
            config.tone,
          )}
        >
          <Icon className="size-[22px]" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {config.title}
          </h1>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            {config.subtitle}
          </p>
        </div>
      </header>

      <SearchField
        action={config.to}
        defaultValue={query}
        category={category}
        placeholder={`Buscar em ${config.title.toLowerCase()}`}
      />

      {relevantCategories.length > 0 ? (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5">
          <Link
            to={config.to}
            search={{ q: query || undefined, category: undefined }}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
              !category
                ? 'border-brand bg-brand text-brand-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            Todos
          </Link>
          {relevantCategories.map((item) => {
            const active = category === item.slug
            return (
              <Link
                key={item.id}
                to={config.to}
                search={{
                  q: query || undefined,
                  category: active ? undefined : item.slug,
                }}
                className={cn(
                  'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                  active
                    ? 'border-brand bg-brand text-brand-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          {apps.length} {apps.length === 1 ? 'resultado' : 'resultados'}
          {query ? ` para “${query}”` : ''}
        </p>
      </div>

      {apps.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {apps.map((app) => (
            <AppGridCard key={app.id} app={app} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<PackageOpen className="size-6" />}
          title="Nada por aqui ainda"
          description={
            query
              ? 'Não encontramos resultados para essa busca. Tente outro termo ou explore as categorias.'
              : 'Ainda não há publicações nesta categoria. Seja a primeira pessoa a enviar!'
          }
        >
          <Link
            to="/adicionar"
            className="inline-flex h-9 items-center gap-2 rounded-full bg-brand px-4 text-xs font-bold text-brand-foreground"
          >
            <PlusCircle className="size-4" />
            Adicionar app
          </Link>
        </EmptyState>
      )}
    </div>
  )
}
