export const SESSION_SPRINT_COCKPIT_HREF = "/sprint/cockpit"

export function sessionSprintRailHref(input: { kind: "pilot" | "task"; sessionHref: string | null }) {
  if (input.kind === "pilot") return SESSION_SPRINT_COCKPIT_HREF
  if (input.sessionHref) return input.sessionHref
  return SESSION_SPRINT_COCKPIT_HREF
}

export function sessionSprintRailIndicators(input: { isWorking: boolean; hasUnread: boolean }) {
  return [
    input.isWorking ? ("working" as const) : undefined,
    input.hasUnread ? ("unread" as const) : undefined,
  ].filter((value): value is "working" | "unread" => value !== undefined)
}

export function sessionIDFromHref(href: string) {
  const match = href.match(/\/session\/([^/?#]+)/)
  return match?.[1]
}

export function sessionSprintRailSelected(input: {
  kind: "pilot" | "task"
  href: string
  currentSessionID: string | undefined
}) {
  if (input.kind === "pilot") return false
  const id = sessionIDFromHref(input.href)
  if (!id || !input.currentSessionID) return false
  return id === input.currentSessionID
}
