export const SESSION_RAIL_WIDTH_WIDE = 244
export const SESSION_RAIL_WIDTH_COMPACT = 64
export const SESSION_RAIL_COMPACT_MAX_WIDTH = 1024

export function sessionRailWidth(viewportWidth: number) {
  if (viewportWidth <= SESSION_RAIL_COMPACT_MAX_WIDTH) return SESSION_RAIL_WIDTH_COMPACT
  return SESSION_RAIL_WIDTH_WIDE
}

export function sessionWorkbenchLayout(input: {
  viewportWidth: number
  sidePanelOpen: boolean
  terminalOpen: boolean
}) {
  const railWidth = sessionRailWidth(input.viewportWidth)
  return {
    railWidth,
    workWidth: Math.max(0, input.viewportWidth - railWidth),
    showSecondary: input.sidePanelOpen,
    showTray: true,
    trayOpen: input.terminalOpen,
    chatTakesRemaining: true,
  }
}
