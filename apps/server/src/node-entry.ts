import { serve } from '@hono/node-server'
import { app } from './app'

const port = 10086

serve({
  fetch: app.fetch,
  port,
})

console.log(`Server listening on http://localhost:${port}`)
