# B1 — Validation candidate — DA40-013

## Git et pathset

- `sprint3-integration`, HEAD `442a1311f06d970ccbb1bc77bc9eda78f81c42d9`,
  base `10e1234b3b08b986ef966f01d04e25bbf1185433`, propre après les checks.
- Les quatre commits attendus sont ordonnés et le pathset cumulé contient 24
  chemins uniques (`1393+ / 26-`); l’export Schema commun est touché deux fois.
  `git diff --check` PASS; aucun chemin hors
  candidate, projection APEX ou fichier d’environnement n’est dans le diff.
- L’environnement local manquait de dépendances; `bun install
  --frozen-lockfile` a préparé uniquement `node_modules` ignoré dans ce
  worktree. Aucun fichier versionné ni lockfile n’a changé.

## Checks

| Commande | Résultat |
| --- | --- |
| `packages/schema: bun typecheck && bun test` | PASS — 15/15 |
| `packages/core: bun typecheck && bun test` | PASS — suite complète terminée, incluant TaskPilot/TaskMetrics |
| `packages/opencode: bun typecheck && bun test` | PASS — suite complète terminée, incluant HTTP global/control-plane |
| `packages/app: bun typecheck` | PASS |
| `packages/app: Bun 1.3.14 task-pilot-state.test.ts` | PASS — 4/4 |
| `packages/client: bun run generate && diff generated && bun typecheck` | PASS — généré inchangé |
| `packages/sdk/js: bun typecheck && bun test` | PASS — 2/2 |
| candidate pathset : `bunx prettier --check` et `git diff --check` | PASS |

## Écart hérité

La suite App complète a reproduit exactement le test hors pathset
`src/i18n/desktop-native.test.ts` : 748 pass / 1 fail, `pa-PK` attendu `pa`,
reçu `en`. La reproduction isolée sous Bun 1.3.14 donne 7/1; le test et son
implémentation sont identiques à la base. Cette dette existe déjà dans
`DA10-002` (`debts.md`, D1) et n’est ni introduite ni corrigible dans
DA40-013. Les tests UI touchés sont verts.
