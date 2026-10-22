import { Check, Copy, Link2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function usePageUrl(slug: string) {
  const path = `/${slug}`
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  return { path, origin, url: `${origin}${path}` }
}

async function copyValue(value: string) {
  try {
    await navigator.clipboard.writeText(value)
  } catch {
    const field = document.createElement('textarea')
    field.value = value
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.appendChild(field)
    field.select()
    document.execCommand('copy')
    document.body.removeChild(field)
  }
  toast.success('Link copiado!')
}

export function CopyLinkButton({
  slug,
  className,
}: {
  slug: string
  className?: string
}) {
  const { url } = usePageUrl(slug)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await copyValue(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground',
        className,
      )}
      aria-label="Copiar link da página"
    >
      {copied ? (
        <Check className="size-3.5 text-brand" />
      ) : (
        <Link2 className="size-3.5" />
      )}
      {copied ? 'Copiado' : 'Copiar link'}
    </button>
  )
}

export function ShareLink({
  slug,
  className,
}: {
  slug: string
  className?: string
}) {
  const { path, origin, url } = usePageUrl(slug)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await copyValue(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-brand/25 bg-brand-soft/60 px-4 py-3',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium tracking-[0.08em] text-brand uppercase">
          Link da sua página
        </p>
        <p className="mt-0.5 truncate text-[13px] text-foreground">
          {origin ? url : path}
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-brand px-3.5 text-[12px] font-medium text-brand-foreground"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  )
}
