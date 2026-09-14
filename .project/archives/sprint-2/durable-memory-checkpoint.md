# Checkpoint compact — Lancement Sprint 2 (archivé 2026-09-13)

Snapshot du fichier vivant `.project/runtime/durable-memory-checkpoint.md` avant remplacement Sprint 5.

Mis à jour : 2026-09-07. Fraîcheur alors : `fresh` après activation MT et création des worktrees.

## Objectif et autorités relues

- Objectif : livrer un binding tâche/session/worktree exclusif, reprenable et visible, puis une candidate intégrée.
- MT : sprint `da-release-0.1-sprint-2`, ID `ddc01132-b26a-446a-85a0-04d2d37a0a01`, active ; DA20-003, DA30-004 et DA10-003 done, DA40-011 et DA40-012 in_progress, 29 SP.
- APEX : scopes et STATE canoniques créés sous `.project/tasks`.
- Git : baseline `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2`; staging reste `702bf7dcd` et ne reçoit aucun Build produit.

## Roster et ordre

| Carte | État vérifié | Chat | Worktree / branche | Routage demandé | Prochaine action |
|---|---|---|---|---|---|
| DA20-003 | done, `a70bf26ad` | chat archivé `01a07b7a-fde8-76f0-ae19-64a99c75fd32` | `s2-20-binding` / `task-session-binding` | Sol/high attesté | conserver preuves/worktree |
| DA30-004 | done, `1de05c023` | chat archivé `01a07b7b-4a62-7842-80fa-4d645525df4c` | `s2-30-ownership` / `execution-ownership` | Sol/high attesté | conserver preuves/worktree |
| DA10-003 | done, `f4b7b44d8` | chat archivé `01a07b7b-99ed-72b3-a663-515fb5a4ad86` | `s2-10-context-ui` / `active-context-ui` | Terra/high attesté | conserver preuves/worktree |
| DA40-011 | in_progress | `01a07b7b-e5eb-7ee2-babe-14b9dd70bfb1` | `s2-integration` / `sprint2-integration` | Sol/high attesté | assembler les trois livraisons acceptées |
| DA40-012 | in_progress | parent `01a076a4-b458-72a3-8e2b-bf975091a840` | staging, observation seule | parent courant | superviser |

Le checkpoint vivant est [Sprint 5](../../runtime/durable-memory-checkpoint.md).
