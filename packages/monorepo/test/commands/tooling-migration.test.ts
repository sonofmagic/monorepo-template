import { describe, expect, it } from 'vitest'
import { hasLegacyToolingReference, migrateLegacyToolingReferences } from '@/commands/tooling-migration'

describe('tooling migration', () => {
  it('migrates ESM commitlint config imports to repoctl/tooling', () => {
    const source = [
      'import { icebreaker } from \'@icebreakers/commitlint-config\'',
      '',
      'export default icebreaker({',
      '  rules: {',
      '    \'subject-case\': [0],',
      '  },',
      '})',
      '',
    ].join('\n')

    expect(hasLegacyToolingReference(source)).toBe(true)
    expect(migrateLegacyToolingReferences(source)).toMatchInlineSnapshot(`
      "import { defineCommitlintConfig } from 'repoctl/tooling'

      export default await defineCommitlintConfig({ options: {
        rules: {
          'subject-case': [0],
        },
      } })
      "
    `)
  })

  it('migrates TypeScript ESLint configs with top-level await and extra flat configs', () => {
    const source = [
      'import { icebreaker as eslintConfig } from \'@icebreakers/eslint-config\'',
      '',
      'const baseOptions = {',
      '  ignores: [\'dist/**\'],',
      '}',
      'const extraFlatConfigs = [{ rules: { \'no-console\': \'off\' } }]',
      '',
      'export default await eslintConfig(baseOptions, ...extraFlatConfigs)',
      '',
    ].join('\n')

    expect(migrateLegacyToolingReferences(source)).toMatchInlineSnapshot(`
      "import { defineEslintConfig } from 'repoctl/tooling'

      const baseOptions = {
        ignores: ['dist/**'],
      }
      const extraFlatConfigs = [{ rules: { 'no-console': 'off' } }]

      export default await defineEslintConfig(baseOptions, ...extraFlatConfigs)
      "
    `)
  })

  it('migrates JS stylelint configs and preserves object semantics', () => {
    const source = [
      'import { icebreaker } from "@icebreakers/stylelint-config";',
      '',
      'export default icebreaker({',
      '  rules: {',
      '    "selector-class-pattern": null,',
      '  },',
      '});',
      '',
    ].join('\n')

    expect(migrateLegacyToolingReferences(source)).toMatchInlineSnapshot(`
      "import { defineStylelintConfig } from 'repoctl/tooling'

      export default await defineStylelintConfig({ options: {
        rules: {
          "selector-class-pattern": null,
        },
      } });
      "
    `)
  })

  it('keeps complex non-wrapper configs unchanged', () => {
    const source = [
      'import { icebreaker } from \'@icebreakers/eslint-config\'',
      '',
      'const base = icebreaker({ ignores: [\'dist/**\'] })',
      'export default base.append({ rules: { semi: \'off\' } })',
      '',
    ].join('\n')

    expect(migrateLegacyToolingReferences(source)).toBe(source)
  })
})
