import { cn } from '@/lib/utils'

const sizes = {
  xs: 'size-10 rounded-[10px] text-base',
  sm: 'size-12 rounded-[12px] text-lg',
  md: 'size-14 rounded-[14px] text-xl',
  card: 'size-16 rounded-[16px] text-2xl',
  lg: 'size-[88px] rounded-[20px] text-3xl',
  xl: 'size-28 rounded-[26px] text-4xl',
}

export function AppIcon({
  name,
  iconUrl,
  size = 'md',
  className,
  rounded,
  priority,
}: {
  name: string
  iconUrl?: string | null
  size?: keyof typeof sizes
  className?: string
  rounded?: boolean
  priority?: boolean
}) {
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={`Ícone de ${name}`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={cn(
          'shrink-0 object-cover',
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
        'flex shrink-0 items-center justify-center bg-[#f1f3f4] font-normal text-[#5f6368] dark:bg-[#303134] dark:text-[#9aa0a6]',
        sizes[size],
        rounded && 'rounded-full',
        className,
      )}
    >
      {name.trim().charAt(0).toUpperCase() || '?'}
    </div>
  )
}
