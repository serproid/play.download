import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from '@tanstack/react-start'
import { withDatabase } from './lib/db'

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
})

const databaseMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next }) => withDatabase(async () => next()),
)

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, databaseMiddleware],
}))
