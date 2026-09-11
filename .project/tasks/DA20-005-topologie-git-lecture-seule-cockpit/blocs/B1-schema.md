# B1 — Schema `RepositoryTopology`

## Fichiers

- `packages/schema/src/repository-topology.ts` (créé)
- `packages/schema/src/index.ts` (export `RepositoryTopology`)

Pas de Core.

## Contrat

Faits `available` + value | unavailable + `State`, comme `TaskOwnership`.

- `Source` local : `repo_config | git_worktree_list | git_rev_parse | git_status | git_rev_list | git_diff | git_show_ref | task_ownership`
- `Input.ownership` : `TaskOwnership.Snapshot` ; `repositories[]` : `root`, `sourceRefs[]`, `mergeTarget` string obligatoire (vide autorisé → Core marquera `invalid`)
- `Repository` : `sourceRepo`, `branches[]` (presence `present` / absent / unknown), `worktrees[]`
- `Worktree` : path, branch, head, mergeTarget, cleanliness, ahead, behind, workingTreeDiff, integrationDiff, task (`mtTaskID`), prunable

`TaskOwnership.Source` non étendu.

## Checks

| Check | Résultat |
| `bun run --cwd packages/schema typecheck` (`tsgo --noEmit`) | PASS |

`bun typecheck` dans le package remonte le script turbo racine. `bun install` local requis ; `bun.lock` restauré.

## Suite

B2 Core allowlist + `read`. Pas de tests produit ici.
