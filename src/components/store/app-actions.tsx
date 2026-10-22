import { useRouter } from '@tanstack/react-router'
import {
  Check,
  Download,
  Heart,
  Share2,
  Smartphone,
  Info,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { toggleWishlist } from '@/lib/apps.functions'
import type { AppDetail, SessionUser } from '@/lib/types'
import { cn } from '@/lib/utils'

export function InstallButton({ app }: { app: AppDetail }) {
  return (
    <a
      href={`/api/download/${app.id}`}
      onClick={(event) => {
        if (!app.fileUrl) {
          event.preventDefault()
          toast.info(
            app.status === 'published'
              ? 'O arquivo deste título ainda não está disponível para download.'
              : 'Este título ainda não está publicado.',
          )
        }
      }}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-bold text-brand-foreground shadow-[0_10px_24px_-14px_rgba(13,138,79,0.9)] transition-transform hover:scale-[1.005] active:scale-[0.99]"
    >
      <Download className="size-4" strokeWidth={2.4} />
      Instalar
    </a>
  )
}

export function ShareButton({ app }: { app: AppDetail }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    const payload = {
      title: app.name,
      text: app.tagline ?? `Conheça ${app.name} no Play Download`,
      url,
    }

    if (navigator.share) {
      try {
        await navigator.share(payload)
        return
      } catch {
        return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copiado para a área de transferência.')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Não foi possível compartilhar agora.')
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft"
    >
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      Compartilhar
    </button>
  )
}

export function WishlistButton({
  app,
  user,
}: {
  app: AppDetail
  user: SessionUser | null
}) {
  const router = useRouter()
  const [inWishlist, setInWishlist] = useState(app.inWishlist)
  const [pending, setPending] = useState(false)

  async function handleToggle() {
    if (!user) {
      await router.navigate({
        to: '/login',
        search: { redirect: `/app/${app.slug}` },
      })
      return
    }

    setPending(true)
    try {
      const result = await toggleWishlist({ data: { appId: app.id } })
      setInWishlist(result.inWishlist)
      toast.success(
        result.inWishlist
          ? 'Adicionado à sua lista de desejos.'
          : 'Removido da sua lista de desejos.',
      )
      await router.invalidate()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Não foi possível atualizar.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold transition-colors disabled:opacity-60',
        inWishlist
          ? 'text-brand hover:bg-brand-soft'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      <Heart
        className={cn('size-4', inWishlist && 'fill-current text-brand')}
        strokeWidth={2}
      />
      {inWishlist ? 'Na lista de desejos' : 'Adicionar à lista de desejos'}
    </button>
  )
}

export function DeviceNote() {
  return (
    <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
      <Info className="size-3.5" />
      Este app está disponível para o seu dispositivo
    </p>
  )
}

export function CompatibilityBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      <Smartphone className="size-3" />
      {label}
    </span>
  )
}
