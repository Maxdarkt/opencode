# Plan — DA20-005 — Topologie Git lecture seule

## Objectif

Ajouter `RepositoryTopology` (Schema + Core + tests) : projection **lecture seule**
dépôt / refs configurées / worktrees, consommable par DA10-005. Liaison
tâche↔worktree uniquement via `TaskOwnership` vérifié. Aucune mutation Git.

## Décisions (Analyze)

- Ne pas inférer `mergeTarget` (`staging` / `dev` / `defaultBranch` interdits).
- Séparer `workingTreeDiff` (vs HEAD worktree) et `integrationDiff`
  (`mergeTarget...HEAD`) ; jamais un seul `+/-` mixte.
- `Provenance.Source` **local** au module ; ne pas étendre DA20-004.
- Ne pas appeler `@opencode/GitV2` ni `packages/opencode/src/git`.
- Worktrees `prunable` : lisibles (`inaccessible` / `unknown`), pas de prune.
- Hors pathset : App/UI, HttpApi, SDK, opencode git/worktree, staging.

## Blocs

### B1 — Schema `RepositoryTopology`

Fichiers : `packages/schema/src/repository-topology.ts`, export
`packages/schema/src/index.ts`.

Même forme de faits que `TaskOwnership` (`available` + value | unavailable +
`State`). Types :

- `State` : `available | absent | inaccessible | invalid | expired | divergent | blocked | unknown`
- `Provenance` : `source` ∈ `repo_config | git_worktree_list | git_rev_parse | git_status | git_rev_list | git_diff | git_show_ref | task_ownership` + `reference`
- `Freshness` : `observedAt`, `expiresAt?`, `generation?`
- `Input` : `ownership: TaskOwnership.Snapshot` ; `repositories[]` avec `root`,
  `sourceRefs[]` (fournis, jamais inventés), `mergeTarget` **obligatoire**
  (string ; vide → facts `invalid`, pas de `rev-list` de substitution)
- `Snapshot` / `Repository` / `Worktree` selon Analyze
- Faits worktree : path, branch, head, mergeTarget, cleanliness
  (`clean | modified | unknown`), ahead, behind, workingTreeDiff,
  integrationDiff (`additions`, `deletions`, `modifiedFiles`), task
  (`mtTaskID` seulement si ownership `available` et checkout égal), prunable

Check B1 : `bun typecheck` dans `packages/schema`. Pas de Core encore.

### B2 — Core allowlist + `read`

Fichier : `packages/core/src/repository-topology.ts`.

Runner Git **fermé** (argv allowlist Analyze). Échec commande → fact
`inaccessible` / `unknown`, jamais throw métier silencieux avec `0`.

Algorithme : pour chaque `root`, `worktree list --porcelain` ; pour chaque
worktree, mesurer branch/HEAD/status/diff working tree ; existence
`sourceRefs` via `show-ref`/`for-each-ref` ; `rev-list` + `diff` intégration
**seulement** si `mergeTarget` non vide **et** `rev-parse --verify` OK.
Lier `task` par égalité path + branch + HEAD vs identity ownership ; sinon
`divergent` / `absent` / `unknown`. Token A pour worktree B → `invalid`.

Check B2 : `bun typecheck` `packages/core` (peut échouer tant que B3 n’existe
pas si l’export est testé). Pas de tests produit ici.

### B3 — Tests fail-closed + fixture 2 worktrees

Fichier : `packages/core/test/repository-topology.test.ts`. Réutiliser
`test/fixture/git.ts` / tmpdir. Repos **tmp**, pas Daidalon réel.

Couvrir : A/B isolés ; identité absente → worktree listé sans `mtTaskID` ;
`mergeTarget` mort/vide → ahead/behind/`integrationDiff` `unknown`|`invalid` ;
dirty + prunable lisibles ; checkout ≠ mesure → `divergent` ; spy argv : zéro
commande mutative ; régression `task-ownership.test.ts`.

Checks : depuis `packages/core` :
`bun test test/repository-topology.test.ts test/task-ownership.test.ts` ;
`bun typecheck` Schema + Core ; `git diff --check`.

## Pathset

- `packages/schema/src/repository-topology.ts`
- `packages/schema/src/index.ts`
- `packages/core/src/repository-topology.ts`
- `packages/core/test/repository-topology.test.ts`

Lus, non cibles : `task-ownership.ts` Schema/Core, `task-binding.ts`,
`packages/core/test/fixture/git.ts`.

## Smoke (après B3, pas dans B1)

Repos tmp 2 worktrees. Pas le dépôt source. Pas de commit/push/merge.

## Hors autorité

Git mutatif, `20-workspace-git`, staging, PLAN-GENERAL, push/merge.
