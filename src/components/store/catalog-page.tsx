import { Link } from '@tanstack/react-router'
import type { CatalogApp } from '@/lib/types'
import type { AppType } from '@/lib/db/schema'
import { AppRankRow } from '@/components/store/app-cards'
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
    to: '/jogos' | '/apps' | '/filmes' | '/livros'
  }
> = {
  game: { title: 'Jogos', to: '/jogos' },
  app: { title: 'Apps', to: '/apps' },
  movie: { title: 'Filmes', to: '/filmes' },
  book: { title: 'Livros', to: '/livros' },
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
  const relevantCategories = categories.filter(
    (item) => item.type === null || item.type === type,
  )

  return (
    <div className="space-y-4 py-2">
      <h1 className="text-[22px] font-normal text-foreground">{config.title}</h1>

      <SearchField
        action={config.to}
        defaultValue={query}
        category={category}
        placeholder={`Pesquisar em ${config.title.toLowerCase()}`}
      />

      {relevantCategories.length > 0 ? (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <Link
            to={config.to}
            search={{ q: query || undefined, category: undefined }}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium',
              !category
                ? 'border-brand/30 bg-brand-soft text-brand'
                : 'border-border text-[#5f6368] dark:text-[#9aa0a6]',
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
                  'shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium',
                  active
                    ? 'border-brand/30 bg-brand-soft text-brand'
                    : 'border-border text-[#5f6368] dark:text-[#9aa0a6]',
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </div>
      ) : null}

      <p className="text-[13px] text-[#5f6368] dark:text-[#9aa0a6]">
        {apps.length} {apps.length === 1 ? 'resultado' : 'resultados'}
        {query ? ` para “${query}”` : ''}
      </p>

      {apps.length > 0 ? (
        <div className="divide-y divide-border">
          {apps.map((app) => (
            <AppRankRow key={app.id} app={app} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum resultado"
          description={
            query
              ? 'Tente outra busca ou navegue pelas categorias acima.'
              : 'Ainda não há publicações nesta categoria.'
          }
        />
      )}
    </div>
  )
}
