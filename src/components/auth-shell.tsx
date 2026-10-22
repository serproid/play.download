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
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex justify-center">
          <BrandLogo />
        </div>
        <h1 className="text-2xl font-normal text-foreground">{title}</h1>
        <p className="mt-1 text-sm leading-5 text-[#5f6368] dark:text-[#9aa0a6]">
          {subtitle}
        </p>
        <div className="mt-6">{children}</div>
        {footer ? (
          <div className="mt-6 text-center text-sm text-[#5f6368] dark:text-[#9aa0a6]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
