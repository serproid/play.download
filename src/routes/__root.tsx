import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { PackageOpen } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
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
        title: 'Play Download — apps, jogos, filmes e livros',
      },
      {
        name: 'description',
        content:
          'Baixe apps, jogos, filmes e livros em um só lugar. Descubra, avalie e compartilhe seus títulos favoritos.',
      },
      { name: 'theme-color', content: '#0d8a4f' },
      { property: 'og:title', content: 'Play Download' },
      {
        property: 'og:description',
        content: 'Seus apps, jogos, filmes e livros em um só lugar.',
      },
      { property: 'og:type', content: 'website' },
    ],
    links: [
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
      <h1 className="mt-4 text-xl font-bold text-foreground">
        Página não encontrada
      </h1>
      <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
        O endereço que você tentou acessar não existe ou foi movido.
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
      <h1 className="mt-4 text-xl font-bold text-foreground">
        Algo deu errado
      </h1>
      <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
        {message}
      </p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => window.location.reload()}
          className="rounded-full bg-brand px-5 py-2 text-xs font-bold text-brand-foreground"
        >
          Tentar novamente
        </button>
        <a
          href="/"
          className="rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold text-foreground"
        >
          Início
        </a>
      </div>
    </div>
  )
}
