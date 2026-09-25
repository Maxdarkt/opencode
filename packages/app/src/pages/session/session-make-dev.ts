export type MakeDevStatus = {
  state: "off" | "on" | "unknown"
  host?: string
  backendPort?: number
  uiPort?: number
  worktreeCode?: number
  error?: string
}

export type PackInspectorServersView = {
  state: "off" | "on" | "unknown"
  label: string
  cpuRam: string
  startEnabled: boolean
  stopEnabled: boolean
  error?: string
}

export function packInspectorServersView(status?: MakeDevStatus): PackInspectorServersView {
  if (!status || status.state === "unknown") {
    return {
      state: "unknown",
      label: "unknown",
      cpuRam: "unknown",
      startEnabled: false,
      stopEnabled: false,
      error: status?.error,
    }
  }
  if (status.state === "off") {
    return {
      state: "off",
      label: "OFF",
      cpuRam: "—",
      startEnabled: true,
      stopEnabled: false,
      error: status.error,
    }
  }
  const ports =
    status.backendPort !== undefined && status.uiPort !== undefined ? ` · ${status.backendPort} / ${status.uiPort}` : ""
  return {
    state: "on",
    label: `ON${ports}`,
    cpuRam: "unknown",
    startEnabled: false,
    stopEnabled: true,
    error: status.error,
  }
}

export function secondaryBrowserView(status?: MakeDevStatus) {
  if (status?.state !== "on" || !status.host || status.uiPort === undefined) {
    return { url: "about:blank", iframe: false }
  }
  return {
    url: `http://${status.host}:${status.uiPort}/sprint/cockpit`,
    iframe: true,
  }
}
