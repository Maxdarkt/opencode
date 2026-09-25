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

## Conclusion

- **reconciled** : docs `0e66cd58f` puis merge `6d6de081f` puis docs `334bec18d` ; `origin/staging` `334bec18d` (SSH) ; DA20-007 archived ; sprint `completed` ; worktrees 014, 015, 007 retirés ; 020 conservé (sale). `?? .cursor/permissions.json` hors clôture.

