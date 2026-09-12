# Proposition Sprint 5 — Workbench Cursor + conducteur + économie visible

Statut : **proposition**. Aucun sprint MT créé. Vision : [`../vision.md`](../vision.md).

## Objectif

Look figé par la [maquette](../maquette.md). Features : [`livrable.md`](../livrable.md).

Base : `staging` `b2241f14c`.

## Lots (~24 SP)

| Ordre | Thème | Résultat | SP |
|---:|---|---:|---:|
| 1 | DA10 | Rail + panneaux : carte, phase, worktree, branche vs `staging`, tokens/coût (`unknown` si absent) | 8 |
| 2 | DA10 | Conducteur : tâches éligibles (dépendances), prompt à coller, pas de second chat | 5 |
| 3 | DA40 | Start/stop `make dev` du worktree + ouvrir le navigateur sur l’UI | 5 |
| 4 | DA40 | Candidate + recette 1440 / 1024 | 3 |
| 5 | DA40 | Orchestration | 3 |

`DA30-011` hors chemin. Worktrees métier : ne pas les recréer.

## Contrat

1. Faits = projections fraîches.
2. Isolation A/B.
3. Le rail montre le worktree.
4. Serveurs bornés à **cet** arbre / ces ports.
5. Pas de Git/agent mutatif depuis le cockpit (sauf start/stop preview).

## Chat suivant

`sprint-support` + `task-scope`. Créer `da-release-0.1-sprint-5`. Worktrees depuis `b2241f14c`. Pas de Build sur `staging`.
