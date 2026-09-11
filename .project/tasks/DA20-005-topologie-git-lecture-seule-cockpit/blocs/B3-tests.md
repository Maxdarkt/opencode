# B3 — Tests fail-closed + fixture 2 worktrees

## Fichiers

- `packages/core/test/repository-topology.test.ts` (créé)
- `packages/core/src/repository-topology.ts` : réexport `Worktree` (typage tests)
- `packages/core/bunfig.toml` : `root = "."` pour outrepasser le garde-fou racine `do-not-run-tests-from-root`

Repos **tmp** uniquement (`gitRemote` + `worktree add` fixture). Pas le dépôt Daidalon.

## Couverture

- A/B isolés : `mtTaskID` distincts ; refs `present` / `missing-ref` `absent`
- Identité absente → worktrees listés, `task.absent`, pas de `value`
- `mergeTarget` vide → `invalid`, zéro `rev-list`
- `mergeTarget` mort → `absent`/`unknown`, pas de `staging`/`dev`
- dirty B + prunable lisible, aucun `prune`/`add`/`remove` produit
- checkout HEAD ≠ mesure → `divergent` ; deux identités même path → `invalid`
- spy argv : allowlist ; commandes mutatives rejetées
- régression `task-ownership.test.ts`

## Checks

| Check | Résultat |
| `bun test test/repository-topology.test.ts test/task-ownership.test.ts` (depuis `packages/core`) | PASS 14/14 |
| `bun run --cwd packages/schema typecheck` | PASS |
| `bun run --cwd packages/core typecheck` | PASS |
| `git diff --check` | PASS |

## Suite

Smoke technique tmp (pas UI). Pas de commit/push/merge.
