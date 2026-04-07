import type { CreateNewProjectOptions } from '../../../commands'

export type CreateIntent
  = 'library'
    | 'web-app'
    | 'api-service'
    | 'docs-site'
    | 'cli-tool'

export interface CreateIntentChoice {
  value: CreateIntent
  name: string
  description: string
  defaultTemplate: NonNullable<CreateNewProjectOptions['type']>
  defaultBaseDir: 'packages' | 'apps'
}

export const createIntentChoices: CreateIntentChoice[] = [
  {
    value: 'library',
    name: 'Library',
    description: '创建一个可发布的库包',
    defaultTemplate: 'tsdown',
    defaultBaseDir: 'packages',
  },
  {
    value: 'web-app',
    name: 'Web App',
    description: '创建一个前后端一体的 Web 应用',
    defaultTemplate: 'vue-hono',
    defaultBaseDir: 'apps',
  },
  {
    value: 'api-service',
    name: 'API Service',
    description: '创建一个 Hono API 服务',
    defaultTemplate: 'hono-server',
    defaultBaseDir: 'apps',
  },
  {
    value: 'docs-site',
    name: 'Docs Site',
    description: '创建一个文档站点',
    defaultTemplate: 'vitepress',
    defaultBaseDir: 'apps',
  },
  {
    value: 'cli-tool',
    name: 'CLI Tool',
    description: '创建一个命令行工具',
    defaultTemplate: 'cli',
    defaultBaseDir: 'apps',
  },
] as const
