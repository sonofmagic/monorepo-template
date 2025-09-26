/**
 * 逃逸正则表达式中所有特殊字符，避免被当做模式解析。
 */
export function escapeStringRegexp(str: string) {
  return str
    .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
    .replace(/-/g, '\\x2d')
}

/**
 * 判断字符串是否命中任意一个正则，用于过滤要同步的资产文件。
 */
export function isMatch(str: string, arr: RegExp[]) {
  for (const reg of arr) {
    if (reg.test(str)) {
      return true
    }
  }
  return false
}
