# DA10-005 — Cockpit Sprint réel en lecture seule

## Objectif

Livrer le cockpit Sprint **réel**, en lecture seule : rail, canvas, panneau
droit (Task status, contexte vérifiable, topologie), alimenté par les
projections `TaskOwnership`, `RepositoryTopology` et `TaskMetrics`.
Hiérarchie UX = maquette DA10-006 (`9de3b2e1c`).

## Périmètre

- Consommer les projections existantes ; ne pas les réécrire.
- HttpApi lecture seule + SDK généré (App n’importe jamais Core).
- Faits absents/expirés/divergents → `unknown` / état tagué, jamais un faux zéro.
- Isolation A/B : aucun owner, worktree, métrique ou attention copié.
- Actions : confirmation inerte ou deep-link vers une session **déjà** liée.
- Viewports 1440×900 et 1024×768.

Hors périmètre : parallélisme, `TaskExecution.resume`, mutations Git,
création de chat, merge/push/staging, recette candidate (DA40-015).

## Acceptation

- Rail + canvas + panneau droit lisibles aux deux formats.
- Données issues des projections (pas des fixtures de faits).
- Tests App ciblés, typecheck, HTTP lecture, smoke visuel.

## Dépendances

DA20-004 (`7df15b2cd`), DA20-005 (`cfa081ca8`), DA30-009 (`3fa91aba1`),
DA30-010 (`7c8d490f0`). UX : DA10-006 (`9de3b2e1c`). Remise à DA40-015.
