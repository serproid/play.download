import { Link, useRouter } from '@tanstack/react-router'
import {
  Check,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Star,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  adminDeleteApp,
  adminSetStatus,
  adminToggleFeatured,
} from '@/lib/apps.functions'
import type { AdminApp } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

async function run(
  action: () => Promise<unknown>,
  message: string,
  onDone: () => Promise<void>,
) {
  try {
    await action()
    toast.success(message)
    await onDone()
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Não foi possível concluir.',
    )
  }
}

export function AdminAppActions({ app }: { app: AdminApp }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const refresh = async () => {
    await router.invalidate()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={`Ações de ${app.name}`}
          disabled={pending}
        >
          <MoreVertical className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link to="/admin/apps/$id" params={{ id: app.id }}>
            <Pencil /> Editar
          </Link>
        </DropdownMenuItem>
        {app.status !== 'published' ? (
          <DropdownMenuItem
            onSelect={() => {
              setPending(true)
              void run(
                () =>
                  adminSetStatus({ data: { id: app.id, status: 'published' } }),
                'App publicado.',
                refresh,
              ).finally(() => setPending(false))
            }}
          >
            <CheckCircle2 /> Publicar
          </DropdownMenuItem>
        ) : null}
        {app.status !== 'rejected' ? (
          <DropdownMenuItem
            onSelect={() => {
              setPending(true)
              void run(
                () =>
                  adminSetStatus({ data: { id: app.id, status: 'rejected' } }),
                'App rejeitado.',
                refresh,
              ).finally(() => setPending(false))
            }}
          >
            <XCircle /> Rejeitar
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          onSelect={() => {
            setPending(true)
            void run(
              () =>
                adminToggleFeatured({
                  data: { id: app.id, featured: !app.featured },
                }),
              app.featured ? 'Destaque removido.' : 'App destacado.',
              refresh,
            ).finally(() => setPending(false))
          }}
        >
          <Star className={app.featured ? 'fill-current text-[#f5b301]' : ''} />
          {app.featured ? 'Remover destaque' : 'Destacar'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            if (
              !window.confirm(
                `Excluir “${app.name}”? Essa ação não pode ser desfeita.`,
              )
            ) {
              return
            }
            setPending(true)
            void run(
              () => adminDeleteApp({ data: { id: app.id } }),
              'App excluído.',
              refresh,
            ).finally(() => setPending(false))
          }}
        >
          <Trash2 /> Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ApproveRejectActions({ app }: { app: AdminApp }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function act(status: 'published' | 'rejected') {
    setPending(true)
    try {
      await adminSetStatus({ data: { id: app.id, status } })
      toast.success(status === 'published' ? 'App aprovado.' : 'App rejeitado.')
      await router.invalidate()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Não foi possível concluir.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => act('published')}
        disabled={pending}
        className="inline-flex h-10 items-center gap-1 rounded-full bg-brand px-3 text-[11px] font-bold text-brand-foreground disabled:opacity-60"
      >
        <Check className="size-3.5" />
        Aprovar
      </button>
      <button
        onClick={() => act('rejected')}
        disabled={pending}
        className="inline-flex h-10 items-center gap-1 rounded-full border border-border px-3 text-[11px] font-semibold text-muted-foreground hover:text-destructive disabled:opacity-60"
      >
        Rejeitar
      </button>
    </div>
  )
}
