import { createFileRoute, redirect } from '@tanstack/react-router'
import { PlayLogo } from '@/components/brand-logo'
import { getRootAppSlug } from '@/lib/apps.functions'

export const Route = createFileRoute('/_store/')({
  loader: async () => {
    const slug = await getRootAppSlug()

    if (slug) {
      throw redirect({
        to: '/$slug',
        params: { slug },
      })
    }
  },
  component: RootEmpty,
})

function RootEmpty() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <PlayLogo className="size-12" />
      <h1 className="mt-5 text-2xl font-medium tracking-tight text-foreground">
        Nenhum app publicado
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        O administrador ainda não publicou o app principal do domínio.
      </p>
    </div>
  )
}
