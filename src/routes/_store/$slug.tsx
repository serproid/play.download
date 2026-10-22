import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Info, Star, ThumbsUp } from 'lucide-react'
import { AppIcon } from '@/components/store/app-icon'
import { DeviceNote, InstallButton } from '@/components/store/app-actions'
import { Stars } from '@/components/store/stars'
import { getAppDetail } from '@/lib/apps.functions'
import type { AppDetail } from '@/lib/types'
import { cn, formatCount } from '@/lib/utils'

export const Route = createFileRoute('/_store/$slug')({
  loader: async ({ params }) => {
    const app = await getAppDetail({ data: { slug: params.slug } })
    if (!app) throw notFound()
    return app
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: 'Play Store' }] }
    }

    const description =
      loaderData.tagline ??
      loaderData.description ??
      `Baixe ${loaderData.name} e confira todos os detalhes.`

    const meta: Array<Record<string, string>> = [
      { title: `${loaderData.name} — Play Store` },
      { name: 'description', content: description },
      { property: 'og:title', content: loaderData.name },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
    ]

    if (loaderData.iconUrl) {
      meta.push({ property: 'og:image', content: loaderData.iconUrl })
    }

    return { meta }
  },
  notFoundComponent: AppNotFound,
  component: AppDetailPage,
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const avatarColors: Record<string, string> = {
  A: 'bg-[#e91e63]',
  B: 'bg-[#9c27b0]',
  C: 'bg-[#3f51b5]',
  D: 'bg-[#2196f3]',
  E: 'bg-[#009688]',
  F: 'bg-[#e91e63]',
  G: 'bg-[#ff9800]',
  H: 'bg-[#795548]',
  I: 'bg-[#607d8b]',
  J: 'bg-[#f44336]',
  K: 'bg-[#673ab7]',
  L: 'bg-[#2196f3]',
  M: 'bg-[#009688]',
  N: 'bg-[#8bc34a]',
  O: 'bg-[#ff5722]',
  P: 'bg-[#03a9f4]',
  Q: 'bg-[#9c27b0]',
  R: 'bg-[#4caf50]',
  S: 'bg-[#ff9800]',
  T: 'bg-[#00bcd4]',
  U: 'bg-[#3f51b5]',
  V: 'bg-[#e91e63]',
  W: 'bg-[#009688]',
  X: 'bg-[#795548]',
  Y: 'bg-[#ffc107]',
  Z: 'bg-[#607d8b]',
}

function avatarColor(name: string) {
  return avatarColors[name.charAt(0).toUpperCase()] ?? 'bg-[#5f6368]'
}

function ageBox(ageRating: string | null) {
  if (!ageRating || ageRating.toLowerCase() === 'livre') return 'L'
  return ageRating.replace(/\D/g, '') || 'L'
}

function ratingLabel(value: number) {
  return value.toFixed(1).replace('.', ',')
}

