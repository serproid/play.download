import { useRouterState } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export function NavigationProgress() {
  const isLoading = useRouterState({ select: (state) => state.isLoading })

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 overflow-hidden transition-opacity duration-200',
        isLoading ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div
        className={cn(
          'h-full w-1/2 bg-brand',
          isLoading && 'animate-[nav-progress_0.9s_ease-in-out_infinite]',
        )}
      />
    </div>
  )
}
