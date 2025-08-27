import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import Database from 'better-sqlite3'
import ExcelJS from 'exceljs'
import { logMemoryUsage, logWorksheets } from './utils'

const args = process.argv.slice(2)
const usage = args[0]

logMemoryUsage()
const workbook = new ExcelJS.Workbook()
const targetFile = path.resolve(
  import.meta.dirname,
  './fixtures/test.xlsx',
)
console.time('readFile')

if (usage === 'stream') {
  const stream = fs.createReadStream(targetFile, {
    // 设定每次读取的块大小（例如：10MB = 10 * 1024 * 1024 字节）
    highWaterMark: 10 * 1024 * 1024,
  })

  await workbook.xlsx.read(stream)
}
else {
  await workbook.xlsx.readFile(
    targetFile,
  )
}

logMemoryUsage()

console.timeEnd('readFile')

logWorksheets(workbook.worksheets)

const db = new Database(
  path.resolve(
    import.meta.dirname,
    './fixtures/test.db',
  ),
  {

  },
)
// —— 关键 PRAGMA（临时任务、追求速度优先）——
db.pragma('journal_mode = OFF') // 关闭日志，最快（崩溃可能损坏，不影响临时库）
db.pragma('synchronous = OFF') // 关闭同步，显著提速
db.pragma('temp_store = MEMORY') // 临时对象尽量在内存
db.pragma('cache_size = -1048576') // 以 KB 计；这里约 1GB page cache，上下按需调整
db.pragma('page_size = 4096') // 默认 4096，通常保持即可
db.pragma('mmap_size = 268435456') // 256MB 内存映射，按机器试调
// 注意：先设置 page_size，再建表再写入；已写入后再改 page_size 不生效
