export type MakeDevStatus = {
  state: "off" | "on" | "unknown"
  host?: string
  backendPort?: number
  uiPort?: number
  worktreeCode?: number
  error?: string
  cpuPercent?: number
  rssBytes?: number
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
      cpuRam: cpuRam(status),
      startEnabled: false,
      stopEnabled: false,
      error: status?.error,
    }
  }
  if (status.state === "off") {
    return {
      state: "off",
      label: "OFF",
      cpuRam: cpuRam(status),
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
    cpuRam: cpuRam(status),
    startEnabled: false,
    stopEnabled: true,
    error: status.error,
  }
}

function cpuRam(status?: MakeDevStatus) {
  if (!status || status.state === "unknown") return "unknown"
  if (status.state === "off") return "—"
  if (status.cpuPercent === undefined || status.rssBytes === undefined) return "unknown"
  return `${Math.round(status.cpuPercent)}% · ${Math.round(status.rssBytes / 1048576)} Mo`
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
