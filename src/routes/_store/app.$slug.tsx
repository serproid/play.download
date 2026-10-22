import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import {
  CalendarDays,
  ChevronRight,
  Download,
  Info,
  ThumbsUp,
} from 'lucide-react'
import { AppIcon } from '@/components/store/app-icon'
import {
  DeviceNote,
  InstallButton,
  ShareButton,
  WishlistButton,
} from '@/components/store/app-actions'
import { ReviewForm } from '@/components/store/review-form'
import { Stars } from '@/components/store/stars'
import { getAppDetail } from '@/lib/apps.functions'
import type { AppDetail } from '@/lib/types'
import { cn, formatCount } from '@/lib/utils'

export const Route = createFileRoute('/_store/app/$slug')({
  loader: async ({ params }) => {
    const app = await getAppDetail({ data: { slug: params.slug } })
    if (!app) throw notFound()
    return app
  },
  notFoundComponent: AppNotFound,
  component: AppDetailPage,
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const avatarPalettes = [
  'bg-[#e91e63]',
  'bg-[#2196f3]',
  'bg-[#ff9800]',
  'bg-[#8e24aa]',
  'bg-[#00897b]',
  'bg-[#5c6bc0]',
]

function avatarTone(name: string) {
  let hash = 0
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 17 + name.charCodeAt(index)) % 997
  }
  return avatarPalettes[hash % avatarPalettes.length]
}

function ageBox(ageRating: string | null) {
  if (!ageRating || ageRating.toLowerCase() === 'livre') return 'L'
  return ageRating.replace(/\D/g, '') || 'L'
}

