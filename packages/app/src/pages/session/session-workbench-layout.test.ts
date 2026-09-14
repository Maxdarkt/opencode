import { describe, expect, test } from "bun:test"
import {
  SESSION_RAIL_WIDTH_COMPACT,
  SESSION_RAIL_WIDTH_WIDE,
  sessionRailWidth,
  sessionWorkbenchLayout,
} from "./session-workbench-layout"

describe("sessionWorkbenchLayout", () => {
  test("at 1440 keeps a 244px rail, remaining chat, tray, and no secondary", () => {
    const layout = sessionWorkbenchLayout({
      viewportWidth: 1440,
      sidePanelOpen: false,
      terminalOpen: true,
    })
    expect(layout.railWidth).toBe(SESSION_RAIL_WIDTH_WIDE)
    expect(layout.workWidth).toBe(1440 - SESSION_RAIL_WIDTH_WIDE)
    expect(layout.showSecondary).toBe(false)
    expect(layout.showTray).toBe(true)
    expect(layout.trayOpen).toBe(true)
    expect(layout.chatTakesRemaining).toBe(true)
  })

  test("at 1024 compact rail is 64px", () => {
    expect(sessionRailWidth(1024)).toBe(SESSION_RAIL_WIDTH_COMPACT)
    expect(sessionRailWidth(1025)).toBe(SESSION_RAIL_WIDTH_WIDE)
    expect(
      sessionWorkbenchLayout({
        viewportWidth: 1024,
        sidePanelOpen: false,
        terminalOpen: false,
      }).railWidth,
    ).toBe(SESSION_RAIL_WIDTH_COMPACT)
  })
})
