# DA20-007 — Candidate intégrée Sprint 8

## Objectif

Une candidate locale qui contient DA30-014, DA30-015 et DA40-020. Procédure de promotion vers `staging`. Git sensible isolé.

## Contexte et preuves

- Sprint 8 `da-release-0.1-sprint-8` encore **active**. 014, 015, 020 Verify PASS, MT **archived**.
- Base `staging` @ `8db56f535`.
- SHAs à intégrer (tips Verify) :

| Carte | Branche | SHA | Worktree |
|---|---|---|---|
| DA30-014 | `task/DA30-014-couts-budgets` | `7da410789` | `features/tasks/DA30-014-couts-budgets` (propre) |
| DA30-015 | `task/DA30-015-adaptateurs-abo` | `584401a7e` | `features/tasks/DA30-015-adaptateurs-abo` (propre) |
| DA40-020 | `task/DA40-020-process-cpu-ram` | `27146219b` | `features/tasks/DA40-020-process-cpu-ram` (untracked local `.apex/` + fixture `code-91` — hors SHA) |

- Checkout `staging` sale (docs Sprint 8). Les ranger **sur staging** avant toute promotion, hors Build de cette carte.
- DA20-006 (Sprint 7) reste archived ; ne pas la réécrire.

## Périmètre

- Worktree éphémère `features/tasks/DA20-007-candidate-integree-sprint-8`, branche `task/DA20-007-candidate-integree-sprint-8` depuis `8db56f535`.
- Merger localement les trois SHA ci-dessus, un par un, arrêt au premier conflit non trivial.
- Checks rejoués sur la candidate. Procédure écrite (checklist) pour merge `staging` + push `origin staging` + `worktree remove` des arbres **propres** du sprint.
- `runtime_profile: none`.

## Hors périmètre

- Merge / push vers `staging` pendant Analyze/Plan/Build (mandat promotion **séparé**, après Verify).
- Force-push. Cibles `dev` / `develop` / `main` / `master`.
- `worktree remove` pendant cette carte.
- Worktrees métier `features/10-*`…`s3-*`.
- Nouveau produit hors intégration des trois lots.

## Acceptation

1. Candidate propre dont les ancêtres incluent `7da410789`, `584401a7e`, `27146219b`.
2. Typecheck / tests des surfaces touchées rejoués PASS.
3. Procédure de promotion : une candidate, jamais les trois branches séparément ; jamais `--force`.
4. Pas de push, pas de merge `staging` dans ce Build.

## Surfaces

- Git local (merge-tree / merge des trois tips).
- `.project/tasks/DA20-007-candidate-integree-sprint-8/` (procedure, APEX).
- `docs/workflow/suivi-sprints.md` (exemple S8 après promotion, pas pendant Build).

## Dépendances, risques

- Dépend de 014, 015, 020 (faits, archived).
- Conflits possibles dans `packages/app` (014 coûts UI, 015 libellé canal, 020 inspecteur CPU).
- Git destructif : mandat Analyze/Plan **distinct** de la promotion parent.

## Smoke

Pas de runtime. Vérifier `git merge-base` / log de la candidate. `git status` propre. `runtime_profile: none`.

## Relation

Frère Sprint 7 : DA20-006 (archived, ne pas réutiliser). Après Verify+commit de DA20-007, le parent mergera **cette** candidate dans `staging` sur mandat explicite.
