import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { name, version } from '../package.json'

export {
  name,
  version,
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// import.meta.dirname for Nodejs >= v20.11.0
// https://nodejs.org/api/esm.html#importmetadirname

export const templatesDir = path.join(__dirname, '../templates')

export const assetsDir = path.join(__dirname, '../assets')
