import { describe, expect, test } from "bun:test"
import { legacySessionHref } from "@/utils/session-route"
import {
  SESSION_SPRINT_COCKPIT_HREF,
  sessionSprintRailHref,
  sessionSprintRailIndicators,
  sessionSprintRailSelected,
} from "./session-sprint-rail"

describe("sessionSprintRailHref", () => {
  test("pilot and missing sessionHref go to cockpit", () => {
    expect(sessionSprintRailHref({ kind: "pilot", sessionHref: "/wt/session/abc" })).toBe(SESSION_SPRINT_COCKPIT_HREF)
    expect(sessionSprintRailHref({ kind: "task", sessionHref: null })).toBe(SESSION_SPRINT_COCKPIT_HREF)
  })

  test("observed sessionHref opens that session", () => {
    const href = legacySessionHref("/Users/leanbot/Documents/40_Daidalon/features/tasks/DA10-009", "ses_bound")
    expect(sessionSprintRailHref({ kind: "task", sessionHref: href })).toBe(href)
  })
})

describe("sessionSprintRailIndicators", () => {
  test("pastilles only when working or unread is observed", () => {
    expect(sessionSprintRailIndicators({ isWorking: false, hasUnread: false })).toEqual([])
    expect(sessionSprintRailIndicators({ isWorking: true, hasUnread: false })).toEqual(["working"])
    expect(sessionSprintRailIndicators({ isWorking: false, hasUnread: true })).toEqual(["unread"])
    expect(sessionSprintRailIndicators({ isWorking: true, hasUnread: true })).toEqual(["working", "unread"])
  })
})

describe("sessionSprintRailSelected", () => {
  test("selects the task whose session href matches the current session", () => {
    const href = legacySessionHref("/tmp/wt", "ses_current")
    expect(
      sessionSprintRailSelected({
        kind: "task",
        href,
        currentSessionID: "ses_current",
      }),
    ).toBe(true)
    expect(
      sessionSprintRailSelected({
        kind: "task",
        href,
        currentSessionID: "ses_other",
      }),
    ).toBe(false)
  })

  test("marks Pilot current only on the cockpit path", () => {
    expect(
      sessionSprintRailSelected({
        kind: "pilot",
        href: SESSION_SPRINT_COCKPIT_HREF,
        currentSessionID: "ses_current",
        pathname: SESSION_SPRINT_COCKPIT_HREF,
      }),
    ).toBe(true)
    expect(
      sessionSprintRailSelected({
        kind: "pilot",
        href: SESSION_SPRINT_COCKPIT_HREF,
        currentSessionID: "ses_current",
        pathname: "/session/ses_current",
      }),
    ).toBe(false)
  })
})
