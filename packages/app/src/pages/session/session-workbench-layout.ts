export const SESSION_RAIL_WIDTH_WIDE = 244
export const SESSION_RAIL_WIDTH_COMPACT = 64
export const SESSION_RAIL_COMPACT_MAX_WIDTH = 1024
export const SECONDARY_WIDTH_MIN = 280
export const DEFAULT_SECONDARY_WIDTH = 420
export const DEFAULT_SESSION_WIDTH = 600

export function sessionRailWidth(viewportWidth: number) {
  if (viewportWidth <= SESSION_RAIL_COMPACT_MAX_WIDTH) return SESSION_RAIL_WIDTH_COMPACT
  return SESSION_RAIL_WIDTH_WIDE
}

export function clampSecondaryWidth(width: number) {
  if (!Number.isFinite(width)) return DEFAULT_SECONDARY_WIDTH
  return Math.max(SECONDARY_WIDTH_MIN, Math.round(width))
}

export function sessionWorkbenchLayout(input: {
  viewportWidth: number
  secondaryOpen: boolean
  terminalOpen: boolean
}) {
  const railWidth = sessionRailWidth(input.viewportWidth)
  return {
    railWidth,
    workWidth: Math.max(0, input.viewportWidth - railWidth),
    showSecondary: input.secondaryOpen,
    showTray: true,
    trayOpen: input.terminalOpen,
    chatTakesRemaining: true,
  }
}
