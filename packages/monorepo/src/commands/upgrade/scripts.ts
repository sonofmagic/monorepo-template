/**
 * 升级时注入到 package.json 的脚本命令集合，保证常用脚本齐全。
 */
export const scripts = {
  'script:init': 'repoctl init',
  'script:clean': 'repoctl clean',
  'script:mirror': 'repoctl mirror',
  'commitlint': 'commitlint --edit',
}

export const scriptsEntries = Object.entries(scripts)
