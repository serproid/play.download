import { Link, useRouter } from '@tanstack/react-router'
import { MessageSquareText, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { saveReview } from '@/lib/apps.functions'
import type { AppDetail, SessionUser } from '@/lib/types'
import { StarRatingInput, Stars } from './stars'

export function ReviewForm({
  app,
  user,
}: {
  app: AppDetail
  user: SessionUser | null
}) {
  const router = useRouter()
  const [rating, setRating] = useState(app.userReview?.rating ?? 0)
  const [comment, setComment] = useState(app.userReview?.comment ?? '')
  const [pending, setPending] = useState(false)

  if (!user) {
    return (
      <div className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-brand-soft text-brand">
            <MessageSquareText className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Avalie este aplicativo
            </p>
            <p className="text-[11px] text-muted-foreground">
              Entre na sua conta para deixar uma avaliação.
            </p>
          </div>
        </div>
        <Link
          to="/login"
          search={{ redirect: `/app/${app.slug}` }}
          className="rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-brand-foreground"
        >
          Entrar para avaliar
        </Link>
      </div>
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (rating < 1) {
      toast.error('Escolha de 1 a 5 estrelas.')
      return
    }

    setPending(true)
    try {
      await saveReview({
        data: { appId: app.id, rating, comment: comment.trim() },
      })
      toast.success(
        app.userReview
          ? 'Sua avaliação foi atualizada.'
          : 'Obrigado por avaliar!',
      )
      await router.invalidate()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Não foi possível salvar.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {app.userReview ? 'Sua avaliação' : 'Avalie este aplicativo'}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Compartilhe sua experiência com a comunidade.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StarRatingInput
            value={rating}
            onChange={setRating}
            disabled={pending}
          />
          {rating > 0 ? (
            <span className="text-xs font-semibold text-muted-foreground">
              {rating}/5
            </span>
          ) : null}
        </div>
      </div>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Conte o que você achou do app..."
        rows={3}
        maxLength={1000}
        className="mt-3 w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground/80 focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-[10px] text-muted-foreground">
          {comment.length}/1000
        </span>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-brand px-4 text-xs font-bold text-brand-foreground transition-opacity disabled:opacity-60"
        >
          <Send className="size-3.5" />
          {pending
            ? 'Enviando...'
            : app.userReview
              ? 'Atualizar avaliação'
              : 'Publicar avaliação'}
        </button>
      </div>
      {app.userReview ? (
        <div className="mt-3 flex items-center gap-2 border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
          Sua nota atual:
          <Stars value={app.userReview.rating} size={12} />
        </div>
      ) : null}
    </form>
  )
}
