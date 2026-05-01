import type { GetWorkspacePackagesOptions } from '../types'
import type { AgenticTemplateFormat, AgenticTemplateTask, GenerateAgenticTemplateOptions } from './ai'
import type { RecommendedCheckMode, RecommendedCheckOptions, RecommendedCheckPlan, RecommendedCheckPlanCommand } from './check'
import type { CreateNewProjectOptions, CreateNewProjectPlan } from './create'
import type { DoctorCheck, DoctorReport, DoctorStatus, DoctorSummary } from './doctor'
import type { SkillTarget, SyncSkillsOptions } from './skills'
import type { CheckTemplatesOptions, TemplateHealthCheck, TemplateHealthReport, TemplateHealthStatus, TemplateHealthSummary } from './templates'
import type { CommitMsgVerifyOptions, PreCommitVerifyOptions, PrePushVerifyOptions, StagedTypecheckOptions, VerifyCommandOptions } from './verify'
import { GitClient } from '../core/git'
import { getWorkspaceData, getWorkspacePackages } from '../core/workspace'
import { createTimestampFolderName, defaultAgenticBaseDir, generateAgenticTemplate, generateAgenticTemplates, loadAgenticTasks } from './ai'
import { resolveRecommendedCheckPlan, runRecommendedCheck } from './check'
import { cleanProjects } from './clean'
import { createNewProject, getCreateChoices, getTemplateMap, resolveCreateNewProjectPlan, templateMap } from './create'
import { runDoctor } from './doctor'
import { init, initMetadata, initTooling, initToolingTargets, normalizeInitToolingTargets } from './init'
import { setVscodeBinaryMirror } from './mirror'
import { getSkillTargetPaths, skillTargets, syncSkills } from './skills'
import { checkTemplates } from './templates'
import { upgradeMonorepo } from './upgrade'
import { verifyCommitMsg, verifyPreCommit, verifyPrePush, verifyStagedTypecheck } from './verify'

export type {
  AgenticTemplateFormat,
  AgenticTemplateTask,
  CheckTemplatesOptions,
  CommitMsgVerifyOptions,
  CreateNewProjectOptions,
  CreateNewProjectPlan,
  DoctorCheck,
  DoctorReport,
  DoctorStatus,
  DoctorSummary,
  GenerateAgenticTemplateOptions,
  GetWorkspacePackagesOptions,
  PreCommitVerifyOptions,
  PrePushVerifyOptions,
  RecommendedCheckMode,
  RecommendedCheckOptions,
  RecommendedCheckPlan,
  RecommendedCheckPlanCommand,
  SkillTarget,
  StagedTypecheckOptions,
  SyncSkillsOptions,
  TemplateHealthCheck,
  TemplateHealthReport,
  TemplateHealthStatus,
  TemplateHealthSummary,
  VerifyCommandOptions,
}

export {
  checkTemplates,
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
  resolveCreateNewProjectPlan,
  resolveRecommendedCheckPlan,
  runDoctor,
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
