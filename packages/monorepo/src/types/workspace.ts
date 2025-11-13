/**
 * 工作区工具可接收的筛选选项。
 */
export interface GetWorkspacePackagesOptions {
  /**
   * 是否在结果中排除 workspace 根包。
   * @default true
   */
  ignoreRootPackage?: boolean
  /**
   * 是否过滤掉标记为 `private` 的包。
   * @default true
   */
  ignorePrivatePackage?: boolean
  /**
   * 自定义 glob，覆盖 `pnpm-workspace.yaml` 的 `packages` 配置。
   * @default workspace manifest `packages`
   */
  patterns?: string[]
}
