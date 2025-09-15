import type { AppRouter } from '@icebreakers/server/router'
import { createTRPCProxyClient, httpLink } from '@trpc/client'

export const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: '/api/trpc',
    }),
  ],
})
