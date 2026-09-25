export type SecondaryKind = "files" | "diff" | "browser"

export type SecondaryTab = {
  id: string
  kind: SecondaryKind
}

export type SecondaryTabsState = {
  opened: boolean
  tabs: readonly SecondaryTab[]
  active?: string
  nextId: number
}

export type SecondaryDiff = {
  file: string
  additions: number
  deletions: number
  patch?: string
}

export function secondaryDiffsFromTurn(
  diffs: readonly { file?: string; additions?: number; deletions?: number; patch?: string }[],
): SecondaryDiff[] {
  return diffs.flatMap((diff) => {
    if (!diff.file) return []
    return [
      {
        file: diff.file,
        additions: diff.additions ?? 0,
        deletions: diff.deletions ?? 0,
        patch: diff.patch,
      },
    ]
  })
}

export const SECONDARY_KINDS: readonly SecondaryKind[] = ["browser", "diff", "files"]

export function emptySecondaryTabs(): SecondaryTabsState {
  return {
    opened: false,
    tabs: [],
    nextId: 1,
  }
}

export function addSecondaryTab(state: SecondaryTabsState, kind: SecondaryKind): SecondaryTabsState {
  const existing = state.tabs.find((tab) => tab.kind === kind)
  if (existing) {
    return {
      ...state,
      opened: true,
      active: existing.id,
    }
  }

  const id = `secondary-${kind}-${state.nextId}`
  return {
    opened: true,
    tabs: [...state.tabs, { id, kind }],
    active: id,
    nextId: state.nextId + 1,
  }
}

export function openSecondary(state: SecondaryTabsState): SecondaryTabsState {
  if (state.tabs.length === 0) return addSecondaryTab({ ...state, opened: true }, "files")
  return {
    ...state,
    opened: true,
    active: state.active ?? state.tabs[0]?.id,
  }
}

export function toggleSecondary(state: SecondaryTabsState): SecondaryTabsState {
  if (state.opened) return { ...state, opened: false }
  return openSecondary(state)
}

export function focusSecondaryTab(state: SecondaryTabsState, id: string): SecondaryTabsState {
  if (!state.tabs.some((tab) => tab.id === id)) return state
  return {
    ...state,
    opened: true,
    active: id,
  }
}

export function closeSecondaryTab(state: SecondaryTabsState, id: string): SecondaryTabsState {
  const tabs = state.tabs.filter((tab) => tab.id !== id)
  if (tabs.length === 0) {
    return {
      opened: false,
      tabs: [],
      nextId: state.nextId,
    }
  }

  const active = state.active === id ? tabs[tabs.length - 1]?.id : state.active
  return {
    ...state,
    tabs,
    active,
  }
}

export function openSecondaryFiles(state: SecondaryTabsState): SecondaryTabsState {
  return addSecondaryTab({ ...state, opened: true }, "files")
}

export function secondaryPathStatus(path: string | undefined, directory: string) {
  if (!path) return "unknown" as const
  const normalized = path.replaceAll("\\", "/")
  const root = directory.replaceAll("\\", "/")
  if (normalized.startsWith("/") && root && !(normalized === root || normalized.startsWith(`${root}/`))) {
    return "omitted" as const
  }
  return "in-tree" as const
}

export function secondaryFileCrumb(path: string | undefined) {
  if (!path) return "unknown"
  const parts = path.replaceAll("\\", "/").split("/").filter(Boolean)
  if (parts.length === 0) return "unknown"
  if (parts.length === 1) return parts[0]
  return `${parts.slice(0, -1).join(" / ")} / ${parts[parts.length - 1]}`
}

export function secondaryFileBody(input: { content?: string; error?: boolean; omitted?: boolean }) {
  if (input.omitted) return "omitted"
  if (input.error) return "unknown"
  if (input.content === undefined) return "unknown"
  return input.content
}

export function secondaryFilesLayout() {
  return { treeSide: "right" as const }
}

export function secondaryDiffView(diffs: readonly SecondaryDiff[], selected?: string) {
  if (diffs.length === 0) {
    return {
      empty: true as const,
      items: [] as SecondaryDiff[],
      patch: undefined as string | undefined,
    }
  }

  const active = diffs.find((diff) => diff.file === selected) ?? diffs[0]
  const patch = typeof active.patch === "string" && active.patch.length > 0 ? active.patch : "unknown"
  return {
    empty: false as const,
    items: [...diffs],
    patch,
  }
}

export { secondaryBrowserView } from "./session-make-dev"
