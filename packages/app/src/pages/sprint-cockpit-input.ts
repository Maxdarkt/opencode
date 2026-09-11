import type { RepositoryTopologyRepositoryInput, TaskBindingIdentity } from "@opencode-ai/sdk/v2/client"

const apexA = ".project/tasks/DA40-015-candidate-integree-sprint-4"
const branchA = "task/DA40-015-candidate-integree"
const branchB = "task/DA40-015-B"

const identity = (
  taskID: string,
  sessionSuffix: string,
  worktree: string,
  branch: string,
  head: string,
  apexExternalRef: string,
): TaskBindingIdentity => ({
  mtTaskID: taskID,
  apexExternalRef,
  sessionID: `ses_da40_015_${sessionSuffix}`,
  projectID: "project-da40-015-cockpit",
  location: { directory: worktree },
  checkout: {
    repository: "/Users/leanbot/Documents/40_Daidalon/Daidalon",
    branch,
    worktree,
    head,
  },
})

const taskA = identity(
  "DA40-015-A",
  "a",
  "/Users/leanbot/Documents/40_Daidalon/features/tasks/DA40-015-candidate-integree",
  branchA,
  "5d18386f1",
  apexA,
)

const taskB = identity(
  "DA40-015-B",
  "b",
  `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA40-015-candidate-integree/${apexA}/fixtures/checkout-b`,
  branchB,
  "8cda39f46",
  `${apexA}/fixtures/checkout-b`,
)

export const sprintCockpitInput = {
  sprintID: "da-release-0.1-sprint-4",
  identities: [taskA, taskB] as const,
  ownership: {
    entries: [{ identity: taskA }, { identity: taskB }],
  },
  repositories: [
    {
      root: "/Users/leanbot/Documents/40_Daidalon/Daidalon",
      sourceRefs: [branchA, branchB, "dev"],
      mergeTarget: "dev",
    } satisfies RepositoryTopologyRepositoryInput,
  ],
}
