import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker(
  {
    react: true,
  },
  {
    ignores: ['**/fixtures/**'],
  },
)
