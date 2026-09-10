# Verify — DA30-004

## Critères d'acceptation

| Critère                              | Preuve                                                                                             | Résultat                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Propriétaire écrivain unique         | unicité SQLite task/session/worktree, transaction immediate, test concurrent à un gagnant          | PASS                                     |
| Conflit avant mutation métier        | `TaskBinding.resume` avant acquisition/reprise, conflits owner/token/worktree, snapshots inchangés | PASS                                     |
| Reprise confirmée/absente/incertaine | tests pending, mix atomique, rejeu seulement absent, uncertain fail-closed                         | PASS                                     |
| Concurrence et interruption testées  | `task-execution.test.ts`, tests réels SQLite sans mocks                                            | PASS                                     |
| Contrat UI et smoke parent           | `handoff.md` et `smoke-report.md`                                                                  | PASS enfant; smoke visuel parent restant |

## Vérifications finales

- `bun test` depuis `packages/core` : PASS, 1122 tests / 3138 assertions, 147 fichiers.
- `bun test test/task-execution.test.ts test/task-binding.test.ts test/local-context.test.ts test/database-migration.test.ts` : PASS, 44 tests / 176 assertions.
- `bun typecheck` depuis `packages/schema` : PASS.
- `bun typecheck` depuis `packages/core` : PASS.
- `bun run script/migration.ts --check` depuis `packages/core` : PASS.
- `bunx oxlint --deny-warnings` sur les cinq sources/tests fonctionnels : PASS.
- `bunx prettier --check` sur les fichiers TypeScript ciblés : PASS.
- `git diff --check` : PASS.
- Suite globale Schema : 13 PASS / 2 FAIL; dette `event-manifest` préexistante, reproduite par
  DA20-003 sur la baseline et tracée dans `problems.md`.

## Inventaire et dette

Les changements fonctionnels sont limités au contrat Schema, au service/tables Core, à la migration
générée et au test ciblé. Les preuves APEX et le journal DA30-004 accompagnent le commit. Les quatre
projections Sprint/release demeurent hors pathset. Aucune dette en périmètre ne reste ouverte.

## Limite de validation enfant

Le smoke technique prouve les transitions de données et le fencing. Le parent reste propriétaire du
jugement visuel après intégration DA10-003 et de la clôture `done`.
