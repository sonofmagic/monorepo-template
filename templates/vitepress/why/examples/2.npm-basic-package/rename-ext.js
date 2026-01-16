// rename-ext.js
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const [dir, fromExt, toExt] = process.argv.slice(2)

function renameFilesRecursively(currentPath) {
  const entries = fs.readdirSync(currentPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry.name)

    if (entry.isDirectory()) {
      renameFilesRecursively(fullPath)
    }
    else if (entry.isFile() && entry.name.endsWith(fromExt)) {
      const newPath = fullPath.slice(0, -fromExt.length) + toExt
      fs.renameSync(fullPath, newPath)
    }
  }
}

renameFilesRecursively(dir)
