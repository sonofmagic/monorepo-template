import type { AppRouter } from '~/worker/trpc-router'
import { createTRPCProxyClient, httpLink } from '@trpc/client'

export const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: '/api/trpc',
    }),
  ],
})
