import type { GetWorkspacePackagesOptions } from '../types'
import type { CreateNewProjectOptions } from './create'
import { GitClient } from '../core/git'
import { getWorkspaceData, getWorkspacePackages } from '../core/workspace'
import { cleanProjects } from './clean'
import { createNewProject, getCreateChoices, getTemplateMap, templateMap } from './create'
import { init } from './init'
import { setVscodeBinaryMirror } from './mirror'
import { syncNpmMirror } from './sync'
import { upgradeMonorepo } from './upgrade'

export type {
  CreateNewProjectOptions,
  GetWorkspacePackagesOptions,
}

export {
  cleanProjects,
  createNewProject,
  getCreateChoices,
  getTemplateMap,
  getWorkspaceData,
  getWorkspacePackages,
  GitClient,
  init,
  setVscodeBinaryMirror,
  syncNpmMirror,
  templateMap,
  upgradeMonorepo,
}
