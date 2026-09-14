# Sprint 6 — Chrome cockpit = maquette

Statut : **completed** le 2026-09-14. ID MT : `804083e3-534a-4f81-8182-05fc21f15dfb` ; référence : `da-release-0.1-sprint-6`. Trois cartes, 19 SP acceptés, 0 inachevée. Périmètre = **release 0.3**. Preview `make dev` = 0.4 (hors sprint).

## Objectif et résultat

Aligner le chrome App sur la maquette figée : rail, chat, terminal, inspecteur, panneau secondaire Browser / Diff / Files, recette visuelle 1440 / 1024.

Candidate locale : `e8723cb5b` (`recette-maquette`), fusionnée dans `staging` au merge `b7d70d3f8`. Pas de push `dev`/`main`/`master`.

| Carte | Résultat accepté | SP | Commit |
|---|---|---:|---|
| DA10-009 | Chrome : rail, chat, terminal split, inspecteur flottant | 8 | `f6f54383c` (`58eb94ecc` verify) |
| DA10-010 | Panneau secondaire : Browser, Diff, Files | 8 | `4f39692c8` (`fecaf044c` verify) |
| DA40-018 | Recette 0.3 : maquette 1440 / 1024, écarts nuls | 3 | `debc685d8` (`e8723cb5b` verify) |

## Réception et preuves

Remises Verify+commit dans le chat sprint. Preuves APEX stables sous `.project/tasks/DA10-009-chrome-cockpit`, `DA10-010-panneau-secondaire`, `DA40-018-recette-maquette`. Écarts 0.3 nuls (`ecarts.md`). Isolation A/B inchangée.

## Dettes et suite

- Playwright E2E skip (Chromium absent). Session live App limitée (non inventée).
- Preview/prod (`develop`/`master`) facultatives, non faites.
- Worktrees métier `features/10-*`…`40-*` encore présents (legacy).
- DA10-008 S5 : `bun.lock` post-install, hors ce sprint.
- Backlog 0.4–0.5 hors tableau : DA40-019, DA10-011, DA20-006 puis 0.5. Aucun Sprint 7 créé par cette clôture.

Preuves : [plan sortant](../../../.project/archives/sprint-6/plan-sortant.md).
