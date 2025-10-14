/**
 * 判断是否为可忽略的文件系统错误。
 * - ENOENT: 文件已被删除
 * - EBUSY: Windows 中资源被系统占用
 */
export function isIgnorableFsError(error: unknown): error is NodeJS.ErrnoException {
  if (!error) {
    return false
  }
  const code = (error as NodeJS.ErrnoException).code
  return code === 'ENOENT' || code === 'EBUSY' || code === 'EEXIST'
}
