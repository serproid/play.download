import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Stars({
  value,
  size = 14,
  className,
}: {
  value: number
  size?: number
  className?: string
}) {
  const rounded = Math.round(value)
  return (
    <span
      className={cn('inline-flex items-center gap-0.5 text-[#f5b301]', className)}
      aria-label={`${value.toFixed(1)} de 5 estrelas`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          style={{ width: size, height: size }}
          className={cn(
            index < rounded
              ? 'fill-current text-[#f5b301]'
              : 'fill-transparent text-muted-foreground/35',
          )}
          strokeWidth={1.8}
        />
      ))}
    </span>
  )
}

export function StarRatingInput({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          className="rounded-md p-1 transition-transform hover:scale-110 disabled:opacity-50"
          aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
          aria-pressed={value >= star}
        >
          <Star
            className={cn(
              'size-7',
              value >= star
                ? 'fill-[#f5b301] text-[#f5b301]'
                : 'fill-transparent text-muted-foreground/40',
            )}
            strokeWidth={1.7}
          />
        </button>
      ))}
    </div>
  )
}
