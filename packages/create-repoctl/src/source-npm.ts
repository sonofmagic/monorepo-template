import { scaffoldWorkspace } from '@icebreakers/monorepo-templates'

export async function scaffoldFromNpm(targetDir: string, selectedTemplates: string[], force = false) {
  await scaffoldWorkspace({
    targetDir,
    templateKeys: selectedTemplates,
    targetMode: 'prepare',
    force,
  })
}
