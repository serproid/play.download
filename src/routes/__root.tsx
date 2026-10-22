import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { PackageOpen } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/seo'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content:
          'width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5',
      },
      {
        title: 'Play Store — a página do seu app',
      },
      {
        name: 'description',
        content:
          'Crie a página do seu app e receba um link exclusivo para divulgar. Cada app tem seu próprio espaço, isolado e personalizado.',
      },
      { name: 'theme-color', content: '#01875f' },
      { property: 'og:title', content: SITE_NAME },
      {
        property: 'og:description',
        content: 'A página do seu app, com link exclusivo para divulgar.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:locale', content: 'pt_BR' },
      { property: 'og:image', content: DEFAULT_OG_IMAGE },
      { property: 'og:image:alt', content: 'Play Store — a página do seu app' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: SITE_NAME },
      {
        name: 'twitter:description',
        content: 'A página do seu app, com link exclusivo para divulgar.',
      },
      { name: 'twitter:image', content: DEFAULT_OG_IMAGE },
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: RootNotFound,
  errorComponent: RootError,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster richColors position="top-center" />
        <Scripts />
      </body>
    </html>
  )
}

function RootNotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <PackageOpen className="size-6" />
      </div>
      <h1 className="mt-4 text-xl font-medium tracking-tight text-foreground">
        Página não encontrada
      </h1>
      <p className="mt-1 max-w-xs text-sm leading-6 text-muted-foreground">
        O endereço que você tentou acessar não existe ou foi movido.
      </p>
      <Link
        to="/"
        className="mt-4 rounded-full bg-brand px-5 py-2 text-[13px] font-medium text-brand-foreground"
      >
        Voltar para o início
      </Link>
    </div>
  )
}

function RootError({ error }: { error: unknown }) {
  const message =
    error instanceof Error
      ? error.message
      : 'Ocorreu um erro inesperado. Tente novamente.'

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <PackageOpen className="size-6" />
      </div>
      <h1 className="mt-4 text-xl font-medium tracking-tight text-foreground">
        Algo deu errado
      </h1>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
        {message}
      </p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => window.location.reload()}
          className="rounded-full bg-brand px-5 py-2 text-[13px] font-medium text-brand-foreground"
        >
          Tentar novamente
        </button>
        <a
          href="/"
          className="rounded-full border border-border bg-card px-5 py-2 text-[13px] font-medium text-foreground"
        >
          Início
        </a>
      </div>
    </div>
  )
}
