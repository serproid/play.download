import { BrandLogo } from '@/components/brand-logo'

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -top-40 -right-24 size-96 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 size-96 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <BrandLogo />
        </div>
        <div className="rounded-[26px] border border-border/80 bg-card p-6 shadow-[0_24px_60px_-40px_rgba(10,40,25,0.5)]">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {subtitle}
          </p>
          <div className="mt-5">{children}</div>
        </div>
        {footer ? (
          <div className="mt-5 text-center text-xs text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
