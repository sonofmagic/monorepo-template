import type ExcelJS from 'exceljs'
import os from 'node:os'
import process from 'node:process'
import boxen from 'boxen'

export function logMemoryUsage() {
  const memoryUsage = process.memoryUsage()
  const arr = [
    // RSS：这个值包括了堆、栈、代码段等所有的内存。
    // Heap Total：这是 Node.js 中所有 JavaScript 对象的总内存大小。
    // Heap Used：这表示当前已经使用的堆内存大小。
    // External：表示由 Node.js 使用的外部内存（比如 Buffer 或其他非 V8 管理的内存）。
    'Memory Usage (in MB):',
    `RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
    `Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    `Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    `External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
  ]
  console.log(boxen(arr.join('\n'), { padding: 0 }))
}

export function logCpuUsage() {
  const arr = [
    'System Info:',
    `Total Memory: ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
    `Free Memory: ${(os.freemem() / 1024 / 1024).toFixed(2)} MB`,
    `CPU Cores: ${os.cpus().length}`,
    `System Architecture: ${os.arch()}`,
  ]
  console.log(boxen(arr.join('\n'), { padding: 0 }))
}

export function logWorksheets(worksheets: ExcelJS.Worksheet[]) {
  const arr = worksheets.map((worksheet) => {
    return boxen(
      [
        `Name: ${worksheet.name}`,
        `Rows: ${worksheet.rowCount}`,
        `Columns: ${worksheet.columnCount}`,
        // `Dimensions: ${worksheet.dimensions}`,
        `ActualRowCount: ${worksheet.actualRowCount}`,
        `ActualColumnCount: ${worksheet.actualColumnCount}`,
      ].join('\n'),
      {
        padding: 0,
      },
    )
  })
  console.log(boxen(arr.join('\n'), { padding: 0 }))
}
