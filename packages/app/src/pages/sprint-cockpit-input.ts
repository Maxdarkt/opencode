import type { RepositoryTopologyRepositoryInput, TaskBindingIdentity } from "@opencode-ai/sdk/v2/client"

const identity = (taskID: string, sessionSuffix: string, worktree: string, branch: string): TaskBindingIdentity => ({
  mtTaskID: taskID,
  apexExternalRef: `.project/tasks/${taskID}`,
  sessionID: `ses_da10_005_${sessionSuffix}`,
  projectID: "project-da10-005-cockpit",
  location: { directory: worktree },
  checkout: {
    repository: "/Users/leanbot/Documents/40_Daidalon/Daidalon",
    branch,
    worktree,
    head: "unknown-head",
  },
})

const taskA = identity(
  "DA10-005-A",
  "a",
  "/Users/leanbot/Documents/40_Daidalon/features/tasks/DA10-005-cockpit-sprint",
  "task/DA10-005-cockpit-sprint",
)

const taskB = identity(
  "DA10-005-B",
  "b",
  "/Users/leanbot/Documents/40_Daidalon/features/tasks/DA10-005-companion",
  "task/DA10-005-companion",
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
      sourceRefs: ["dev", "task/DA10-005-cockpit-sprint", "task/DA10-005-companion"],
      mergeTarget: "dev",
    } satisfies RepositoryTopologyRepositoryInput,
  ],
}
