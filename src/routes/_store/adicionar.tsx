import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppForm } from '@/components/app-form'
import { listCategories } from '@/lib/apps.functions'

export const Route = createFileRoute('/_store/adicionar')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: '/users',
        search: { redirect: location.href, mode: undefined },
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
        <h1 className="text-[22px] font-normal text-foreground">
          Adicionar app
        </h1>
        <p className="mt-1 text-sm leading-5 text-[#5f6368] dark:text-[#9aa0a6]">
          Preencha as informações e envie seu app para análise.
        </p>
      </header>

      <div className="mt-5">
        <AppForm mode="user" categories={categories} />
      </div>
    </div>
  )
}
