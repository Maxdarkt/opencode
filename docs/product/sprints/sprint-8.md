# Sprint 8 — Économie

Statut : **completed** le 2026-09-25. ID MT : `c9e19429-6cef-4a38-b737-e0147ff5053d` ; référence : `da-release-0.1-sprint-8`. Quatre cartes, 18 SP acceptés, 0 inachevée. Périmètre = **release 0.5** + candidate Git.

## Objectif et résultat

E1–E2 coûts et budgets honnêtes (DA30-014) + E3 adaptateurs d’abonnement LLM (DA30-015) + E4 CPU/RAM des process du worktree (DA40-020) + candidate unique (DA20-007).

Candidate locale : `cbdf61e67` (ancêtres `7da410789`, `584401a7e`, `27146219b`). Promotion `staging` : merge de cette SHA seulement. Preview/prod non faites.

| Carte | Résultat accepté | SP | Commit |
|---|---|---:|---|
| DA30-014 | Budget `unknown`, pas un faux zéro | 5 | `ca0aec2ca` (`7da410789` verify) |
| DA30-015 | Libellé `API` sur le formulaire personnalisé | 5 | `232bfaedb` (`584401a7e` verify) |
| DA40-020 | CPU/RAM inspecteur Serveurs `0% · 3 Mo` puis `—` | 3 | `22231e7ac` (`27146219b` verify) |
| DA20-007 | Candidate 014+015+020, procédure promotion | 5 | assemblage `efb74290b` (`cbdf61e67` verify) |

## Réception et preuves

Remises Verify+commit dans le chat sprint. Preuves APEX stables sous `.project/tasks/DA30-014-couts-budgets`, `DA30-015-adaptateurs-abo`, `DA40-020-process-cpu-ram`, `DA20-007-candidate-integree-sprint-8`.

DA30-015 : Smoke cockpit FAIL puis scope recadré (session + catalogue affiché).

## Dettes et suite

- Worktree `DA40-020-process-cpu-ram` **non retiré** : untracked `.apex/` + `fixtures/code-91`.
- Preview/prod (`develop`/`master`) facultatives, non faites.
- Worktrees métier `features/10-*`…`40-*` encore présents (legacy).
- Backlog cockpit V2 : DA10-012 … DA10-018, hors ce sprint.

Preuves : [plan sortant](../../../.project/archives/sprint-8/plan-sortant.md).
