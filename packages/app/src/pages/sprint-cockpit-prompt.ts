import type { DisplayFact } from "./sprint-cockpit-mapper"

export function cockpitPromptText(task: {
  id: string
  worktreeLabel: Pick<DisplayFact, "text" | "state">
  head: Pick<DisplayFact, "text" | "state">
}) {
  if (task.worktreeLabel.state !== "available") return null
  if (task.head.state !== "available") return null
  return `Skill apex-task. Carte ${task.id}. cwd = ${task.worktreeLabel.text}. Base ${task.head.text}.`
}

export function copyCockpitPrompt(text: string) {
  const clipboard = typeof navigator === "undefined" ? undefined : navigator.clipboard
  if (!clipboard?.writeText) return Promise.resolve(false)
  return clipboard.writeText(text).then(
    () => true,
    () => false,
  )
}
