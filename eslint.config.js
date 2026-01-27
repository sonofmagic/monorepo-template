import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker(
  {
    ignores: ['**/fixtures/**'],
    formatters: {
      css: true,
      graphql: true,
      html: true,
      markdown: true,
      prettierOptions: {
        endOfLine: 'lf',
      },
    },
  },
)
