import crypto from 'node:crypto'
import { logger } from '../logger'

export function getFileHash(data: crypto.BinaryLike) {
  const hashSum = crypto.createHash('md5')
  hashSum.update(data)
  return hashSum.digest('hex')
}

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
