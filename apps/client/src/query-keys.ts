export const helloKeys = {
  all: ['hello'] as const,
  detail: (name: string) => [...helloKeys.all, { name }] as const,
}
