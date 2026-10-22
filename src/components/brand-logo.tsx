import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export function PlayLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      aria-hidden="true"
      className={cn('size-7 shrink-0', className)}
    >
      <path
        fill="#4285F4"
        d="M3.609 1.814 13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92z"
      />
      <path
        fill="#34A853"
        d="M16.998 8.777l-3.206 3.223L3.609 1.814c.276-.188.631-.2.933-.03l12.456 7.013z"
      />
      <path
        fill="#FBBC04"
        d="M16.998 15.223l-3.206-3.223 3.206-3.223 3.585 2.016c.836.47.836 1.94 0 2.41l-3.585 2.02z"
      />
      <path
        fill="#EA4335"
        d="M16.998 15.223l-12.456 7.01c-.302.17-.657.158-.933-.03L13.792 12l3.206 3.223z"
      />
    </svg>
  )
}

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
      aria-label="Play Store — página inicial"
    >
      <PlayLogo />
      {showName ? (
        <span className="text-[21px] font-medium tracking-tight text-foreground/80">
          Play Store
        </span>
      ) : null}
    </Link>
  )
}
