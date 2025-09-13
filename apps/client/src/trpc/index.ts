import type { AppRouter } from '@icebreakers/server/router'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'

export const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:10086/trpc',
    }),
  ],
})
