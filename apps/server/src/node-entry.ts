/* eslint-disable no-console */
import { serve } from '@hono/node-server'
import { logger } from 'hono/logger'
import { app } from './app'
import { port } from './config'

app.use(logger())
serve({
  fetch: app.fetch,
  port,
})

console.log(`Server listening on http://localhost:${port}`)
