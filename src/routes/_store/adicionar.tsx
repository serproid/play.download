import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppForm } from '@/components/app-form'
import { listCategories } from '@/lib/apps.functions'

export const Route = createFileRoute('/_store/adicionar')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: '/login',
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
    <div className="animate-rise-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Adicionar app
        </h1>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Publique seu aplicativo, jogo, filme ou livro no Play Download. Após o
          envio, nossa equipe revisa as informações antes de publicar.
        </p>
      </header>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {[
          ['1', 'Preencha os dados', 'Logo, descrição e detalhes técnicos.'],
          ['2', 'Envie o arquivo', 'APK, PDF, EPUB, ZIP ou vídeo.'],
          ['3', 'Aguardе a análise', 'Você acompanha tudo em Minha conta.'],
        ].map(([step, title, description]) => (
          <div
            key={step}
            className="flex items-start gap-2.5 rounded-2xl border border-border/70 bg-card px-3 py-2.5"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-brand">
              {step}
            </span>
            <div>
              <p className="text-[11px] font-semibold text-foreground">{title}</p>
              <p className="text-[10px] leading-4 text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <AppForm mode="user" categories={categories} />
      </div>
    </div>
  )
}
