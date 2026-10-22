import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppForm } from '@/components/app-form'
import { listCategories } from '@/lib/apps.functions'

export const Route = createFileRoute('/_store/adicionar')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: '/users',
        search: { redirect: location.href },
      })
    }
  },
  loader: async () => listCategories(),
  component: AdicionarPage,
})

function AdicionarPage() {
  const categories = Route.useLoaderData()

  return (
    <div className="py-2">
      <header className="border-b border-border pb-4">
        <h1 className="text-[26px] font-medium tracking-tight text-foreground">
          Criar página do app
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          Personalize sua página. Ao salvar, você recebe um link exclusivo para
          divulgar.
        </p>
      </header>

      <div className="mt-5">
        <AppForm mode="user" categories={categories} />
      </div>
    </div>
  )
}
