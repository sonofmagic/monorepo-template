import { serve } from '@hono/node-server'
import { app } from './app'
import { port } from './config'

serve({
  fetch: app.fetch,
  port,
})

console.log(`Server listening on http://localhost:${port}`)
