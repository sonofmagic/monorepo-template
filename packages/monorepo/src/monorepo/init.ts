import { createContext } from './context'
import setChangeset from './setChangeset'
import setPkgJson from './setPkgJson'
import setReadme from './setReadme'

export async function init(cwd: string) {
  const ctx = await createContext(cwd)
  await setChangeset(ctx)
  await setPkgJson(ctx)
  await setReadme(ctx)
}
