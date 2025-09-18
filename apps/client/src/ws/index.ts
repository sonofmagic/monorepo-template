import type { wsApp } from '~/worker/fetch-entry'
import { hc } from 'hono/client'

const client = hc<typeof wsApp>(

  import.meta.env.PROD
    ? 'https://client.monorepo.icebreaker.top'
    : 'http://localhost:5173',
)
const ws = client.ws.$ws(0)

export function useWebSocket() {
  function init() {
    ws.addEventListener('open', () => {
    // setInterval(() => {
    //   ws.send(new Date().toString())
    // }, 1000)
    })

  // ws.addEventListener('')
  }

  return {
    ws,
    init,
  }
}
