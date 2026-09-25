# Procédure de promotion — DA20-007

Checklist. Non exécutée dans cette carte. Mandat séparé, après Verify.

- Branche : `task/DA20-007-candidate-integree-sprint-8`
- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA20-007-candidate-integree-sprint-8`
- Assemblage : `efb74290b` (ancêtres `7da410789`, `584401a7e`, `27146219b`)
- SHA Verify : `58433ae85` (preuves APEX). Promouvoir le HEAD de cette branche, qui contient cette valeur.

## Ordre

1. Ranger le checkout `staging` sale (`PLAN-GENERAL.md`, `sprint.md`, journaux, scopes) **sur staging**, après `git diff --check`. Hors cette carte.
2. Merger **uniquement** cette candidate (cette branche, SHA Verify), jamais `task/DA30-014-couts-budgets`, `task/DA30-015-adaptateurs-abo` ni `task/DA40-020-process-cpu-ram` séparément. Arrêt au premier conflit non trivial. Jamais `--force`. Jamais `dev`, `develop`, `main`, `master`.
3. `git push origin staging` seulement. Pas d’autre remote de branche. Jamais `--force`.
4. `git worktree remove` seulement si l’arbre `features/tasks/` est propre.
   - `DA30-014-couts-budgets` : retirable s’il est encore propre.
   - `DA30-015-adaptateurs-abo` : retirable s’il est encore propre.
   - `DA40-020-process-cpu-ram` : **exclu** tant que `.apex/` et `.project/tasks/DA40-020-process-cpu-ram/fixtures/` sont non suivis. Ne pas les effacer ici.
   - `DA20-007-candidate-integree-sprint-8` : seulement après promotion, s’il est propre.
   - Branches locales conservées. Worktrees métier, `s2`, `s3` intouchés.
5. Exemple Sprint 8 dans `docs/workflow/suivi-sprints.md` : après la promotion, pas dans ce Build.
