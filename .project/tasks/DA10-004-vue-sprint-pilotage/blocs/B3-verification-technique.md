# B3 — Vérification technique

## Préparation et corrections

`bun install --frozen-lockfile` a installé les dépendances du worktree dédié (4 687 paquets) sans modifier `bun.lock`. Le typecheck a ensuite révélé et B3 a corrigé trois défauts confinés à la frontière UI : type d'identité non exporté au bon niveau, `null` du contexte local, et narrowing de l'union `TaskPilotResult`. La navigation reçoit maintenant une `TaskPilotExistingIdentity` dont `sessionID` et `worktree` sont requis.

## Résultats

- PASS — `git diff --exit-code -- bun.lock` après installation.
- PASS — tests app ciblés : `task-pilot-state`, `active-task-context-state`, `active-task-write-guard` : 8 tests, 40 assertions.
- PASS — `bun typecheck` depuis `packages/app`.
- PASS — Prettier des six fichiers produit/test et `git diff --check`.
- PASS — `bun run build` depuis `packages/app` (Vite, 2 570 modules transformés).

Le build émet les avertissements Vite préexistants de chunks dynamiques également importés statiquement, de taille de chunk et de source map wasm écrasée; son code de sortie est 0. Aucun changement de lockfile, commit, MT ou autorité runtime.

## Limites et relais

Le chemin live qui fournirait les observations MT/APEX reste hors scope : sans observation explicite, la carte reste correctement fail-closed (`Not observed` + `context_incomplete`). Le smoke visuel parent reste requis sur candidate intégrée aux résolutions prévues; cet enfant ne l'exécute pas.
