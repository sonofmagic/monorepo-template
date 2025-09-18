import { upgradeWebSocket } from 'hono/cloudflare-workers'
import { app } from './app'

const wsApp = app.get(
  '/ws',
  upgradeWebSocket(() => {
    return {
      onMessage(event, ws) {
        console.log(`Message from client: ${event.data}`)
        ws.send('Hello from server!')
      },
      onClose: () => {
        console.log('Connection closed')
      },
    }
  }),
)

export {
  wsApp,
}

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>
