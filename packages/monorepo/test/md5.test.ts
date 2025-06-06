import CI from 'ci-info'
import fs from 'fs-extra'
import path from 'pathe'
import { getFileHash, isFileChanged } from '@/utils/md5'

// windows 和 linux/macos 计算不一致，应该是 \r\n 和 \n 导致的
describe.skipIf(CI.isCI)('md5', () => {
  const testFilePath = path.resolve(import.meta.dirname, '../.gitignore')
  it('getFileHash', async () => {
    expect(
      getFileHash(await fs.readFile(
        testFilePath,
        'binary',
      )),
    ).toBeTypeOf('string')
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
