export interface PackageJsonPerson {
  name?: string
  email?: string
  url?: string
}

export interface PackageJsonRepository {
  type?: string
  url?: string
  directory?: string
}

export interface PackageJsonBugs {
  url?: string
  email?: string
}

export type PackageJsonExports = unknown

export interface PackageJson extends Record<string, unknown> {
  name?: string
  version?: string
  private?: boolean
  type?: string
  description?: string
  author?: string | PackageJsonPerson
  repository?: string | PackageJsonRepository
  bugs?: string | PackageJsonBugs
  homepage?: string
  license?: string
  packageManager?: string
  scripts?: Record<string, string | undefined>
  dependencies?: Record<string, string | undefined>
  devDependencies?: Record<string, string | undefined>
  peerDependencies?: Record<string, string | undefined>
  optionalDependencies?: Record<string, string | undefined>
  engines?: Record<string, string | undefined>
  publishConfig?: Record<string, unknown>
  bin?: string | Record<string, string | undefined>
  exports?: PackageJsonExports
}
