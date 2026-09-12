export type TaskStatus = "empty" | "blocked" | "in_progress" | "review" | "done"
export type PreviewTab = "chat" | "terminal" | "git" | "browser"
export type SensitiveAction = "launch" | "commit" | "merge" | "production"

export type RepositoryBranchFixture = {
  readonly name: string
  readonly role: "source" | "worktree" | "integration"
}

export type WorktreeTopologyFixture = {
  readonly id: string
  readonly path: string
  readonly branch: string
  readonly mergeTarget: string
  readonly cleanliness: "clean" | "modified"
  readonly ahead: number
  readonly behind: number
  readonly additions: number
  readonly deletions: number
  readonly modifiedFiles: number
}

export type RepositoryTopologyFixture = {
  readonly sourceRepo: string
  readonly branches: readonly RepositoryBranchFixture[]
  readonly worktrees: readonly WorktreeTopologyFixture[]
}

export type TaskFixture = {
  readonly id: string
  readonly title: string
  readonly status: TaskStatus
  readonly dependency: string
  readonly worktree: string
  readonly topologyWorktreeId: string | null
  readonly branch: string
  readonly head: string
  readonly lastCheck: string
  readonly nextAction: string
  readonly isWorking: boolean
  readonly hasUnreadUpdate: boolean
  readonly previews: Readonly<Record<PreviewTab, string>>
}

export type SprintFixture = {
  readonly id: string
  readonly name: string
  readonly objective: string
  readonly pilotChat: string
  readonly budget: string
  readonly decision: string
  readonly debt: string
  readonly topology: RepositoryTopologyFixture
  readonly tasks: readonly TaskFixture[]
}

export const sprintCockpitFixture = {
  id: "da-release-0.1-sprint-4",
  name: "Release 0.1 · Sprint 4",
  objective: "Piloter la réception du cockpit sans effet réel",
  pilotChat: "Chat pilote Sprint · session simulée",
  budget: "3 SP · 68% consommé",
  decision: "Valider le modèle pilote/tâche avant le tableau réel",
  debt: "La synchronisation live reste hors prototype",
  topology: {
    sourceRepo: "Daidalon source fixture",
    branches: [
      { name: "release-sprint-4", role: "source" },
      { name: "sprint-cockpit-prototype", role: "worktree" },
      { name: "task-da30-009", role: "worktree" },
      { name: "task-da20-004", role: "worktree" },
      { name: "sprint4-ui-baseline", role: "integration" },
    ],
    worktrees: [
      {
        id: "wt-da10-006",
        path: "features/tasks/DA10-006-maquette-cliquable-cockpit-sprint",
        branch: "sprint-cockpit-prototype",
        mergeTarget: "release-sprint-4",
        cleanliness: "modified",
        ahead: 2,
        behind: 1,
        additions: 184,
        deletions: 12,
        modifiedFiles: 7,
      },
      {
        id: "wt-da30-009",
        path: "features/tasks/DA30-009-file-sequentielle-autorite-multitache",
        branch: "task-da30-009",
        mergeTarget: "release-sprint-4",
        cleanliness: "clean",
        ahead: 4,
        behind: 0,
        additions: 96,
        deletions: 3,
        modifiedFiles: 0,
      },
      {
        id: "wt-da20-004",
        path: "features/tasks/DA20-004-reprise-controlee",
        branch: "task-da20-004",
        mergeTarget: "release-sprint-4",
        cleanliness: "modified",
        ahead: 0,
        behind: 3,
        additions: 21,
        deletions: 18,
        modifiedFiles: 2,
      },
      {
        id: "wt-da10-005",
        path: "features/10-product-ui",
        branch: "sprint4-ui-baseline",
        mergeTarget: "release-sprint-4",
        cleanliness: "clean",
        ahead: 0,
        behind: 0,
        additions: 0,
        deletions: 0,
        modifiedFiles: 0,
      },
    ],
  },
  tasks: [
    {
      id: "DA10-006",
      title: "Maquette cliquable du cockpit Sprint",
      status: "in_progress",
      dependency: "DA40-016 · orchestration Sprint 4",
      worktree: "features/tasks/DA10-006-maquette-cliquable-cockpit-sprint",
      topologyWorktreeId: "wt-da10-006",
      branch: "sprint-cockpit-prototype",
      head: "11cd3e5",
      lastCheck: "Analyze + Plan · PASS",
      nextAction: "Construire B1 local après validation",
      isWorking: true,
      hasUnreadUpdate: true,
      previews: {
        chat: "Aperçu du chat de tâche · aucune session ouverte",
        terminal: "Terminal simulé · aucun processus attaché",
        git: "Diff fixture · 3 fichiers proposés · aucun changement réel",
        browser: "Navigateur simulé · aucune session persistante",
      },
    },
    {
      id: "DA30-009",
      title: "File séquentielle d’autorité multitâche",
      status: "review",
      dependency: "DA20-004 · réception UI différée",
      worktree: "features/tasks/DA30-009-file-sequentielle-autorite-multitache",
      topologyWorktreeId: "wt-da30-009",
      branch: "task-da30-009",
      head: "57da5e0",
      lastCheck: "Verify code · PASS · smoke UI différé",
      nextAction: "Recevoir l’arbitrage de topologie",
      isWorking: false,
      hasUnreadUpdate: true,
      previews: {
        chat: "Aperçu review · remise enfant disponible",
        terminal: "Terminal simulé · aucun processus attaché",
        git: "Diff fixture · pathset B1+B2",
        browser: "Navigateur simulé · smoke parent différé",
      },
    },
    {
      id: "DA20-004",
      title: "Reprise contrôlée d’une tâche",
      status: "blocked",
      dependency: "DA30-009 · décision requise",
      worktree: "features/tasks/DA20-004-reprise-controlee",
      topologyWorktreeId: "wt-da20-004",
      branch: "task-da20-004",
      head: "—",
      lastCheck: "Préflight en attente",
      nextAction: "Attendre le contrat d’autorité",
      isWorking: false,
      hasUnreadUpdate: false,
      previews: {
        chat: "Chat tâche simulé · bloqué par dépendance",
        terminal: "Terminal simulé · indisponible",
        git: "Diff fixture · aucun commit",
        browser: "Navigateur simulé · non requis",
      },
    },
    {
      id: "DA10-005",
      title: "Tableau Sprint réel",
      status: "done",
      dependency: "DA30-009 · contrat reçu",
      worktree: "features/10-product-ui",
      topologyWorktreeId: "wt-da10-005",
      branch: "sprint4-ui-baseline",
      head: "e22d723",
      lastCheck: "Verify · PASS",
      nextAction: "Conserver la preuve parent",
      isWorking: false,
      hasUnreadUpdate: false,
      previews: {
        chat: "Chat tâche simulé · réception terminée",
        terminal: "Terminal simulé · aucun processus attaché",
        git: "Diff fixture · validé localement",
        browser: "Navigateur simulé · capture disponible",
      },
    },
    {
      id: "EMPTY",
      title: "Aucune tâche sélectionnée",
      status: "empty",
      dependency: "—",
      worktree: "—",
      topologyWorktreeId: null,
      branch: "—",
      head: "—",
      lastCheck: "Aucun check",
      nextAction: "Choisir une tâche dans la pile",
      isWorking: false,
      hasUnreadUpdate: false,
      previews: {
        chat: "Aucun chat de tâche",
        terminal: "Aucun terminal",
        git: "Aucun diff",
        browser: "Aucun navigateur",
      },
    },
  ],
} as const satisfies SprintFixture
