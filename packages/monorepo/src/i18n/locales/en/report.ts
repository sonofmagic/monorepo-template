export const reportMessages = {
  wrote: 'Wrote {path}',
  dryRunOnly: 'Dry run only; no files were written.',
  nextInstallBuild: 'Next: run `pnpm install` and `pnpm build`.',
  nextInstallStart: 'Next: run `pnpm install` and start the new workspace package.',
  doctorBlocking: 'Doctor found {count} blocking issue(s).',
  doctorStrictWarnings: 'Doctor found {count} warning(s) in strict mode.',
  doctorSuggestions: 'Doctor found {count} suggestion(s).',
} as const
