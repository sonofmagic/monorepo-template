import type { Buffer } from 'node:buffer'
import Database from 'better-sqlite3'

export function createDatebase(filename?: string | Buffer<ArrayBufferLike>) {
  const db = new Database(
    filename,
  )
  // —— 关键 PRAGMA（临时任务、追求速度优先）——
  db.pragma('journal_mode = OFF') // 关闭日志，最快（崩溃可能损坏，不影响临时库）
  db.pragma('synchronous = OFF') // 关闭同步，显著提速
  db.pragma('temp_store = MEMORY') // 临时对象尽量在内存
  db.pragma('cache_size = -1048576') // 以 KB 计；这里约 1GB page cache，上下按需调整
  db.pragma('page_size = 4096') // 默认 4096，通常保持即可
  db.pragma('mmap_size = 268435456') // 256MB 内存映射，按机器试调
// 注意：先设置 page_size，再建表再写入；已写入后再改 page_size 不生效
}
