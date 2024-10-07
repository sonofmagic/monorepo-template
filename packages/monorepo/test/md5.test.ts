import { getFileHash, isFileChanged } from '@/md5'
import CI from 'ci-info'
import fs from 'fs-extra'
import path from 'pathe'
// windows 和 linux/macos 计算不一致，应该是 \r\n 和 \n 导致的
describe.skipIf(CI.isCI)('md5', () => {
  const testFilePath = path.resolve(import.meta.dirname, '../.gitignore')
  it('getFileHash', async () => {
    expect(
      getFileHash(await fs.readFile(
        testFilePath,
        'binary',
      )),
    ).toBe('58f5c6d21f1bb0f8f8da62b3d1d76e5c')
  })

  it('isFileChanged case 0', async () => {
    const str = await fs.readFile(
      testFilePath,
      'utf8',
    )
    expect(
      isFileChanged(
        str,
        `${str}\n`,
      ),
    ).toBe(true)
  })

  it('isFileChanged case 1', async () => {
    const str = await fs.readFile(
      testFilePath,
      'utf8',
    )
    expect(
      isFileChanged(
        str,
        str,
      ),
    ).toBe(false)
  })

  it('isFileChanged case 2', async () => {
    const str = await fs.readFile(
      testFilePath,
      'utf8',
    )
    const strBuf = await fs.readFile(
      testFilePath,
    )
    expect(
      isFileChanged(
        str,
        strBuf,
      ),
    ).toBe(false)
  })
})
