import type { GetWorkspacePackagesOptions } from '../types'
import type { AgenticTemplateFormat, AgenticTemplateTask, GenerateAgenticTemplateOptions } from './ai'
import type { RecommendedCheckOptions } from './check'
import type { CreateNewProjectOptions } from './create'
import type { SkillTarget, SyncSkillsOptions } from './skills'
import type { CommitMsgVerifyOptions, PreCommitVerifyOptions, PrePushVerifyOptions, StagedTypecheckOptions, VerifyCommandOptions } from './verify'
import { GitClient } from '../core/git'
import { getWorkspaceData, getWorkspacePackages } from '../core/workspace'
import { createTimestampFolderName, defaultAgenticBaseDir, generateAgenticTemplate, generateAgenticTemplates, loadAgenticTasks } from './ai'
import { runRecommendedCheck } from './check'
import { cleanProjects } from './clean'
import { createNewProject, getCreateChoices, getTemplateMap, templateMap } from './create'
import { init, initMetadata, initTooling, initToolingTargets, normalizeInitToolingTargets } from './init'
import { setVscodeBinaryMirror } from './mirror'
import { getSkillTargetPaths, skillTargets, syncSkills } from './skills'
import { upgradeMonorepo } from './upgrade'
import { verifyCommitMsg, verifyPreCommit, verifyPrePush, verifyStagedTypecheck } from './verify'

export type {
  AgenticTemplateFormat,
  AgenticTemplateTask,
  CommitMsgVerifyOptions,
  CreateNewProjectOptions,
  GenerateAgenticTemplateOptions,
  GetWorkspacePackagesOptions,
  PreCommitVerifyOptions,
  PrePushVerifyOptions,
  RecommendedCheckOptions,
  SkillTarget,
  StagedTypecheckOptions,
  SyncSkillsOptions,
  VerifyCommandOptions,
}

export {
  cleanProjects,
  createNewProject,
  createTimestampFolderName,
  defaultAgenticBaseDir,
  generateAgenticTemplate,
  generateAgenticTemplates,
  getCreateChoices,
  getSkillTargetPaths,
  getTemplateMap,
  getWorkspaceData,
  getWorkspacePackages,
  GitClient,
  init,
  initMetadata,
  initTooling,
  initToolingTargets,
  loadAgenticTasks,
  normalizeInitToolingTargets,
  runRecommendedCheck,
  setVscodeBinaryMirror,
  skillTargets,
  syncSkills,
  templateMap,
  upgradeMonorepo,
  verifyCommitMsg,
  verifyPreCommit,
  verifyPrePush,
  verifyStagedTypecheck,
}
