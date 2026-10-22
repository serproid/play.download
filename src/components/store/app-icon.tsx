import { Link } from '@tanstack/react-router'
import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'

const palettes = [
  'from-emerald-400 to-emerald-600',
  'from-sky-400 to-blue-600',
  'from-amber-300 to-orange-500',
  'from-fuchsia-400 to-purple-600',
  'from-rose-400 to-red-500',
  'from-teal-300 to-cyan-600',
  'from-indigo-400 to-violet-600',
  'from-lime-300 to-green-600',
]

const sizes = {
  xs: 'size-10 rounded-[11px] text-base',
  sm: 'size-12 rounded-[13px] text-lg',
  md: 'size-14 rounded-[16px] text-xl',
  card: 'size-16 rounded-[18px] text-2xl',
  lg: 'size-[88px] rounded-[22px] text-3xl',
  xl: 'size-28 rounded-[28px] text-4xl',
}

function paletteFor(name: string) {
  let hash = 0
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 997
  }
  return palettes[hash % palettes.length]
}

export function AppIcon({
  name,
  iconUrl,
  size = 'md',
  className,
  rounded,
}: {
  name: string
  iconUrl?: string | null
  size?: keyof typeof sizes
  className?: string
  rounded?: boolean
}) {
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={`Ícone de ${name}`}
        loading="lazy"
        className={cn(
          'shrink-0 object-cover shadow-[0_2px_8px_-2px_rgba(0,0,0,0.18)] ring-1 ring-black/5',
          sizes[size],
          rounded && 'rounded-full',
          className,
        )}
      />
    )
  }

  return (
    <div
      aria-hidden
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br font-bold text-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.22)] ring-1 ring-black/5',
        paletteFor(name),
        sizes[size],
        rounded && 'rounded-full',
        className,
      )}
    >
      <span className="translate-y-px drop-shadow-sm">
        {name.trim().charAt(0).toUpperCase() || '?'}
      </span>
      <Download className="absolute -right-1.5 -bottom-1.5 size-1/2 opacity-15" />
    </div>
  )
}

export function AppIconLink({
  slug,
  name,
  iconUrl,
  size = 'md',
  className,
}: {
  slug: string
  name: string
  iconUrl?: string | null
  size?: keyof typeof sizes
  className?: string
}) {
  return (
    <Link
      to="/app/$slug"
      params={{ slug }}
      className={cn('shrink-0', className)}
      aria-label={`Abrir ${name}`}
    >
      <AppIcon name={name} iconUrl={iconUrl} size={size} />
    </Link>
  )
}
