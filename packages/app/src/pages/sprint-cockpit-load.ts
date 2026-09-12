import type { OpencodeClient } from "@opencode-ai/sdk/v2/client"
import { sprintCockpitInput } from "./sprint-cockpit-input"
import { inaccessibleCockpitView, mapCockpitView } from "./sprint-cockpit-mapper"

export async function loadSprintCockpit(global: OpencodeClient["global"]) {
  const ownership = await global.ownership(
    { taskOwnershipInput: sprintCockpitInput.ownership },
    { throwOnError: false },
  )
  if (!ownership.response?.ok || !ownership.data) return inaccessibleCockpitView()
  const topology = await global.topology(
    {
      repositoryTopologyInput: {
        ownership: ownership.data,
        repositories: [...sprintCockpitInput.repositories],
      },
    },
    { throwOnError: false },
  )
  const metrics = await global.metrics(
    {
      taskMetricsRequest: {
        type: "sprint",
        sprintID: sprintCockpitInput.sprintID,
        taskIDs: sprintCockpitInput.identities.map((identity) => identity.mtTaskID),
      },
    },
    { throwOnError: false },
  )
  return mapCockpitView({
    ownership: ownership.data,
    topology: topology.response?.ok ? topology.data : undefined,
    metrics: metrics.response?.ok ? metrics.data : undefined,
    source: "live",
  })
}
