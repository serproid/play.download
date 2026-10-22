import { useRouter } from '@tanstack/react-router'
import { ImagePlus, Loader2, Save, UploadCloud, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { AppIcon } from '@/components/store/app-icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { adminSaveApp, submitApp, updateMyApp } from '@/lib/apps.functions'
import type { AdminApp, AppInput } from '@/lib/types'
import type { AppStatus, AppType } from '@/lib/db/schema'
import { cn, formatFileSize } from '@/lib/utils'

type Category = {
  id: string
  name: string
  slug: string
  type: AppType | null
}

const typeOptions: Array<{ value: AppType; label: string }> = [
  { value: 'app', label: 'App' },
  { value: 'game', label: 'Jogo' },
  { value: 'movie', label: 'Filme' },
  { value: 'book', label: 'Livro' },
]

const statusOptions: Array<{ value: AppStatus; label: string }> = [
  { value: 'pending', label: 'Em análise (legado)' },
  { value: 'published', label: 'Publicado' },
  { value: 'rejected', label: 'Rejeitado' },
]

function emptyForm(developer = ''): AppInput {
  return {
    name: '',
    type: 'app',
    tagline: '',
    description: '',
    developer,
    version: '',
    size: '',
    requirements: 'Android 8.0 ou superior',
    ageRating: 'Livre',
    categoryId: null,
    iconUrl: '',
    bannerUrl: '',
    screenshots: [],
    fileUrl: '',
    fileName: '',
    fileSize: null,
    downloads: 0,
  }
}

export function AppForm({
  mode,
  categories,
  initial,
  defaultDeveloper,
}: {
  mode: 'user' | 'admin'
  categories: Category[]
  initial?: AdminApp
  defaultDeveloper?: string
}) {
  const router = useRouter()
  const [form, setForm] = useState<AppInput>(() =>
    initial
      ? {
          name: initial.name,
          type: initial.type,
          tagline: initial.tagline ?? '',
          description: initial.description ?? '',
          developer: initial.developer ?? '',
          version: initial.version ?? '',
          size: initial.size ?? '',
          requirements: initial.requirements ?? '',
          ageRating: initial.ageRating ?? 'Livre',
          categoryId: initial.categoryId,
          iconUrl: initial.iconUrl ?? '',
          bannerUrl: initial.bannerUrl ?? '',
          screenshots: initial.screenshots ?? [],
          fileUrl: initial.fileUrl ?? '',
          fileName: initial.fileName ?? '',
          fileSize: initial.fileSize,
          downloads: initial.downloads,
        }
      : emptyForm(defaultDeveloper),
  )
  const [status, setStatus] = useState<AppStatus>(
    initial?.status ?? 'published',
  )
  const [featured, setFeatured] = useState(initial?.featured ?? false)
  const [pending, setPending] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const iconInput = useRef<HTMLInputElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const filteredCategories = categories.filter(
    (category) => category.type === null || category.type === form.type,
  )

  function update<TKey extends keyof AppInput>(
    key: TKey,
    value: AppInput[TKey],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function upload(file: File, field: 'iconUrl' | 'bannerUrl' | 'file') {
    setUploading(field)
    try {
      const body = new FormData()
      body.append('file', file)
      const response = await fetch('/api/upload', { method: 'POST', body })
      const result = (await response.json()) as {
        url?: string
        name?: string
        size?: number
        error?: string
      }
      if (!response.ok || !result.url) {
        throw new Error(result.error ?? 'Falha no upload.')
      }

      if (field === 'file') {
        setForm((current) => ({
          ...current,
          fileUrl: result.url!,
          fileName: result.name ?? file.name,
          fileSize: result.size ?? file.size,
        }))
        if (!form.size) {
          update('size', formatFileSize(result.size ?? file.size) ?? '')
        }
      } else {
        update(field, result.url)
      }
      toast.success('Arquivo enviado.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Não foi possível enviar.',
      )
    } finally {
      setUploading(null)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (form.name.trim().length < 2) {
      toast.error('Informe o nome do app.')
      return
    }

    const payload: AppInput = { ...form, screenshots: [] }

    setPending(true)
    try {
      if (mode === 'admin') {
        await adminSaveApp({
          data: {
            ...payload,
            id: initial?.id,
            status,
            featured,
          },
        })
        toast.success(initial ? 'App atualizado.' : 'App criado.')
        await router.invalidate()
        await router.navigate({
          to: '/admin/apps',
          search: { status: undefined },
        })
      } else if (initial) {
        const { slug } = await updateMyApp({
          data: { ...payload, id: initial.id },
        })
        toast.success('Página atualizada.')
        await router.invalidate()
        await router.navigate({ to: '/$slug', params: { slug } })
      } else {
        const { slug } = await submitApp({ data: payload })
        toast.success('Página criada! Copie o link e divulgue.')
        await router.invalidate()
        await router.navigate({ to: '/$slug', params: { slug } })
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o app.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold text-foreground">Identidade</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          As pessoas vão ver estas informações primeiro.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <AppIcon name={form.name || 'App'} iconUrl={form.iconUrl} size="lg" />
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => iconInput.current?.click()}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-[11px] font-semibold text-foreground hover:bg-accent"
              >
                {uploading === 'iconUrl' ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ImagePlus className="size-3.5" />
                )}
                Escolher logo
              </button>
              {form.iconUrl ? (
                <button
                  type="button"
                  onClick={() => update('iconUrl', '')}
                  className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-[11px] font-medium text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3.5" /> Remover
                </button>
              ) : null}
            </div>
            <p className="text-[10px] text-muted-foreground">
              PNG, JPG ou WebP · até 8 MB · recomendado 512×512
            </p>
          </div>
          <input
            ref={iconInput}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void upload(file, 'iconUrl')
              event.target.value = ''
            }}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Nome do app" className="sm:col-span-2">
            <Input
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="Ex.: Ponto de Coleta"
              required
              maxLength={80}
            />
          </Field>
          <Field label="Tipo">
            <Select
              value={form.type}
              onValueChange={(value) => {
                update('type', value as AppType)
                update('categoryId', null)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Categoria">
            <Select
              value={form.categoryId ?? 'none'}
              onValueChange={(value) =>
                update('categoryId', value === 'none' ? null : value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Desenvolvedor">
            <Input
              value={form.developer}
              onChange={(event) => update('developer', event.target.value)}
              placeholder="Nome do desenvolvedor ou estúdio"
              maxLength={80}
            />
          </Field>
          <Field label="Banner (URL)">
            <Input
              value={form.bannerUrl}
              onChange={(event) => update('bannerUrl', event.target.value)}
              placeholder="https://.../banner.jpg"
              type="url"
            />
          </Field>
          <Field label="Chamada curta" className="sm:col-span-2">
            <Input
              value={form.tagline}
              onChange={(event) => update('tagline', event.target.value)}
              placeholder="Uma frase que resume o app"
              maxLength={120}
            />
          </Field>
          <Field label="Descrição" className="sm:col-span-2">
            <Textarea
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="Conte o que o app faz, seus principais recursos e diferenciais..."
              rows={5}
              maxLength={4000}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold text-foreground">Detalhes técnicos</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Versão">
            <Input
              value={form.version}
              onChange={(event) => update('version', event.target.value)}
              placeholder="1.0.0"
            />
          </Field>
          <Field label="Tamanho">
            <Input
              value={form.size}
              onChange={(event) => update('size', event.target.value)}
              placeholder="Ex.: 48 MB"
            />
          </Field>
          <Field label="Downloads">
            <Input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={form.downloads}
              onChange={(event) =>
                update(
                  'downloads',
                  Math.max(0, Math.floor(Number(event.target.value) || 0)),
                )
              }
              placeholder="0"
            />
          </Field>
          <Field label="Requisitos">
            <Input
              value={form.requirements}
              onChange={(event) => update('requirements', event.target.value)}
              placeholder="Android 8.0 ou superior"
            />
          </Field>
          <Field label="Classificação indicativa">
            <Select
              value={form.ageRating}
              onValueChange={(value) => update('ageRating', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Livre', '10', '12', '14', '16', '18'].map((rating) => (
                  <SelectItem key={rating} value={rating}>
                    {rating}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="mt-4 space-y-3">
          <Label>Arquivo para download</Label>
          <div className="rounded-xl border border-dashed border-border bg-background p-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-brand px-4 text-xs font-medium text-white"
              >
                {uploading === 'file' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UploadCloud className="size-4" />
                )}
                Enviar arquivo
              </button>
              {form.fileUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    update('fileUrl', '')
                    update('fileName', '')
                    update('fileSize', null)
                  }}
                  className="inline-flex h-9 items-center gap-1 rounded-full px-2 text-xs font-medium text-[#5f6368] hover:text-destructive"
                >
                  <X className="size-3.5" /> Remover
                </button>
              ) : null}
            </div>
            {form.fileUrl ? (
              <p className="mt-2 truncate text-[11px] text-[#5f6368]">
                {form.fileName || form.fileUrl}
                {form.fileSize ? ` · ${formatFileSize(form.fileSize)}` : ''}
              </p>
            ) : (
              <p className="mt-2 text-[11px] text-[#5f6368]">
                APK, PDF, EPUB, ZIP ou MP4 · até 100 MB. Você também pode colar
                um link abaixo.
              </p>
            )}
            <Input
              className="mt-2 h-9 bg-card text-xs"
              value={form.fileUrl}
              onChange={(event) => update('fileUrl', event.target.value)}
              placeholder="https://.../arquivo.apk"
            />
            <input
              ref={fileInput}
              type="file"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void upload(file, 'file')
                event.target.value = ''
              }}
            />
          </div>
        </div>
      </section>

      {mode === 'admin' ? (
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-bold text-foreground">Publicação</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Status">
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as AppStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <label className="flex items-center justify-between gap-3 self-end rounded-xl border border-border px-3 py-2.5">
              <span>
                <span className="block text-xs font-semibold text-foreground">
                  Destaque
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  Exibir na página inicial
                </span>
              </span>
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </label>
          </div>
        </section>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-brand-foreground transition-opacity',
            pending && 'opacity-70',
          )}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {mode === 'admin'
            ? initial
              ? 'Salvar alterações'
              : 'Criar app'
            : initial
              ? 'Salvar página'
              : 'Criar minha página'}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-xs font-semibold text-foreground">{label}</Label>
      {children}
    </div>
  )
}
