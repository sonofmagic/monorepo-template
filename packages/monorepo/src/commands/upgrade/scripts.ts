/**
 * 升级时注入到 package.json 的脚本命令集合，保证常用脚本齐全。
 */
export const scripts = {
  'script:init': 'monorepo init',
  'script:sync': 'monorepo sync',
  'script:clean': 'monorepo clean',
  'script:mirror': 'monorepo mirror',
  'commitlint': 'commitlint --edit',
}

export const scriptsEntries = Object.entries(scripts)