function AppDetailPage() {
  const app: AppDetail = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  const isOwner = Boolean(user && app.submittedBy === user.id)
  const isPending = app.status !== 'published'
  const totalReviews = app.reviewCount || app.reviews.length
  const counts = [1, 2, 3, 4, 5].map(
    (star) => app.distribution[star as 1 | 2 | 3 | 4 | 5] ?? 0,
  )
  const maxCount = Math.max(...counts, 1)

  const infoRows: Array<[string, React.ReactNode]> = [
    ['Atualizado em', dateFormatter.format(new Date(app.updatedAt))],
    ['Tamanho', app.size ?? 'Varia por dispositivo'],
    ['Downloads', `${formatCount(app.downloads)}+`],
    ['Versão atual', app.version ?? '1.0'],
    ['Android necessário', app.requirements ?? 'Android 8.0 ou superior'],
    [
      'Desenvolvedor',
      <span className="font-medium text-brand">
        {app.developer ?? 'Comunidade'}
      </span>,
    ],
    ['Categoria', app.categoryName ?? 'Geral'],
  ]

  return (
    <article className="py-4">
      <header className="flex items-start gap-4 sm:gap-5">
        <AppIcon
          name={app.name}
          iconUrl={app.iconUrl}
          size="lg"
          priority
          className="size-20 rounded-[18px] sm:size-24 sm:rounded-[20px]"
        />
        <div className="min-w-0 flex-1 pt-1">
          <h1 className="text-[26px] leading-tight font-medium tracking-tight text-foreground sm:text-[30px]">
            {app.name}
          </h1>
          <p className="mt-1 text-sm font-medium text-brand">
            {app.developer ?? 'Comunidade'}
          </p>
        </div>
      </header>

      {isOwner ? (
        <p className="mt-4 text-xs text-muted-foreground">
          {isPending
            ? 'Sua página está em análise.'
            : 'Sua página está publicada.'}
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-3 divide-x divide-border border-y border-border">
        <div className="flex flex-col items-center justify-center px-2 py-4 text-center">
          <span className="flex items-center gap-1 text-[18px] font-medium tabular-nums text-foreground">
            {ratingLabel(app.rating)}
            <Star className="size-3.5 fill-[#fbbc04] text-[#fbbc04]" />
          </span>
          <span className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
            {formatCount(totalReviews)} avaliações
          </span>
        </div>
        <div className="flex flex-col items-center justify-center px-2 py-4 text-center">
          <span className="flex size-6 items-center justify-center rounded bg-brand text-[11px] font-medium text-white">
            {ageBox(app.ageRating)}
          </span>
          <span className="mt-1 flex items-center gap-0.5 text-[11px] text-muted-foreground sm:text-xs">
            Classificação{' '}
            {app.ageRating?.toLowerCase() === 'livre' ? 'Livre' : 'indicativa'}
            <Info className="size-3" />
          </span>
        </div>
        <div className="flex flex-col items-center justify-center px-2 py-4 text-center">
          <span className="text-[18px] font-medium tabular-nums text-foreground">
            {formatCount(app.downloads)}+
          </span>
          <span className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
            downloads
          </span>
        </div>
      </div>

      <div className="mt-6">
        <InstallButton app={app} />
        <div className="mt-3">
          <DeviceNote />
        </div>
      </div>

      <section className="mt-6 border-t border-border pt-6">
        <h2 className="text-lg font-medium tracking-tight text-foreground">
          Avaliações e comentários
        </h2>

        <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-8 sm:gap-14">
          <div>
            <p className="text-[48px] leading-none font-medium tracking-tight tabular-nums text-foreground">
              {ratingLabel(app.rating)}
            </p>
            <Stars value={app.rating} size={20} className="mt-1" />
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCount(totalReviews)} avaliações
            </p>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = app.distribution[star as 1 | 2 | 3 | 4 | 5] ?? 0
              const percent = Math.round((count / maxCount) * 100)
              return (
                <div key={star} className="flex items-center gap-4">
                  <span className="w-2 text-right text-xs tabular-nums text-muted-foreground">
                    {star}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e8eaed] dark:bg-[#3c4043]">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {app.reviews.length > 0 ? (
          <div className="mt-4 divide-y divide-border border-t border-border">
            {app.reviews.map((review) => (
              <div key={review.id} className="py-5">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex size-11 shrink-0 items-center justify-center rounded-full text-base font-medium text-white',
                      avatarColor(review.userName),
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
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {review.userName}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pl-14">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars value={review.rating} size={14} />
                    <span className="text-xs text-muted-foreground">
                      {dateFormatter.format(new Date(review.createdAt))}
                    </span>
                  </div>
                  {review.comment ? (
                    <p className="mt-2 text-sm leading-5 text-foreground">
                      {review.comment}
                    </p>
                  ) : null}
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <ThumbsUp className="size-3" />
                    {review.helpfulCount} pessoas acharam isso útil
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            Ainda não há avaliações.
          </p>
        )}
      </section>

      <section className="mt-6 border-t border-border pt-6">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          Informações do aplicativo
        </h2>
        <dl className="mt-2">
          {infoRows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-6 py-3"
            >
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="text-right text-sm tabular-nums text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 border-t border-border pt-6">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          Sobre este app
        </h2>
        <p className="mt-3 text-sm leading-6 whitespace-pre-line text-foreground">
          {app.description ?? app.tagline ?? 'Sem descrição disponível.'}
        </p>
      </section>
    </article>
  )
}

function AppNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <Info className="size-8 text-muted-foreground" />
      <h1 className="mt-3 text-lg font-medium tracking-tight text-foreground">
        Aplicativo não encontrado
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Este título pode ter sido removido.
      </p>
      <Link
        to="/"
        className="mt-4 rounded-full bg-brand px-5 py-2 text-sm font-medium text-white"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
