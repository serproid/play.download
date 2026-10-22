import {
  createFileRoute,
  Link,
  notFound,
  redirect,
} from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { AppForm } from '@/components/app-form'
import { getMyApp, listCategories } from '@/lib/apps.functions'

export const Route = createFileRoute('/_store/meus-apps/$id')({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({
        to: '/users',
        search: { redirect: undefined },
      })
    }
  },
  loader: async ({ params }) => {
    const [app, categories] = await Promise.all([
      getMyApp({ data: { id: params.id } }),
      listCategories(),
    ])
    if (!app) throw notFound()
    return { app, categories }
  },
  notFoundComponent: () => (
    <div className="py-16 text-center">
      <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">
        App não encontrado ou você não tem permissão para editá-lo.
      </p>
      <Link
        to="/users"
        search={{ redirect: undefined }}
        className="mt-3 inline-block text-sm text-brand"
      >
        Voltar para minha conta
      </Link>
    </div>
  ),
  component: EditMyAppPage,
})

function EditMyAppPage() {
  const { app, categories } = Route.useLoaderData()

  return (
    <div className="py-2">
      <header className="border-b border-border pb-4">
        <Link
          to="/users"
          search={{ redirect: undefined }}
          className="mb-2 inline-flex items-center gap-1 text-[13px] text-[#5f6368] hover:text-brand dark:text-[#9aa0a6]"
        >
          <ArrowLeft className="size-4" />
          Minha conta
        </Link>
        <h1 className="text-[26px] font-medium tracking-tight text-foreground">
          Editar página
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          Personalize a página do seu app. O link de acesso continua o mesmo.
        </p>
      </header>

      <div className="mt-5">
        <AppForm mode="user" categories={categories} initial={app} />
      </div>
    </div>
  )
}
