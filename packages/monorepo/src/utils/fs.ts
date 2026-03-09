import { access, cp, mkdir, mkdtemp, open, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'pathe'

export interface JsonWriteOptions {
  spaces?: number
}

function stringifyJson(data: unknown, options?: JsonWriteOptions) {
  return JSON.stringify(data, undefined, options?.spaces)
}

async function ensureParentDir(targetPath: string) {
  await mkdir(path.dirname(targetPath), { recursive: true })
}

export async function pathExists(targetPath: string) {
  try {
    await access(targetPath)
    return true
  }
  catch {
    return false
  }
}

export const exists = pathExists

export async function ensureDir(targetPath: string) {
  await mkdir(targetPath, { recursive: true })
}

export async function ensureFile(targetPath: string) {
  await ensureParentDir(targetPath)
  const handle = await open(targetPath, 'a')
  await handle.close()
}

export async function remove(targetPath: string) {
  await rm(targetPath, {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 100,
  })
}

export async function copy(sourcePath: string, targetPath: string) {
  await cp(sourcePath, targetPath, {
    recursive: true,
    force: true,
  })
}

export async function outputFile(targetPath: string, data: Parameters<typeof writeFile>[1], options?: Parameters<typeof writeFile>[2]) {
  await ensureParentDir(targetPath)
  await writeFile(targetPath, data, options)
}

export async function readJson<T = any>(targetPath: string) {
  return JSON.parse(await readFile(targetPath, 'utf8')) as T
}

export const readJSON = readJson

export async function writeJson(targetPath: string, data: unknown, options?: JsonWriteOptions) {
  await writeFile(targetPath, stringifyJson(data, options), 'utf8')
}

export const writeJSON = writeJson

export async function outputJson(targetPath: string, data: unknown, options?: JsonWriteOptions) {
  await ensureParentDir(targetPath)
  await writeJson(targetPath, data, options)
}

export const outputJSON = outputJson

/**
 * 判断是否为可忽略的文件系统错误。
 * - ENOENT: 文件已被删除
 * - EBUSY: Windows 中资源被系统占用
 */
export function isIgnorableFsError(error: unknown): error is NodeJS.ErrnoException {
  if (!error) {
    return false
  }
  const code = (error as NodeJS.ErrnoException).code
  return code === 'ENOENT' || code === 'EBUSY' || code === 'EEXIST'
}

const fs = {
  copy,
  ensureDir,
  ensureFile,
  exists,
  mkdtemp,
  outputFile,
  outputJSON,
  outputJson,
  pathExists,
  readFile,
  readJSON,
  readJson,
  remove,
  stat,
  writeFile,
  writeJSON,
  writeJson,
} as const

export default fs
