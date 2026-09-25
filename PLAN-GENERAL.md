# Daidalon — plan général

Mis à jour le 2026-09-25. Projet MT DA. `staging` = intégration des worktrees. `develop` = preview. `master` = prod. Sprint 8 **clos**. [Index sprints](sprint.md).

## Travail courant

Aucun sprint MT actif. Release 0.5 (Économie) livrée sur `staging`. Backlog suivant : cockpit V2.

## Chaîne jusqu’au livrable

M0 → S1–S4 (0.1) → S5 (0.2 C) → S6 (0.3 chrome) → S7 (0.4 W5+S) → **S8 (0.5 E, clos)** → catalogue [`livrable.md`](docs/product/livrable.md).

## Cockpit V2 (backlog)

Hors sprint. Feature [`cockpit-v2`](.project/features/cockpit-v2/STORIES.md). Contrat visuel : `docs/product/maquette/cockpit-cursor.html`. Worktree `10`, un seul écrivain.

| Carte | SP | MT | Story | Dépend |
|---|---:|---|---|---|
| DA10-013 | 5 | todo | US-11 | — |
| DA10-015 | 3 | todo | US-14 | DA40-020 |
| DA10-012 | 5 | todo | US-12 | — |
| DA10-017 | 3 | todo | US-16 | DA10-012 |
| DA10-014 | 3 | todo | US-13 | DA10-012, DA30-014, DA40-020 |
| DA10-016 | 2 | todo | US-15 | DA10-012 |
| DA10-018 | 3 | todo | US-17 | DA10-012, DA10-017 |

`placement-distant` (US-01 à US-10) n’a pas de carte dans ce lot.

## Historique

Sprints clos : [index](sprint.md) · [archives](.project/archives/index.md).

Sprint 8 : 4 archived, 18 SP, merge `6d6de081f` (candidate `cbdf61e67`) ; [bilan](docs/product/sprints/sprint-8.md).
Sprint 7 : 4 archived, 15 SP + 021, merge candidate `4f1764b59` puis 021 `e9e2aed10` ; [bilan](docs/product/sprints/sprint-7.md).
Sprint 6 : 3 archived, 19 SP, merge `b7d70d3f8` ; [bilan](docs/product/sprints/sprint-6.md).
Sprint 5 : 5 archived, 31 SP, merge `0014d62e1` ; [bilan](docs/product/sprints/sprint-5.md).
Sprint 4 : 7 archived, 35 SP, merge `b3aa79245` ; [bilan](docs/product/sprints/sprint-4.md).
