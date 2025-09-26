import set from 'set-value'
import { chinaMirrorsEnvs } from './sources'

/**
 * 在 vscode 里面设置镜像下载地址的环境变量，避免下载缓慢
 */
export function setMirror(obj: object, envs: Record<string, string> = chinaMirrorsEnvs) {
  const platforms = ['linux', 'windows', 'osx']
  const prefix = 'terminal.integrated.env'
  if (typeof obj === 'object' && obj) {
    for (const platform of platforms) {
      set(obj, [prefix, platform].join('.').replaceAll('.', '\\.'), envs)
    }
  }
}
