import { getFileHash, hasFileBufferChanged, hasFileChanged } from '@/md5'
import fs from 'fs-extra'
import path from 'pathe'

describe('md5', () => {
  const testFilePath = path.resolve(import.meta.dirname, '../.gitignore')
  it('getFileHash', async () => {
    expect(
      getFileHash(await fs.readFile(
        testFilePath,
      )),
    ).toBe('c94e5b2028db1ba639d2fe1593eb6b37')
  })

  it('hasFileBufferChanged case 0', async () => {
    const str = await fs.readFile(
      testFilePath,
      'utf8',
    )
    expect(
      hasFileBufferChanged(
        str,
        `${str}\n`,
      ),
    ).toBe(true)
  })

  it('hasFileBufferChanged case 1', async () => {
    const str = await fs.readFile(
      testFilePath,
      'utf8',
    )
    expect(
      hasFileBufferChanged(
        str,
        str,
      ),
    ).toBe(false)
  })

  it('hasFileChanged case 0', async () => {
    const expected = await hasFileChanged(testFilePath, testFilePath)
    expect(
      expected,
    ).toBe(false)
  })
})
