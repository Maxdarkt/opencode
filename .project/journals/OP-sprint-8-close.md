---
id: OP-sprint-8-close
type: reconciliation-journal
document_status: active
authority: parent Cursor sprint-support
sources:
  - mandat utilisateur 2026-09-25 merger cbdf61e67, push origin staging, archiver 007, retirer worktrees propres
  - candidate DA20-007 HEAD cbdf61e67 propre
observed_at: 2026-09-25T15:02:00+02:00
---
# OP-sprint-8-close — promotion et clôture Sprint 8

## Intention idempotente

- cible : merger **uniquement** `cbdf61e67` dans `staging` ; push `origin staging` ; archiver DA20-007 ; `worktree remove` des arbres propres
- préconditions : mandat explicite ; 014/015/007 propres ; 020 sale (exclu) ; `staging` rangé avant merge
- effet attendu : docs clôture commitées ; merge candidate ; `origin/staging` à jour ; 007 archived ; sprint `completed` ; 014, 015, 007 retirés
- exclusion : pas de merge des branches 014/015/020 séparément ; pas de force-push ; pas de `dev`/`main`/`master` ; 020 non retiré ; worktrees métier conservés

## Préflight Git (observé)

| Worktree | Branche | HEAD | porcelain |
|---|---|---|---|
| DA30-014 | task/DA30-014-couts-budgets | `7da410789` | propre |
| DA30-015 | task/DA30-015-adaptateurs-abo | `584401a7e` | propre |
| DA40-020 | task/DA40-020-process-cpu-ram | `27146219b` | **sale** `.apex/` + fixtures — exclu |
| DA20-007 | task/DA20-007-candidate-integree-sprint-8 | `cbdf61e67` | propre |

merge-base `staging`/`cbdf61e67` = `8db56f535`.

## Reliquat 2026-09-25T15:40 — mandat « finir commit, merge, staging, fermer worktrees »

Préflight relus :
- MT Sprint 8 `completed` ; 014/015/020/007 `archived`
- `origin/staging` = `staging` = `ca93ddc68` ; merge produit `6d6de081f` ; rien à merger depuis `task/DA40-020-process-cpu-ram` (`merge-base` = `27146219b`)
- Worktree 020 encore présent, sale uniquement de locaux : `.apex/runtime.env`, fixture smoke `code-91` (Makefile + `.started`)
- `?? .cursor/permissions.json` hors clôture (config Cursor locale)
- Dossier orphelin `features/tasks/DA10-010` : pas un worktree Git, hors Sprint 8

Effet : `git worktree remove --force` 020 (locaux smoke/runtime, pas du produit) ; docs clôture ; push `origin staging`. Pas de merge de branche carte. Pas de commit dans le worktree 020.

## Conclusion

- **reconciled** : merge `6d6de081f` ; docs reliquat `2a290fd15` poussé SSH ; 4 MT archived ; sprint `completed` ; worktrees S8 014/015/007/020 retirés. `?? .cursor/permissions.json` hors clôture. Dossier orphelin `DA10-010` non worktree, hors S8.

