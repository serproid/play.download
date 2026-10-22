import { Link } from '@tanstack/react-router'
import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BrandLogo({
  className,
  showName = true,
}: {
  className?: string
  showName?: boolean
}) {
  return (
    <Link
      to="/"
      className={cn('flex items-center gap-2.5', className)}
      aria-label="Play Download — página inicial"
    >
      <span className="flex size-9 items-center justify-center rounded-[11px] bg-brand text-brand-foreground shadow-[0_6px_16px_-6px_rgba(13,138,79,0.65)]">
        <Download className="size-5" strokeWidth={2.4} />
      </span>
      {showName ? (
        <span className="text-[18px] font-bold tracking-tight text-foreground">
          Play Download
        </span>
      ) : null}
    </Link>
  )
}
