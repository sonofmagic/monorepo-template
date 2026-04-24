/**
 * 升级时注入到 package.json 的脚本命令集合，保证常用脚本齐全。
 */
export const scripts = {
  'setup': 'repoctl setup',
  'new': 'repoctl new',
  'check': 'repoctl check',
  'sync': 'repoctl sync',
  'clean:repo': 'repoctl clean',
  'mirror': 'repoctl mirror',
  'script:init': 'repoctl init',
  'script:sync': 'repoctl sync',
  'script:clean': 'repoctl clean',
  'script:mirror': 'repoctl mirror',
  'commitlint': 'commitlint --edit',
}

export const scriptsEntries = Object.entries(scripts)
