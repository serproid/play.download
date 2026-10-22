import { Link } from '@tanstack/react-router'
import { Play } from 'lucide-react'
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
      className={cn('flex items-center gap-2', className)}
      aria-label="Play Download — página inicial"
    >
      <Play className="size-7 fill-brand text-brand" strokeWidth={0} />
      {showName ? (
        <span className="text-[22px] font-normal tracking-tight text-[#5f6368] dark:text-[#9aa0a6]">
          Play Download
        </span>
      ) : null}
    </Link>
  )
}
