import { describe, expect, test } from "bun:test"
import { packInspectorServersView, secondaryBrowserView } from "./session-make-dev"

describe("packInspectorServersView", () => {
  test("unknown disables start", () => {
    expect(packInspectorServersView()).toEqual({
      state: "unknown",
      label: "unknown",
      cpuRam: "unknown",
      startEnabled: false,
      stopEnabled: false,
    })
    expect(packInspectorServersView({ state: "unknown", error: "missing .make.env" }).startEnabled).toBe(false)
  })

  test("off shows dash CPU and enables start", () => {
    expect(packInspectorServersView({ state: "off", host: "127.0.0.1", backendPort: 4191, uiPort: 4491 })).toEqual({
      state: "off",
      label: "OFF",
      cpuRam: "—",
      startEnabled: true,
      stopEnabled: false,
    })
  })

  test("on without a sample stays unknown", () => {
    expect(
      packInspectorServersView({
        state: "on",
        host: "127.0.0.1",
        backendPort: 4191,
        uiPort: 4491,
      }),
    ).toEqual({
      state: "on",
      label: "ON · 4191 / 4491",
      cpuRam: "unknown",
      startEnabled: false,
      stopEnabled: true,
    })
  })

  test("on formats an observed sample in mebibytes", () => {
    expect(
      packInspectorServersView({
        state: "on",
        host: "127.0.0.1",
        backendPort: 4191,
        uiPort: 4491,
        cpuPercent: 3,
        rssBytes: 104857600,
      }).cpuRam,
    ).toBe("3% · 100 Mo")
    expect(
      packInspectorServersView({
        state: "on",
        cpuPercent: 150.2,
        rssBytes: 1048576,
      }).cpuRam,
    ).toBe("150% · 1 Mo")
  })
})

describe("secondaryBrowserView", () => {
  test("iframe only when on with observed origin", () => {
    expect(secondaryBrowserView()).toEqual({ url: "about:blank", iframe: false })
    expect(secondaryBrowserView({ state: "off" })).toEqual({ url: "about:blank", iframe: false })
    expect(secondaryBrowserView({ state: "unknown" })).toEqual({ url: "about:blank", iframe: false })
    expect(secondaryBrowserView({ state: "on", host: "127.0.0.1", uiPort: 4491 })).toEqual({
      url: "http://127.0.0.1:4491/sprint/cockpit",
      iframe: true,
    })
  })
})
