# Analyze — DA10-005 — Cockpit Sprint réel en lecture seule

## Git, MT, autorité

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA10-005-cockpit-sprint`
- Branche : `task/DA10-005-cockpit-sprint`
- Base `cfa081ca8` (DA20-005) + merge `7c8d490f0` (DA30-010) **sans conflit** → HEAD `134d73ea1`
- Pas de merge `staging`. MT `DA10-005` `in_progress` (requête `bff69e56-4919-4674-895e-fc769cf5c72d`).
- Scope historique `DA10-005-vue-sprint-deux-taches` (deux tâches, chat existant) **incomplet** ; relire [sprint-4.md](../../../../docs/product/sprints/sprint-4.md) et [sprint-4-proposal.md](../../../../docs/product/sprints/sprint-4-proposal.md). `scope.md` local réécrit.

## Objectif

Cockpit **réel** lecture seule : rail (activité / attention bleue), canvas
pleine hauteur, panneau droit (Task status, contexte vérifiable, topologie
Git). Données = projections, pas des faits fixture. Le pilote garde objectif
et reprises ; chaque tâche garde chat / worktree / preuves. Aucune action
mutative dans ce Sprint.

## Surfaces observées (ce HEAD)

| Projection | Où | Consommable par App ? |
| --- | --- | --- |
| `TaskOwnership` | Schema + Core `read(entries, snapshotPath?)` | Non : **pas d’HttpApi** |
| `RepositoryTopology` | Schema + Core `read({ ownership, repositories[] })` ; `mergeTarget` obligatoire, jamais inféré | Non : **pas d’HttpApi** |
| `TaskMetrics` | Schema + Core + `POST /global/metrics` + SDK | Oui |
| File DA30-009 | Schema `TaskQueue` + Core ; métriques peuvent passer `queue?` | Pas d’endpoint file dédié |

Contrat App : Schema/Protocol seulement, jamais Core/Server. Donc DA10-005
**doit** exposer ownership et topologie en HttpApi lecture seule, puis
`bun run generate` (client) + SDK JS.

`RepositoryTopology.Input.repositories[]` exige `root`, `sourceRefs[]`
fournis, `mergeTarget` string (vide → faits `invalid`, pas de `rev-list`
de substitution). `TaskOwnership.Input.entries[]` exige des
`TaskBinding.Identity` complets (mtTaskID, session, checkout…). Aucun
`list()` de bindings n’existe : l’appelant fournit les identités.

Maquette DA10-006 (`9de3b2e1c`) **absente** de ce worktree (`merge-base
--is-ancestor` faux). Fichiers produit : `sprint-cockpit-prototype*.ts(x)`,
route `/prototype/sprint-cockpit`, `entry.tsx` isolé (pas d’`AppInterface`).
`git merge-tree` HEAD × `9de3b2e1c` : **0 CONFLICT**.

L’isolation prototype (zéro requête hors Vite) est **incompatible** avec
des projections live. Le cockpit réel doit vivre dans le shell normal
(SDK / `AppInterface`).

## Décisions proposées (à valider pour Plan)

1. **Base UX** — cherry-pick **fichiers App** de `9de3b2e1c` (pas le merge
   staging, pas obligation de prendre les `.project` DA10-006). Puis
   extraire layout/état ; retirer le bootstrap isolé pour la route réelle.
2. **Fil** — `POST /global/ownership` et `POST /global/topology` (payloads
   Schema, handlers Core `read` seulement). Pas d’agrégat inventé côté
   serveur. Métriques : endpoint existant.
3. **App** — route réelle (ex. `/sprint/cockpit`) dans `app.tsx` + shell.
   Mapper faits → UI : `available` affiche la valeur ; tout autre `State`
   affiche l’état + provenance, jamais `0` / vide silencieux.
4. **Entrée** — document d’entrée explicite (identités + `repositories[]`
   avec `mergeTarget`). Smoke : deux identités A/B (tmp ou bindings
   existants). DA40-015 porte la recette parent et les fixtures A/B
   d’intégration.
5. **Canvas** — onglets locaux (chat / terminal / git / browser) **sans**
   `TerminalPanel` / PTY / Review runtime. Chat : deep-link session liée
   si `execution`/`binding` `available` et `sessionID` présent ; sinon
   aperçu `unknown`. Jamais `session.create`.
6. **Actions sensibles** — dialogue « simulation — aucun effet » (lancer /
   commit / merge / production). Interdit : `TaskExecution.resume`, git
   mutatif, prune worktree, MT write.
7. **Indicateurs** — spinner si execution/autorité prouve un travail ;
   point bleu si attention `available` non vide. Statut métier = libellé
   séparé (autorité / file), jamais couleur seule.
8. **Responsive** — 1440×900 : rail ~240, panneau ~380, canvas flex.
   1024×768 : rail ~64, panneau drawer. A et B distinguables.

## Pathset probable (Plan détaillera)

- Cherry-pick / adaptation `packages/app/src/pages/sprint-cockpit-*`
- `packages/app/src/app.tsx`, `i18n/en.ts`, tests + e2e
- `packages/opencode/.../httpapi/groups/global.ts` + `handlers/global.ts` + tests
- SDK généré (pas d’édition manuelle `src/generated`)
- Hors pathset : Core/Schema des projections (stables), staging, worktrees métier

## Checks proposés

- `bun typecheck` App + opencode (+ schema/core si HTTP seulement)
- Tests App (mapper A/B, fail-closed, pas de callback mutatif)
- Tests HTTP ownership/topology lecture + métriques existantes
- `git diff --check`
- Smoke 1440×900 et 1024×768 (Chrome système si pas de Chromium Playwright)

## Risques

- Identités manquantes → file `blocked` / faits `absent` : UI doit rester
  lisible, pas masquer.
- Cherry-pick `entry.tsx` prototype vs cockpit live : ne pas conserver
  le court-circuit `AppInterface` sur la route réelle.
- Config repo : graver `staging`/`dev` comme `mergeTarget` = hors contrat.

## Hors analyse

Aucun Build, test produit, navigateur, generate SDK, second merge. Whitespace
docs seulement à l’écriture APEX.

## Reprise

Valider ces décisions → Plan borné (blocs, pathset, checks). Si le
cherry-pick UX ou les deux POST HTTP sont refusés, arrêter avant Plan.
