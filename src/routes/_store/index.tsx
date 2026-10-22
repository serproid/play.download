import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BookOpen,
  Clapperboard,
  Download,
  Gamepad2,
  LayoutGrid,
  PlusCircle,
  Sparkles,
} from 'lucide-react'
import { AppIcon } from '@/components/store/app-icon'
import { AppRankRow, AppTile } from '@/components/store/app-cards'
import { SearchField } from '@/components/store/search-field'
import { SectionHeader } from '@/components/store/section'
import { Stars } from '@/components/store/stars'
import { getHomeData } from '@/lib/apps.functions'
import { formatCount } from '@/lib/utils'

export const Route = createFileRoute('/_store/')({
  loader: async () => getHomeData(),
  component: HomePage,
})

const quickLinks = [
  { to: '/jogos', label: 'Jogos', icon: Gamepad2, tone: 'bg-[#eef7f1] text-[#0d8a4f]' },
  { to: '/apps', label: 'Apps', icon: LayoutGrid, tone: 'bg-[#eef1fb] text-[#4a63c8]' },
  { to: '/filmes', label: 'Filmes', icon: Clapperboard, tone: 'bg-[#fdf1ee] text-[#c25a3c]' },
  { to: '/livros', label: 'Livros', icon: BookOpen, tone: 'bg-[#fbf5e8] text-[#a97a19]' },
] as const

function HomePage() {
  const data = Route.useLoaderData()
  const hero = data.featured[0] ?? data.popular[0] ?? null

  return (
    <div className="space-y-7 animate-rise-in">
      <section>
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">
          Play Download
        </p>
        <h1 className="mt-1 text-[26px] leading-[1.15] font-extrabold tracking-tight text-foreground">
          O que você quer
          <br />
          baixar hoje?
        </h1>
        <SearchField action="/buscar" className="mt-4" />
      </section>

      <section className="grid grid-cols-4 gap-2">
        {quickLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            search={{ q: undefined, category: undefined }}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/70 bg-card py-3 text-center shadow-[0_1px_2px_rgba(16,24,20,0.04)] transition-transform hover:-translate-y-0.5"
          >
            <span className={`flex size-9 items-center justify-center rounded-xl ${item.tone}`}>
              <item.icon className="size-[19px]" strokeWidth={2} />
            </span>
            <span className="text-[11px] font-semibold text-foreground">
              {item.label}
            </span>
          </Link>
        ))}
      </section>

      {hero ? (
        <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#0f9557] via-[#0b7d48] to-[#075b34] p-5 text-white shadow-[0_18px_40px_-24px_rgba(6,84,47,0.8)]">
          <div className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-12 size-52 rounded-full bg-black/10 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <AppIcon
              name={hero.name}
              iconUrl={hero.iconUrl}
              size="lg"
              className="ring-2 ring-white/20"
            />
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase backdrop-blur">
                <Sparkles className="size-3" />
                Destaque
              </span>
              <h2 className="mt-1.5 line-clamp-1 text-xl font-extrabold tracking-tight">
                {hero.name}
              </h2>
              <p className="line-clamp-2 text-[13px] leading-5 text-white/80">
                {hero.tagline ?? hero.categoryName}
              </p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-white/85">
                <Stars value={hero.rating} size={12} />
                <span>{hero.rating.toFixed(1)}</span>
                <span className="text-white/40">•</span>
                <span className="inline-flex items-center gap-1">
                  <Download className="size-3" />
                  {formatCount(hero.downloads)}
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/app/$slug"
            params={{ slug: hero.slug }}
            className="relative mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-bold text-[#0a6b3d] shadow-sm transition-transform hover:scale-[1.01]"
          >
            Ver aplicativo
            <ArrowRight className="size-4" />
          </Link>
        </section>
      ) : null}

      {data.featured.length > 1 ? (
        <section>
          <SectionHeader
            title="Destaques da semana"
            description="Escolhidos pela nossa equipe"
          />
          <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-2">
            {data.featured.slice(1).map((app) => (
              <AppTile key={app.id} app={app} />
            ))}
          </div>
        </section>
      ) : null}

      {data.popular.length > 0 ? (
        <section>
          <SectionHeader
            title="Mais baixados"
            description="O que todo mundo está usando"
          />
          <div className="rounded-2xl border border-border/70 bg-card px-2 py-1 shadow-[0_1px_2px_rgba(16,24,20,0.04)]">
            {data.popular.map((app, index) => (
              <div key={app.id}>
                <AppRankRow app={app} rank={index + 1} />
                {index < data.popular.length - 1 ? (
                  <div className="ml-11 border-b border-border/60" />
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {data.byType.game.length > 0 ? (
        <section>
          <SectionHeader title="Jogos em alta" to="/jogos" />
          <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-2">
            {data.byType.game.slice(0, 6).map((app) => (
              <AppTile key={app.id} app={app} />
            ))}
          </div>
        </section>
      ) : null}

      {data.byType.app.length > 0 ? (
        <section>
          <SectionHeader title="Apps para o seu dia" to="/apps" />
          <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-2">
            {data.byType.app.slice(0, 6).map((app) => (
              <AppTile key={app.id} app={app} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeader title="Novidades" description="Adicionados recentemente" />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {data.recent.slice(0, 6).map((app) => (
            <AppRankRow key={app.id} app={app} />
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[24px] border border-brand/15 bg-brand-soft p-5">
        <div className="pointer-events-none absolute -right-6 -bottom-8 size-32 rounded-full border-[18px] border-brand/10" />
        <h2 className="text-base font-bold text-foreground">
          Tem um app para compartilhar?
        </h2>
        <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
          Envie o seu aplicativo, jogo, filme ou livro. Nossa equipe revisa e
          publica para toda a comunidade.
        </p>
        <Link
          to="/adicionar"
          className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-brand px-4 text-xs font-bold text-brand-foreground shadow-sm transition-transform hover:scale-[1.02]"
        >
          <PlusCircle className="size-4" />
          Adicionar meu app
        </Link>
      </section>

      <p className="pb-2 text-center text-[10px] text-muted-foreground">
        Baixapp © {new Date().getFullYear()} — todos os seus apps em um só lugar.
      </p>
    </div>
  )
}
