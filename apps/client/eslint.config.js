import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker(
  {
    vue: true,
    typescript: true,
    ignores: ['**/fixtures/**'],
  },
)
