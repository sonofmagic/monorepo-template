import { initTRPC } from '@trpc/server'
import { z } from 'zod'

const t = initTRPC.create()

const publicProcedure = t.procedure
const router = t.router

export const appRouter = router({
  hello: publicProcedure.input(z.string().nullish()).query(({ input }) => {
    return {
      message: `hello ${input || 'world'}`,
      time: Date.now(),
    }
  }),
  sayHello: publicProcedure
    .input(z.object({ name: z.string() }))
    .output(z.object({ greeting: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello ${input.name}!` }
    }),
})

export type AppRouter = typeof appRouter
