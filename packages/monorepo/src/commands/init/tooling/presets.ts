import type { InitToolingContext, InitToolingPreset, InitToolingTarget } from './types'
import type { PackageJson } from '@/types'
import { version } from '@/constants'
import { defineTsconfigConfig } from '@/tooling'
import rootPackageJson from '../../../../../../package.json'
import monorepoPackageJson from '../../../../package.json'

const packageDependencies = {
  ...((rootPackageJson as { dependencies?: Record<string, string> }).dependencies ?? {}),
  ...((rootPackageJson as { devDependencies?: Record<string, string> }).devDependencies ?? {}),
  ...((monorepoPackageJson as { dependencies?: Record<string, string> }).dependencies ?? {}),
  ...((monorepoPackageJson as { devDependencies?: Record<string, string> }).devDependencies ?? {}),
} as Record<string, string>

function getDependencyVersion(name: string) {
  const version = packageDependencies[name]
  if (!version) {
    throw new Error(`未找到依赖 ${name} 的版本信息`)
  }
  return version
}

function getToolingPackageVersion() {
  return `^${version}`
}

function createConfigModule(functionName: string, source: string) {
  return [
    `import { ${functionName} } from '${source}'`,
    '',
    `export default await ${functionName}()`,
    '',
  ].join('\n')
}

function getToolingPackageDependency(toolingPackageName: InitToolingContext['toolingPackageName']) {
  return {
    [toolingPackageName]: getToolingPackageVersion(),
  }
}

function getRootDeps(pkgJson: PackageJson) {
  return {
    ...(pkgJson.dependencies ?? {}),
    ...(pkgJson.devDependencies ?? {}),
  }
}

export function resolveToolingPackageName(pkgJson: PackageJson): InitToolingContext['toolingPackageName'] {
  const deps = getRootDeps(pkgJson)
  if (typeof deps['repoctl'] === 'string' && deps['repoctl'].length > 0) {
    return 'repoctl'
  }
  if (typeof deps['@icebreakers/monorepo'] === 'string' && deps['@icebreakers/monorepo'].length > 0) {
    return '@icebreakers/monorepo'
  }
  return 'repoctl'
}

export function resolveToolingImportSource(
  toolingPackageName: InitToolingContext['toolingPackageName'],
): InitToolingContext['toolingImportSource'] {
  return toolingPackageName === 'repoctl'
    ? 'repoctl/tooling'
    : '@icebreakers/monorepo/tooling'
}

export const initToolingPresets: Record<InitToolingTarget, InitToolingPreset> = {
  'commitlint': {
    target: 'commitlint',
    filepath: 'commitlint.config.ts',
    getContent: ({ toolingImportSource }) => createConfigModule('defineCommitlintConfig', toolingImportSource),
    getDependencies: ({ toolingPackageName }) => ({
      ...getToolingPackageDependency(toolingPackageName),
      '@commitlint/cli': getDependencyVersion('@commitlint/cli'),
      '@icebreakers/commitlint-config': getDependencyVersion('@icebreakers/commitlint-config'),
    }),
  },
  'eslint': {
    target: 'eslint',
    filepath: 'eslint.config.js',
    getContent: ({ toolingImportSource }) => createConfigModule('defineEslintConfig', toolingImportSource),
    getDependencies: ({ toolingPackageName }) => ({
      ...getToolingPackageDependency(toolingPackageName),
      '@icebreakers/eslint-config': getDependencyVersion('@icebreakers/eslint-config'),
      'eslint': getDependencyVersion('eslint'),
    }),
  },
  'stylelint': {
    target: 'stylelint',
    filepath: 'stylelint.config.js',
    getContent: ({ toolingImportSource }) => createConfigModule('defineStylelintConfig', toolingImportSource),
    getDependencies: ({ toolingPackageName }) => ({
      ...getToolingPackageDependency(toolingPackageName),
      '@icebreakers/stylelint-config': getDependencyVersion('@icebreakers/stylelint-config'),
      'stylelint': getDependencyVersion('stylelint'),
    }),
  },
  'lint-staged': {
    target: 'lint-staged',
    filepath: 'lint-staged.config.js',
    getContent: ({ toolingImportSource }) => createConfigModule('defineLintStagedConfig', toolingImportSource),
    getDependencies: ({ toolingPackageName }) => ({
      ...getToolingPackageDependency(toolingPackageName),
      'lint-staged': getDependencyVersion('lint-staged'),
    }),
  },
  'tsconfig': {
    target: 'tsconfig',
    filepath: 'tsconfig.json',
    getContent: async ({ cwd }) => {
      const config = await defineTsconfigConfig({ cwd })
      return `${JSON.stringify(config, undefined, 2)}\n`
    },
    getDependencies: ({ toolingPackageName }) => ({
      ...getToolingPackageDependency(toolingPackageName),
      typescript: getDependencyVersion('typescript'),
    }),
  },
  'vitest': {
    target: 'vitest',
    filepath: 'vitest.config.ts',
    getContent: ({ toolingImportSource }) => [
      `import { defineVitestConfig } from '${toolingImportSource}'`,
      `import { defineConfig } from 'vitest/config'`,
      '',
      'export default defineConfig(async () => await defineVitestConfig())',
      '',
    ].join('\n'),
    getDependencies: ({ toolingPackageName }) => ({
      ...getToolingPackageDependency(toolingPackageName),
      '@vitest/coverage-v8': getDependencyVersion('@vitest/coverage-v8'),
      'vitest': getDependencyVersion('vitest'),
    }),
  },
}
