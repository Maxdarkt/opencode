---
id: OP-legacy-apex-recover
type: reconciliation-journal
document_status: active
authority: parent Cursor sprint-support
sources:
  - mandat utilisateur 2026-09-25 « ok go » : copier APEX uniques vers staging puis retirer les 9 worktrees sales
observed_at: 2026-09-25T16:04:00+02:00
---
# OP-legacy-apex-recover

## Intention

- copier vers `Daidalon/.project/tasks/` les dossiers APEX **absents** de staging
- exclure caches `evidence/runtime`, `node_modules` ; pas de PLAN/sprint des worktrees
- committer sur `staging` ; puis `git worktree remove --force` des 9 arbres encore sales
- branches locales conservées ; pas de merge des branches métier

## Dossiers à copier

| Source | Dossier |
|---|---|
| 10-product-ui | `DA10-004-vue-sprint-pilotage`, `sprint-cockpit-clickable-prototype` |
| 30-agent-runtime | `DA30-003`, `DA30-005`, `DA30-006`, `DA30-008` + symlink `debt-schema-event-manifest` |
| 40-tooling | `DA40-005`, `DA40-008`, `DA40-009`, `DA40-013` |

Sautés : `DA10-006` vide ; caches runtime DA30-003.
