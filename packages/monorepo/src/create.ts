import process from 'node:process'
import { fileURLToPath } from 'node:url'
import defu from 'defu'
import fs from 'fs-extra'
import path from 'pathe'
import set from 'set-value'
import { logger } from './logger'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// import.meta.dirname for Nodejs >= v20.11.0
// https://nodejs.org/api/esm.html#importmetadirname

const templatesDir = path.join(__dirname, '../templates')

export interface CreateNewProjectOptions {
  name?: string
  cwd?: string
  renameJson?: boolean
}

export async function createNewProject(options?: CreateNewProjectOptions) {
  const defaultTemplate = 'bar'
  const { name, renameJson, cwd } = defu<Required<CreateNewProjectOptions>, CreateNewProjectOptions[]>(options, {
    cwd: process.cwd(),
    name: defaultTemplate,
    renameJson: false,
  })

  const targetTemplate = name
  const from = path.join(templatesDir, defaultTemplate)
  const to = path.join(cwd, targetTemplate)
  const filelist = await fs.readdir(from)
  for (const filename of filelist) {
    if (filename === 'package.json') {
      const sourceJsonPath = path.resolve(from, filename)
      const sourceJson = await fs.readJson(sourceJsonPath)
      set(sourceJson, 'version', '0.0.0')
      set(sourceJson, 'name', path.basename(targetTemplate))
      await fs.outputJson(path.resolve(to, renameJson ? 'package.mock.json' : filename), sourceJson, { spaces: 2 })
    }
    else {
      await fs.copy(path.resolve(from, filename), path.resolve(to, filename))
    }
  }

  logger.success(`${targetTemplate} 项目创建成功！`)
}
