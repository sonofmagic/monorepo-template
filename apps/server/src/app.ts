import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { appRouter } from './trpc-router'

const app = new Hono()
app.use(logger())
app.use(cors())

app.get('/', (c) => {
  return c.json({
    message: 'Hello World',
  })
})

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
  }),
)

export {
  app,
}
