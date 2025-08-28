import type Stream from 'node:stream'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import process from 'node:process'
import XLSX from 'xlsx'
import { logMemoryUsage } from './utils'

const args = process.argv.slice(2)
const isUsageStream = args.includes('usage=stream')

function async_RS(stream: Stream): Promise<XLSX.WorkBook> {
  return new Promise((res, rej) => {
    const buffers: (Buffer<ArrayBufferLike>) [] = []
    stream.on('data', (data) => {
      buffers.push(data)
    })
    stream.on('end', () => {
      const buf = Buffer.concat(buffers)
      const wb = XLSX.read(buf)
      res(wb)
    })
    stream.on('error', (err) => {
      rej(err)
    })
  })
}
async function XLSXRead(targetFile: string) {
  let workbook!: XLSX.WorkBook
  if (isUsageStream) {
    const stream = fs.createReadStream(targetFile, {
    // 设定每次读取的块大小（例如：10MB = 10 * 1024 * 1024 字节）
      highWaterMark: 10 * 1024 * 1024,
    })

    workbook = await async_RS(stream)
  }
  else {
    workbook = await XLSX.readFile(
      targetFile,
    )
  }
  return workbook
}

export async function XLSXTest(targetFile: string) {
  logMemoryUsage()

  console.time('readFile')

  const workbook = await XLSXRead(targetFile)

  logMemoryUsage()

  console.timeEnd('readFile')
  console.log(workbook.SheetNames)

  // logWorksheets(workbook.worksheets)
}
