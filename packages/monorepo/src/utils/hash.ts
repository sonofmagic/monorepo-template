import crypto from 'node:crypto'
import { logger } from '../core/logger'

/**
 * 生成给定二进制内容的 md5 摘要，用于快速比较文件内容。
 */
export function getFileHash(data: crypto.BinaryLike) {
  const hashSum = crypto.createHash('md5')
  hashSum.update(data)
  return hashSum.digest('hex')
}

/**
 * 对比两个文件的 md5，如果不一致则认为内容有变化。
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
