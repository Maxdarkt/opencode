# Analyze — DA40-015 — Candidate intégrée Sprint 4

## Objectif et autorité

Assembler une candidate locale **exacte** des lots Sprint 4 déjà reçus, rejouer les checks, fournir des fixtures A/B temporaires (hors MT) et une recette parent reproductible : A active, passage B, reprise, divergence/refus fail-closed, lecture seule, aux tailles `1440×900` et `1024×768`.

MT `DA40-015` est déjà `in_progress` (sprint `da-release-0.1-sprint-4`). Ce chat ne le remet pas en `todo` et ne le passe pas `done`. Hors périmètre : push, tag, merge, rebase, déploiement, publication, suppression/réalignement de worktree, Build sur staging, mutation `TaskExecution.resume`.

Scope matérialisé ici depuis `features/40-tooling/.project/tasks/DA40-015-candidate-integree-sprint-4/scope.md`.

## Git

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA40-015-candidate-integree`
- Branche : `task/DA40-015-candidate-integree` (créée)
- Base et HEAD : `5d18386f1` (`chore(app): record DA10-005 verify commit SHA`)
- Index propre. Pas de cherry-pick : la chaîne des lots est **déjà linéaire** sur ce SHA.

## Provenance des lots (ancêtres de HEAD)

| Lot | SHA feat | Record | Dans HEAD |
|---|---|---|---|
| DA30-009 file / autorité | `3fa91aba1` | — | oui |
| DA20-004 ownership | `7df15b2cd` | — | oui |
| DA20-005 topologie (lot 4, hors liste scope « quatre » mais requis par DA10-005) | `cfa081ca8` | — | oui |
| DA30-010 métriques | `91485d37b` | `7c8d490f0` | oui |
| DA10-005 cockpit | `35e7d83d5` | `5d18386f1` (HEAD) | oui |

Aucun merge `staging`. DA10-006 maquette `9de3b2e1c` n’est pas un ancêtre obligatoire : le cockpit réel a déjà repris les fichiers App.

## Surfaces déjà présentes

- Schema/Core : `TaskQueue`, `TaskAuthority`, `TaskOwnership`, `RepositoryTopology`, `TaskMetrics`.
- HttpApi lecture : `POST /global/ownership`, `/topology`, `/metrics`. Pas d’endpoint file dédié ; la file transite via métriques `queue?` / ownership `result`.
- App : route `/sprint/cockpit`, mapper fail-closed, dialogue simulation inerte, fallback UI si POST KO.
- Entrée actuelle `sprint-cockpit-input.ts` : identités `DA10-005-A` / `DA10-005-B`. Worktree A observé existant ; companion B **absent** (`DA10-005-companion` manquant). Smoke DA10-005 a déjà montré des faits `absent`/`unknown` — utile pour le refus, **insuffisant** pour une transition B réelle.

## Décisions proposées (à valider pour Plan)

1. **Pas de ré-intégration Git des lots.** La candidate *est* `5d18386f1`. Les blocs Build = fixtures temporaires + recette + checks rejoués + smoke parent, pas de cherry-pick.
2. **Fixtures A/B hors MT**, identités `DA40-015-A` / `DA40-015-B` (pas de `mt_create_task`). A = ce worktree / HEAD `5d18386f1`. B = checkout isolé temporaire (répertoire jetable sous le dossier APEX, **pas** un second `git worktree add` du dépôt source). Divergence = identité/HEAD/branche volontairement non concordants. Refus fail-closed = payload invalide / `mergeTarget` vide / token A présenté pour B.
3. **Overlay d’entrée borné** : document d’entrée recette (APEX + éventuellement `sprint-cockpit-input.ts` si le Plan borne un bascule fixture). Ne pas changer Schema/Core/HttpApi sauf correction d’intégration strictement justifiée (alors bloc C, retour sprint si fonctionnel source).
4. **Checks** : typecheck schema/core/opencode/app ; tests ciblés queue/ownership/topology/metrics + HTTP global + `sprint-cockpit.test.ts` ; `git diff --check`. Pas de suite Schema `event-manifest` comme gate (dette héritée DA30-005 si encore rouge).
5. **Smoke** : ports Make dédiés (`WORKTREE_CODE` libre, ex. `15` → `4115`/`4415`), URL `http://127.0.0.1:<UI>/sprint/cockpit`, Chrome Cursor, deux viewports. Preuve lecture seule (dialogue simulation, zéro écriture Git/MT). Arrêt des seuls process lancés.
6. **Commit local** après Verify PASS : dossier APEX DA40-015 + fixtures/recette du pathset Plan ; jamais `.make.env`, jamais push/merge.

## Risques

- Fuite d’identité A→B (contrat sprint 4). Mitigation : fixtures distinctes + assertions UI et HTTP.
- Companion B manquant aujourd’hui : sans fixture temporaire, la recette « transition B » est incomplète.
- Collision de ports avec d’autres worktrees : code Make dédié, `preflight-ports`.
- Conflit Git ou delta produit inexpliqué → stop, retour sprint (mandat).

## Dettes héritées

- i18n hors pathset : inventorier, ne pas masquer.
- Pas d’endpoint HTTP `TaskQueue` dédié : observer via projections existantes, ne pas en créer ici.
- PLAN-GENERAL / `sprint.md` de **ce** HEAD sont datés Sprint 3 : hors scope de réécrire les docs sprint (autorité = staging / DA40-016).

Aucun blocage d’autorité. Analyze prêt pour validation humaine.
