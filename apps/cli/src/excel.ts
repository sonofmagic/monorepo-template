import fs from 'node:fs'
import process from 'node:process'
import ExcelJS from 'exceljs'
import { logMemoryUsage, logWorksheets } from './utils'

const args = process.argv.slice(2)
const isUsageStream = args.includes('usage=stream')

async function exceljsRead(targetFile: string) {
  const workbook = new ExcelJS.Workbook()
  if (isUsageStream) {
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
  return workbook
}

export async function exceljsTest(targetFile: string) {
  logMemoryUsage()

  console.time('readFile')

  const workbook = await exceljsRead(targetFile)

  logMemoryUsage()

  console.timeEnd('readFile')

  logWorksheets(workbook.worksheets)
}
