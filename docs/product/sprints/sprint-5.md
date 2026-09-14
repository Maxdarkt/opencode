# Sprint 5 — Moteur de contexte et tests agentiques

Statut : **completed** le 2026-09-14. ID MT : `77ff44c7-23cd-44d7-89c1-32dfecaccd9a` ; référence : `da-release-0.1-sprint-5`. Cinq cartes, 31 SP acceptés, 0 inachevée. Périmètre = **release 0.2**. Chrome maquette = 0.3 (hors sprint).

## Objectif et résultat

Packer le contexte (worktree, compaction, cache), borner l’agent, coller chaque chat à un arbre de carte, puis recetter des tests de **codage agentique** isolés vs `staging`.

Candidate locale : `c0df066c9` (`recette-agentique`), fusionnée dans `staging`. Pas de push `dev`/`main`/`master`.

| Carte | Résultat accepté | SP | Commit |
|---|---|---:|---|
| DA30-013 | Pack contexte : worktree, compaction, cache | 8 | `ee629dd7f` |
| DA10-007 | Chat lié au worktree de carte | 8 | `28038c5cf` |
| DA30-012 | Bornes : tours, budget, Interrupt | 5 | `201fa68c2` |
| DA10-008 | Bandeau agent et inspecteur de pack | 5 | `9bcddb2c0` |
| DA40-017 | Recette 0.2 : isolation, pack visible, Interrupt | 5 | `c0df066c9` |

## Réception et preuves

Remises Verify+commit dans le chat sprint. Preuves APEX stables sous `.project/tasks/DA*-*` (`verify.md`, smokes). `bun.lock` local sale sur DA10-008 : non mergé, worktree non retiré tant que sale.

## Dettes et suite

- Preview/prod (`develop`/`master`) facultatives, non faites.
- Worktrees métier `features/10-*`…`40-*` encore présents (legacy).
- DA10-008 : `bun.lock` post-install à écarter.
- Backlog 0.3–0.5 hors tableau : DA10-009, DA10-010, DA40-018 puis 0.4/0.5. Aucun Sprint 6 créé par cette clôture.

Preuves : [plan sortant](../../../.project/archives/sprint-5/plan-sortant.md).
