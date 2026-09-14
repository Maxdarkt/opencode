import { describe, expect, test } from "bun:test"
import {
  DEFAULT_SECONDARY_WIDTH,
  DEFAULT_SESSION_WIDTH,
  SECONDARY_WIDTH_MIN,
  SESSION_RAIL_WIDTH_COMPACT,
  SESSION_RAIL_WIDTH_WIDE,
  clampSecondaryWidth,
  sessionRailWidth,
  sessionWorkbenchLayout,
} from "./session-workbench-layout"

describe("sessionWorkbenchLayout", () => {
  test("at 1440 keeps a 244px rail, remaining chat, tray, and no secondary", () => {
    const layout = sessionWorkbenchLayout({
      viewportWidth: 1440,
      secondaryOpen: false,
      terminalOpen: true,
    })
    expect(layout.railWidth).toBe(SESSION_RAIL_WIDTH_WIDE)
    expect(layout.workWidth).toBe(1440 - SESSION_RAIL_WIDTH_WIDE)
    expect(layout.showSecondary).toBe(false)
    expect(layout.showTray).toBe(true)
    expect(layout.trayOpen).toBe(true)
    expect(layout.chatTakesRemaining).toBe(true)
  })

  test("at 1440 an open secondary occupies the slot without changing the rail", () => {
    const layout = sessionWorkbenchLayout({
      viewportWidth: 1440,
      secondaryOpen: true,
      terminalOpen: false,
    })
    expect(layout.railWidth).toBe(SESSION_RAIL_WIDTH_WIDE)
    expect(layout.showSecondary).toBe(true)
    expect(layout.chatTakesRemaining).toBe(true)
  })

  test("at 1024 compact rail is 64px and the split icon stays addressable", () => {
    expect(sessionRailWidth(1024)).toBe(SESSION_RAIL_WIDTH_COMPACT)
    expect(sessionRailWidth(1025)).toBe(SESSION_RAIL_WIDTH_WIDE)
    expect(
      sessionWorkbenchLayout({
        viewportWidth: 1024,
        secondaryOpen: false,
        terminalOpen: false,
      }).railWidth,
    ).toBe(SESSION_RAIL_WIDTH_COMPACT)
  })

  test("secondary width clamps at 280 and does not reuse session width", () => {
    expect(clampSecondaryWidth(200)).toBe(SECONDARY_WIDTH_MIN)
    expect(clampSecondaryWidth(279)).toBe(SECONDARY_WIDTH_MIN)
    expect(clampSecondaryWidth(280)).toBe(SECONDARY_WIDTH_MIN)
    expect(clampSecondaryWidth(500)).toBe(500)
    expect(DEFAULT_SECONDARY_WIDTH).toBeGreaterThan(SECONDARY_WIDTH_MIN)
    expect(DEFAULT_SECONDARY_WIDTH).not.toBe(DEFAULT_SESSION_WIDTH)
    expect(DEFAULT_SESSION_WIDTH).toBe(600)
  })
})
