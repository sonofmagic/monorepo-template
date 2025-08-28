import path from 'node:path'
// import { exceljsTest } from './excel'
// import { XLSXTest } from './xlsx'
import { XLSXNextTest } from './xlsx-next'

const targetFile = path.resolve(
  import.meta.dirname,
  './fixtures/test.xlsx',
)

// await exceljsTest(targetFile)
// await XLSXTest(targetFile)
await XLSXNextTest(targetFile)
