import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { appRouter } from './trpc-router'

const app = new Hono()

app.get('/api', (c) => {
  return c.json({
    message: 'Hello World',
  })
})

app.use(
  '/api/trpc/*',
  trpcServer({
    endpoint: '/api/trpc',
    router: appRouter,
  }),
)

export {
  app,

}