function AppDetailPage() {
  const app: AppDetail = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  const totalReviews = app.reviewCount || app.reviews.length
  const distributionTotal =
    [1, 2, 3, 4, 5].reduce((sum, star) => sum + app.distribution[star as 1 | 2 | 3 | 4 | 5], 0) || 1

  const infoRows: Array<[string, React.ReactNode]> = [
    ['Atualizado em', dateFormatter.format(new Date(app.updatedAt))],
    ['Tamanho', app.size ?? 'Varia por dispositivo'],
    ['Downloads', `${formatCount(app.downloads)}+`],
    ['Versão atual', app.version ?? '1.0'],
    ['Android necessário', app.requirements ?? 'Android 8.0 ou superior'],
    ['Desenvolvedor', <span className="text-brand">{app.developer ?? 'Comunidade'}</span>],
    ['Categoria', app.categoryName ?? 'Geral'],
    ['Classificação', app.ageRating ?? 'Livre'],
  ]

  return (
    <article className="animate-rise-in">
      <header className="flex items-start gap-4 sm:gap-5">
        <AppIcon
          name={app.name}
          iconUrl={app.iconUrl}
          size="lg"
          className="sm:size-28"
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <h1 className="text-[25px] leading-tight font-extrabold tracking-tight text-foreground sm:text-3xl">
            {app.name}
          </h1>
          <p className="mt-1 text-sm font-semibold text-brand">
            {app.developer ?? 'Comunidade Play Download'}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground sm:text-sm">
            {app.tagline}
          </p>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-3 divide-x divide-border border-y border-border py-3">
        <div className="flex flex-col items-center justify-center px-1 text-center">
          <span className="flex items-center gap-1 text-lg font-bold text-foreground">
            {app.rating.toFixed(1)}
            <span className="text-[#f5b301]">★</span>
          </span>
          <span className="mt-0.5 text-[10px] text-muted-foreground sm:text-[11px]">
            {formatCount(totalReviews)} avaliações
          </span>
        </div>
        <div className="flex flex-col items-center justify-center px-1 text-center">
          <span className="flex size-7 items-center justify-center rounded-md bg-brand text-xs font-bold text-brand-foreground">
            {ageBox(app.ageRating)}
          </span>
          <span className="mt-1 flex items-center gap-0.5 text-[10px] text-muted-foreground sm:text-[11px]">
            Classificação {app.ageRating?.toLowerCase() === 'livre' ? 'Livre' : 'indicativa'}
            <Info className="size-2.5 opacity-70" />
          </span>
        </div>
        <div className="flex flex-col items-center justify-center px-1 text-center">
          <span className="flex items-center gap-1 text-lg font-bold text-foreground">
            <Download className="size-4 text-muted-foreground" />
            {formatCount(app.downloads)}+
          </span>
          <span className="mt-0.5 text-[10px] text-muted-foreground sm:text-[11px]">
            downloads
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        <InstallButton app={app} />
        <div className="flex flex-wrap items-center justify-center gap-1">
          <ShareButton app={app} />
          <WishlistButton app={app} user={user} />
        </div>
        <DeviceNote />
      </div>

      {app.screenshots.length > 0 ? (
        <section className="mt-6 border-t border-border pt-5">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Capturas de tela
          </h2>
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2.5 overflow-x-auto px-4">
            {app.screenshots.map((url) => (
              <img
                key={url}
                src={url}
                alt={`Captura de tela de ${app.name}`}
                loading="lazy"
                className="h-56 shrink-0 rounded-2xl border border-border object-cover shadow-sm"
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-6 border-t border-border pt-5">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Avaliações e comentários
        </h2>

        <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-5 sm:gap-10">
          <div className="text-center">
            <p className="text-5xl leading-none font-light tracking-tight text-foreground">
              {app.rating.toFixed(1)}
            </p>
            <Stars value={app.rating} size={16} className="mt-1.5" />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {formatCount(totalReviews)} avaliações
            </p>
          </div>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count =
                app.distribution[star as 1 | 2 | 3 | 4 | 5] ?? 0
              const percent = Math.min(100, Math.round((count / distributionTotal) * 100))
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-2 shrink-0 text-[11px] text-muted-foreground">
                    {star}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-brand transition-[width]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-4">
          <ReviewForm app={app} user={user} />
        </div>

        {app.reviews.length > 0 ? (
          <div className="mt-2 divide-y divide-border">
            {app.reviews.map((review) => (
              <div key={review.id} className="py-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white',
                      avatarTone(review.userName),
                    )}
                  >
                    {review.userImage ? (
                      <img
                        src={review.userImage}
                        alt={review.userName}
                        className="size-full rounded-full object-cover"
                      />
                    ) : (
                      review.userName.charAt(0).toUpperCase()
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {review.userName}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Stars value={review.rating} size={12} />
                      <span className="text-[11px] text-muted-foreground">
                        {dateFormatter.format(new Date(review.createdAt))}
                      </span>
                    </div>
                  </div>
                </div>
                {review.comment ? (
                  <p className="mt-2 text-[13px] leading-5 text-foreground/85">
                    {review.comment}
                  </p>
                ) : null}
                <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <ThumbsUp className="size-3" />
                  {review.helpfulCount} pessoas acharam isso útil
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-2xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
            Ainda não há avaliações. Seja a primeira pessoa a avaliar!
          </p>
        )}
      </section>

      <section className="mt-6 border-t border-border pt-5">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Informações do aplicativo
        </h2>
        <dl className="mt-1.5 divide-y divide-border/80">
          {infoRows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-6 py-2.5"
            >
              <dt className="text-[13px] text-muted-foreground">{label}</dt>
              <dd className="text-right text-[13px] font-medium text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 border-t border-border pt-5">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Sobre este app
        </h2>
        <div className="mt-2 space-y-3 text-[13px] leading-6 whitespace-pre-line text-foreground/80">
          {app.description ?? app.tagline ?? 'Sem descrição disponível.'}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-4" />
            Atualizado em {dateFormatter.format(new Date(app.updatedAt))}
          </div>
          <Link
            to="/buscar"
            search={{ q: app.categoryName ?? undefined }}
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand"
          >
            Mais como este
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </section>
    </article>
  )
}

function AppNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <Info className="size-6" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-foreground">
        Aplicativo não encontrado
      </h1>
      <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
        Este título pode ter sido removido ou ainda não foi publicado.
      </p>
      <Link
        to="/"
        className="mt-4 rounded-full bg-brand px-5 py-2 text-xs font-bold text-brand-foreground"
      >
        Voltar para o início
      </Link>
    </div>
  )
}
