import { createFileRoute } from '@tanstack/react-router'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@/lib/auth'

const MAX_IMAGE_SIZE = 8 * 1024 * 1024
const MAX_FILE_SIZE = 150 * 1024 * 1024

const allowedTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/vnd.android.package-archive',
  'application/pdf',
  'application/epub+zip',
  'application/zip',
  'application/x-zip-compressed',
  'video/mp4',
  'audio/mpeg',
])

function safeName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .slice(-80)
}

export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) {
          return Response.json(
            { error: 'Entre na sua conta para enviar arquivos.' },
            { status: 401 },
          )
        }

        const supabaseUrl = process.env.SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseUrl || !serviceKey) {
          return Response.json(
            {
              error:
                'Upload não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.',
            },
            { status: 503 },
          )
        }

        const formData = await request.formData()
        const file = formData.get('file')
        if (!(file instanceof File)) {
          return Response.json({ error: 'Arquivo inválido.' }, { status: 400 })
        }

        const isImage = file.type.startsWith('image/')
        const limit = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE

        if (!allowedTypes.has(file.type)) {
          return Response.json(
            { error: 'Formato de arquivo não suportado.' },
            { status: 400 },
          )
        }
        if (file.size > limit) {
          return Response.json(
            {
              error: isImage
                ? 'A imagem deve ter no máximo 8 MB.'
                : 'O arquivo deve ter no máximo 150 MB.',
            },
            { status: 400 },
          )
        }

        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })

        const bucket = process.env.SUPABASE_BUCKET ?? 'apps'
        const path = `${session.user.id}/${Date.now()}-${safeName(file.name)}`
        const buffer = Buffer.from(await file.arrayBuffer())

        const { error } = await supabase.storage
          .from(bucket)
          .upload(path, buffer, {
            contentType: file.type,
            cacheControl: '31536000',
            upsert: false,
          })

        if (error) {
          return Response.json(
            {
              error: `Não foi possível enviar o arquivo: ${error.message}. Verifique se o bucket "${bucket}" existe e é público.`,
            },
            { status: 500 },
          )
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(path)

        return Response.json({
          url: data.publicUrl,
          name: file.name,
          size: file.size,
          type: file.type,
        })
      },
    },
  },
})
