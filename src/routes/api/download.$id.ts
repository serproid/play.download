import { createFileRoute } from '@tanstack/react-router'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { isDemoMode } from '@/lib/auth.functions'
import { db } from '@/lib/db'
import { apps, downloads } from '@/lib/db/schema'

export const Route = createFileRoute('/api/download/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        if (isDemoMode()) {
          return Response.json(
            {
              error:
                'Modo demonstração: configure o banco de dados para habilitar downloads.',
            },
            { status: 503 },
          )
        }

        const [app] = await db
          .select({
            id: apps.id,
            fileUrl: apps.fileUrl,
            name: apps.name,
          })
          .from(apps)
          .where(and(eq(apps.id, params.id), eq(apps.status, 'published')))
          .limit(1)

        if (!app || !app.fileUrl) {
          return Response.json(
            { error: 'Arquivo indisponível para download.' },
            { status: 404 },
          )
        }

        const session = await auth.api.getSession({ headers: request.headers })

        await db.insert(downloads).values({
          appId: app.id,
          userId: session?.user.id ?? null,
        })

        return new Response(null, {
          status: 302,
          headers: {
            Location: app.fileUrl,
            'Cache-Control': 'no-store',
          },
        })
      },
    },
  },
})
