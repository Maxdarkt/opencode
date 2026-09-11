# B2 — Core allowlist + `read`

## Fichiers

- `packages/core/src/repository-topology.ts` (créé)

Pas de tests produit. Pas de `GitV2` / `packages/opencode/src/git`.

## Comportement

- Runner `GitRunner` fermé : `isAllowedGitArgs` avant tout spawn ; échec → fact `inaccessible`/`unknown`, jamais `0` silencieux.
- `mergeTarget` vide ou unsafe → ahead/behind/`integrationDiff` `invalid`, pas de `rev-list`.
- `rev-parse --verify` KO → intégration `unknown`/`absent`, pas de substitution `staging`/`dev`.
- `task.mtTaskID` seulement si path+branch+HEAD = identity ownership ; sinon `absent`/`divergent`/`invalid`.
- `prunable` lu sur porcelain, aucun prune.

`layerFromGit` + `gitLayer` exportés pour spy argv en B3.

## Checks

| Check | Résultat |
| `bun run --cwd packages/core typecheck` (`tsgo --noEmit`) | PASS |

## Suite

B3 : `packages/core/test/repository-topology.test.ts` + régression `task-ownership.test.ts`.
