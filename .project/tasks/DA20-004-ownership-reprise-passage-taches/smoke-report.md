# Smoke — DA20-004

Pass A technique uniquement (fixtures SQLite + snapshot runtime synthétique). Aucun serveur, navigateur, Git, MT, APEX ou agent réel.

| Étape | Résultat |
| Observer A active / B todo | `result.selected.id` = A ; owner A et B distincts |
| Fermer A (`review`/`verify`) puis observer B | sélection B ; A toujours visible avec le même owner/session/worktree |
| Injecter l’attention de A sous B | B `attention.invalid`, pas de `value`, snapshot `blocked` |
| Token A (session/worktree) sous l’id B | `execution.divergent`, aucune écriture |

Preuve : `packages/core/test/task-ownership.test.ts` (28 tests verts avec les régressions DA30-009 / binding / execution).

Pass B visuel cockpit : hors mandat (DA10-005 / DA40-015).
