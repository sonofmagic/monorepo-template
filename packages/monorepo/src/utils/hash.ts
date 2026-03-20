import crypto from 'node:crypto'
import { logger } from '../core/logger'

/**
 * 生成给定内容的 md5 摘要。
 *
 * @param data 任意 `crypto.BinaryLike` 内容
 * @returns 32 位十六进制 md5 字符串
 */
export function getFileHash(data: crypto.BinaryLike) {
  const hashSum = crypto.createHash('md5')
  hashSum.update(data)
  return hashSum.digest('hex')
}

/**
 * 对比两段内容的 md5，判断内容是否发生变化。
 *
 * @param src 当前内容
 * @param dest 旧内容
 * @returns 两者 md5 不一致时返回 `true`
 */
export function isFileChanged(src: crypto.BinaryLike, dest: crypto.BinaryLike) {
  try {
    const currentHash = getFileHash(src)
    const previousHash = getFileHash(dest)
    return currentHash !== previousHash
  }
  catch (err) {
    logger.error('Error calculating file hash:', err)
    return false
  }
}
