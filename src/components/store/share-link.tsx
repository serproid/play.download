import { Check, Link2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function usePageUrl(slug: string) {
  const path = `/${slug}`
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  return { path, url: `${origin}${path}` }
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
  compact,
}: {
  slug: string
  className?: string
  compact?: boolean
}) {
  const { path, url } = usePageUrl(slug)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const value = url.startsWith('http')
      ? url
      : `${window.location.origin}${path}`
    await copyValue(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
          className,
        )}
        aria-label={copied ? 'Link copiado' : 'Copiar link da página'}
        title={copied ? 'Link copiado' : 'Copiar link da página'}
      >
        {copied ? (
          <Check className="size-4 text-brand" />
        ) : (
          <Link2 className="size-4" />
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex min-h-10 items-center gap-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground',
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
