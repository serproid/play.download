import { useState } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SearchField({
  action,
  defaultValue = '',
  category,
  placeholder = 'Buscar apps, jogos, filmes e livros',
  autoFocus,
  className,
}: {
  action: string
  defaultValue?: string
  category?: string
  placeholder?: string
  autoFocus?: boolean
  className?: string
}) {
  const [value, setValue] = useState(defaultValue)

  return (
    <form
      action={action}
      method="get"
      className={cn('relative', className)}
      role="search"
    >
      <Search className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="h-12 w-full rounded-2xl border border-border bg-card pr-4 pl-11 text-sm text-foreground shadow-[0_1px_2px_rgba(16,24,20,0.04)] outline-none transition-shadow placeholder:text-muted-foreground/80 focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
        aria-label="Buscar"
      />
      {category ? <input type="hidden" name="category" value={category} /> : null}
    </form>
  )
}
