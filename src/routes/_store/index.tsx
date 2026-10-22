import { createFileRoute, redirect } from '@tanstack/react-router'
import { getMySpace } from '@/lib/apps.functions'

export const Route = createFileRoute('/_store/')({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({
        to: '/users',
        search: { redirect: undefined, mode: undefined },
      })
    }
  },
  loader: async () => {
    const { submissions } = await getMySpace()
    const target =
      submissions.find((app) => app.status === 'published') ?? submissions[0]

    if (target) {
      throw redirect({
        to: '/$slug',
        params: { slug: target.slug },
      })
    }

    throw redirect({
      to: '/users',
      search: { redirect: undefined, mode: undefined },
    })
  },
})
