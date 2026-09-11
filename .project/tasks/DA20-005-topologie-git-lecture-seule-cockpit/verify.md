# Verify — DA20-005

## Checks

| Check | Résultat | Preuve |
| Typecheck schema | PASS | `tsgo --noEmit` `packages/schema` |
| Typecheck core | PASS | `tsgo --noEmit` `packages/core` |
| Tests ciblés + régression | PASS 14/14 | `bun test` topology + ownership depuis `packages/core` |
| Whitespace | PASS | `git diff --check` |
| Git mutatif produit | PASS | allowlist + spy argv |

Échecs préexistants : non observés sur ce périmètre.

## Dettes

`packages/core/bunfig.toml` : `test.root = "."` pour exécuter les tests hors garde-fou racine.

Hors scope volontaire : UI cockpit (DA10-005), HttpApi/SDK, `GitV2`, staging, commit/push/merge.

## Handoff

Code B1–B3 non commité sur `task/DA20-005-topologie-git` @ `7df15b2cd`. Prêt pour revue / commit si autorisé. Carte MT toujours `in_progress` jusqu’à clôture explicite.
