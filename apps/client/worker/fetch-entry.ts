import { app } from './app'

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>
