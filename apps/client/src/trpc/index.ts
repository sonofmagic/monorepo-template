import type { AppRouter } from '~/worker/trpc-router'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'

export const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
})
