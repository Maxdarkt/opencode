# Sprint 4 — Cockpit Sprint lecture seule

Statut : completed le 2026-09-12. ID MT : `5059b73b-d8e8-40db-b9d5-1cbfb5c6424e` ; référence : `da-release-0.1-sprint-4`. Sept cartes produit, 35 SP acceptés, 0 inachevée. La carte d’orchestration `DA40-016` (3 SP planifiés) n’est plus présente dans MT au moment de la clôture ; preuves APEX conservées, carte non recréée.

## Objectif et résultat

Livrer un cockpit Sprint réel en lecture seule, issu de la maquette UX : rail, canvas, contexte, topologie Git et métriques honnêtes, isolés entre A et B. Aucune action mutative depuis le cockpit.

Candidate locale : `545718268`, fusionnée dans `staging` au merge `b3aa79245`, poussée sur `origin/staging`. Worktrees de cartes Sprint 4 retirés. Pas de push `dev`/`main`/`master`.

| Carte | Résultat accepté | SP | Commit / preuve |
|---|---|---:|---|
| DA10-006 | Maquette isolée, deux formats, zéro requête hors origine | 3 | `9de3b2e1c` |
| DA30-009 | File séquentielle et autorité A→B fail-closed | 8 | `3fa91aba1` |
| DA20-004 | Projection `TaskOwnership` lecture seule | 5 | `7df15b2cd` |
| DA20-005 | Projection `RepositoryTopology` lecture seule | 3 | `cfa081ca8` |
| DA30-010 | Métriques + provenance, jamais un faux zéro | 5 | `7c8d490f0` |
| DA10-005 | Cockpit réel branché aux projections | 8 | feat `35e7d83d5` ; tip `5d18386f1` |
| DA40-015 | Candidate, fixtures A/B, recette 1440/1024 | 3 | `545718268` |
| DA40-016 | Orchestration Cursor (parent) | 3 | APEX seulement ; absent de MT à la clôture |

## Réception et preuves

- Remises Verify+commit dans le [ledger](../../../.project/sprints/5059b73b-d8e8-40db-b9d5-1cbfb5c6424e/remittances.md).
- Recette parent A/B aux deux tailles, simulation inerte, faits `unknown`/`absent` sans faux zéro (`smoke-report.md` DA40-015).
- Méthode Cursor figée : une carte = un worktree sous `features/tasks/` ; DA10/20/30/40 = thème ; `/summarize` optionnel aux waits Analyze/Plan.

## Dettes et suite

- Candidate non promue vers `develop`/`master` (preview/prod facultatives).
- `DA40-016` manquante dans MT.
- Worktrees métier permanents encore présents (legacy).
- `DA30-011` **archived** le 2026-09-12 (hors 0.2).
- Sprint 5 **active** : [suivi](./sprint-5.md). 0.3 hors sprint.

Preuves : [STATE parent](../../../.project/tasks/DA40-016-orchestration-sprint-4/STATE.md), [plan sortant](../../../.project/archives/sprint-4/plan-sortant.md).
