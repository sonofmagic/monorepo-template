import type { GetWorkspacePackagesOptions } from '../types'
import type { AgenticTemplateFormat, AgenticTemplateTask, GenerateAgenticTemplateOptions } from './ai'
import type { CreateNewProjectOptions } from './create'
import { GitClient } from '../core/git'
import { getWorkspaceData, getWorkspacePackages } from '../core/workspace'
import { generateAgenticTemplate, generateAgenticTemplates, loadAgenticTasks } from './ai'
import { cleanProjects } from './clean'
import { createNewProject, getCreateChoices, getTemplateMap, templateMap } from './create'
import { init } from './init'
import { setVscodeBinaryMirror } from './mirror'
import { syncNpmMirror } from './sync'
import { upgradeMonorepo } from './upgrade'

export type {
  AgenticTemplateFormat,
  AgenticTemplateTask,
  CreateNewProjectOptions,
  GenerateAgenticTemplateOptions,
  GetWorkspacePackagesOptions,
}

export {
  cleanProjects,
  createNewProject,
  generateAgenticTemplate,
  generateAgenticTemplates,
  getCreateChoices,
  getTemplateMap,
  getWorkspaceData,
  getWorkspacePackages,
  GitClient,
  init,
  loadAgenticTasks,
  setVscodeBinaryMirror,
  syncNpmMirror,
  templateMap,
  upgradeMonorepo,
}
