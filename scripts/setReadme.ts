import fs from 'fs-extra'
import path from 'pathe'
import type { Context } from './context'

async function getRows(ctx: Context) {
  const { projects, git, cwd } = ctx
  const gitUrl = await git.getGitUrl()
  const rows: string[] = []
  if (gitUrl) {
    rows.push(`# ${gitUrl.name}\n`)
  }
  rows.push('## Projects\n')
  for (const project of projects) {
    const p = path.relative(cwd, project.rootDirRealPath)
    p && rows.push(`- [${project.manifest.name}](${p}) ${project.manifest.description ? `- ${project.manifest.description}` : ''}`)
  }

  return rows
}

export default async function (ctx: Context) {
  const rows = await getRows(ctx)
  await fs.writeFile(path.resolve(ctx.cwd, 'README.md'), `${rows.join('\n')}\n`)
}
