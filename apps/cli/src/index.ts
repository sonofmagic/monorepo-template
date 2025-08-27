import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import Database from 'better-sqlite3'
import boxen from 'boxen'
import ExcelJS from 'exceljs'

export function logMemoryUsage() {
  const memoryUsage = process.memoryUsage()
  const arr = [
    'Memory Usage (in MB):',
    `RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
    `Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    `Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    `External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
  ]
  console.log(boxen(arr.join('\n'), { padding: 1 }))
}

export function logCpuUsage() {
  const arr = [
    'System Info:',
    `Total Memory: ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
    `Free Memory: ${(os.freemem() / 1024 / 1024).toFixed(2)} MB`,
    `CPU Cores: ${os.cpus().length}`,
    `System Architecture: ${os.arch()}`,
  ]
  console.log(boxen(arr.join('\n'), { padding: 1 }))
}
logMemoryUsage()
const workbook = new ExcelJS.Workbook()

await workbook.xlsx.readFile(
  path.resolve(
    import.meta.dirname,
    './fixtures/test.xlsx',
  ),
)
logMemoryUsage()

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
