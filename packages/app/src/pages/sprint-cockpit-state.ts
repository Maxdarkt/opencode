import type { PreviewTab, SensitiveAction } from "./sprint-cockpit-fixtures"

export type CockpitLayoutView = "cockpit" | "task"
export type RightPanelTab = "taskStatus" | "verifiableContext" | "repositoryTopology"

export type CockpitLayoutState = {
  readonly selectedTaskId: string
  readonly view: CockpitLayoutView
  readonly canvasTab: PreviewTab
  readonly previewTab: PreviewTab
  readonly rightPanelTab: RightPanelTab
  readonly mobileDrawerOpen: boolean
  readonly confirmation: SensitiveAction | null
}

export type CockpitLayoutIntent =
  | { readonly type: "selectTask"; readonly taskId: string }
  | { readonly type: "showCockpit" }
  | { readonly type: "selectPreview"; readonly tab: PreviewTab }
  | { readonly type: "selectRightPanel"; readonly tab: RightPanelTab }
  | { readonly type: "setMobileDrawer"; readonly open: boolean }
  | { readonly type: "openConfirmation"; readonly action: SensitiveAction }
  | { readonly type: "closeConfirmation" }

export function createCockpitLayoutState(selectedTaskId = "DA40-015-A"): CockpitLayoutState {
  return {
    selectedTaskId,
    view: "cockpit",
    canvasTab: "chat",
    previewTab: "chat",
    rightPanelTab: "taskStatus",
    mobileDrawerOpen: false,
    confirmation: null,
  }
}

export function reduceCockpitLayoutState(state: CockpitLayoutState, intent: CockpitLayoutIntent): CockpitLayoutState {
  if (intent.type === "selectTask") return { ...state, selectedTaskId: intent.taskId, view: "task", previewTab: "chat" }
  if (intent.type === "showCockpit") return { ...state, view: "cockpit", confirmation: null }
  if (intent.type === "selectPreview") return { ...state, view: "task", canvasTab: intent.tab, previewTab: intent.tab }
  if (intent.type === "selectRightPanel") return { ...state, rightPanelTab: intent.tab, mobileDrawerOpen: true }
  if (intent.type === "setMobileDrawer") return { ...state, mobileDrawerOpen: intent.open }
  if (intent.type === "openConfirmation") return { ...state, confirmation: intent.action }
  return { ...state, confirmation: null }
}
