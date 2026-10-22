import { ArrowUp, Download, Info } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { AppDetail } from '@/lib/types'

export function InstallButton({ app }: { app: AppDetail }) {
  const [open, setOpen] = useState(false)

  function confirmDownload() {
    setOpen(false)
    if (!app.fileUrl) {
      toast.info('O arquivo deste app ainda não está disponível.')
      return
    }
    window.location.assign(`/api/download/${app.id}`)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-medium text-white hover:brightness-95 active:brightness-90"
      >
        <Download className="size-[18px]" strokeWidth={2} />
        Instalar
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 bg-black/55"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-notice-title"
        >
          <div className="absolute inset-x-0 bottom-[72px] mx-auto w-full max-w-[460px] px-3">
            <div className="relative animate-rise-in rounded-[22px] border-2 border-[#f6c344] bg-white px-4 pt-5 pb-4 text-center shadow-[0_10px_40px_rgba(0,0,0,0.28)]">
              <ArrowUp
                className="animate-arrow-rise absolute -top-[72px] right-8 size-12 text-[#fbbc04]"
                strokeWidth={3.2}
                aria-hidden
              />
              <h2
                id="install-notice-title"
                className="text-[17px] font-bold text-[#202124]"
              >
                Falta só um passo!
              </h2>
              <p className="mt-2 text-[13px] leading-5 text-[#3c4043]">
                Toque em{' '}
                <strong className="font-bold">
                  “Baixar mesmo assim ou Fazer download mesmo assim”
                </strong>{' '}
                para download do aplicativo para começar.
              </p>
              <p className="mt-2 text-[13px] leading-5 text-[#3c4043]">
                A opção fica no meio da tela do aparelho, ao lado de{' '}
                <strong className="font-bold">“Cancelar”</strong>.
              </p>
              <button
                onClick={confirmDownload}
                className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-brand text-sm font-medium text-white active:brightness-90"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export function DeviceNote() {
  return (
    <p className="flex items-center justify-center gap-1.5 text-xs text-[#5f6368] dark:text-[#9aa0a6]">
      <Info className="size-3.5" />
      Este app está disponível para seu dispositivo
    </p>
  )
}
