/**
 * 升级时注入到 package.json 的脚本命令集合，保证常用脚本齐全。
 */
export const scripts = {
  'repo:init': 'repo init',
  'repo:new': 'repo new',
  'repo:check': 'repo check',
  'repo:doctor': 'repo doctor',
  'commitlint': 'commitlint --edit',
}

export const scriptsEntries = Object.entries(scripts)
