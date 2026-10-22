import { createFileRoute } from '@tanstack/react-router'
import { AppRankRow, AppTile } from '@/components/store/app-cards'
import { SearchField } from '@/components/store/search-field'
import { SectionHeader } from '@/components/store/section'
import { getHomeData } from '@/lib/apps.functions'

export const Route = createFileRoute('/_store/')({
  loader: async () => getHomeData(),
  component: HomePage,
})

function HomePage() {
  const data = Route.useLoaderData()

  return (
    <div className="space-y-7 py-2">
      <div className="space-y-4">
        <h1 className="text-[22px] font-normal text-foreground">
          Apps e jogos
        </h1>
        <SearchField action="/buscar" />
      </div>

      {data.featured.length > 0 ? (
        <section>
          <SectionHeader title="Destaques" />
          <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-2">
            {data.featured.map((app) => (
              <AppTile key={app.id} app={app} />
            ))}
          </div>
        </section>
      ) : null}

      {data.popular.length > 0 ? (
        <section>
          <SectionHeader title="Mais baixados" to="/apps" />
          <div className="divide-y divide-border">
            {data.popular.map((app, index) => (
              <AppRankRow key={app.id} app={app} rank={index + 1} />
            ))}
          </div>
        </section>
      ) : null}

      {data.byType.game.length > 0 ? (
        <section>
          <SectionHeader title="Jogos" to="/jogos" />
          <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-2">
            {data.byType.game.slice(0, 8).map((app) => (
              <AppTile key={app.id} app={app} />
            ))}
          </div>
        </section>
      ) : null}

      {data.byType.app.length > 0 ? (
        <section>
          <SectionHeader title="Apps" to="/apps" />
          <div className="divide-y divide-border">
            {data.byType.app.slice(0, 6).map((app) => (
              <AppRankRow key={app.id} app={app} />
            ))}
          </div>
        </section>
      ) : null}

      {data.recent.length > 0 ? (
        <section>
          <SectionHeader title="Novidades" />
          <div className="divide-y divide-border">
            {data.recent.slice(0, 6).map((app) => (
              <AppRankRow key={app.id} app={app} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
