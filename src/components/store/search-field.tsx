import { useState } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SearchField({
  action,
  defaultValue = '',
  category,
  placeholder = 'Pesquisar apps e jogos',
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
      <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[#5f6368] dark:text-[#9aa0a6]" />
      <input
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="h-12 w-full rounded-full bg-[#f1f3f4] pr-4 pl-12 text-[15px] text-foreground outline-none placeholder:text-[#5f6368] focus:bg-white focus:ring-1 focus:ring-border dark:bg-[#303134] dark:focus:bg-[#303134]"
        aria-label="Pesquisar"
      />
      {category ? <input type="hidden" name="category" value={category} /> : null}
    </form>
  )
}
