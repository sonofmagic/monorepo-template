import { createContext } from './context'
import setPkgJson from './setPkgJson'
import setReadme from './setReadme'

export async function init(cwd: string) {
  const ctx = await createContext(cwd)

  await setPkgJson(ctx)
  await setReadme(ctx)
}
