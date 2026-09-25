# Sprint 7 — Preview make dev et conducteur

Statut : **completed** le 2026-09-25. ID MT : `c6ac90e2-78ea-4955-a13e-7a64ab9d490d` ; référence : `da-release-0.1-sprint-7`. Quatre cartes, 15 SP acceptés (DA40-021 SP MT non renseignés), 0 inachevée. Périmètre = **release 0.4** + alignement ports Cursor.

## Objectif et résultat

W5 preview `make dev` du worktree + S1/S2/S4 conducteur (éligibles, prompt collable, pilote ne code pas) + S3 candidate merge `staging` + ports 6400 / bind `0.0.0.0` (DA40-021).

Candidate locale : `df2885ba1` (`candidate-merge`, 011+019). DA40-021 livrée à part : `f13b0ecff`. Fusion dans `staging` après ce bilan (SHAs de merge consignés ci-dessous après promotion).

| Carte | Résultat accepté | SP | Commit |
|---|---|---:|---|
| DA40-019 | Start/stop make dev borné à l’arbre, ports `.make.env` | 5 | `390de4e2c` (`d2fb5ea0f` verify) |
| DA10-011 | Conducteur : éligibles, prompt collable, pilote ne code pas | 5 | `9759f10bf` (`da8c68597` verify) |
| DA20-006 | Candidate unique, procédure merge, garde-fous | 5 | `1292aafe9` (`df2885ba1` verify) |
| DA40-021 | Ports 6400–6499, UI 6400 / backend 6402, listen 0.0.0.0 | — | `801e783ac` (`f13b0ecff` verify) |

## Réception et preuves

Remises Verify+commit dans le chat sprint. Preuves APEX stables sous `.project/tasks/DA40-019-preview-make-dev`, `DA10-011-conducteur-sprint`, `DA20-006-candidate-merge`, `DA40-021-ports-6400-bind`. Registre Codex DA : `e8f573c8c` (local, sans push).

## Dettes et suite

- Candidate 0.4 n’incluait pas 021 : promotion = merge candidate **puis** branche 021.
- Preview/prod (`develop`/`master`) facultatives, non faites.
- Worktrees métier `features/10-*`…`40-*` encore présents (legacy).
- Backlog 0.5 hors tableau : DA30-014, DA30-015, DA40-020. Aucun Sprint 8 créé par cette clôture.

Preuves : [plan sortant](../../../.project/archives/sprint-7/plan-sortant.md).
