# Plan — DA40-015 — Candidate intégrée Sprint 4

## Mandat

HEAD `5d18386f1` **est** la candidate (lots déjà linéaires). Pas de cherry-pick, merge, rebase, push, staging, `TaskExecution.resume`, ni `git worktree add` pour B. MT reste `in_progress`. Analyze validé.

Succès : fixtures A/B temporaires hors MT, overlay d’entrée recette, checks rejoués, recette parent A → B → reprise → refus fail-closed → lecture seule, smoke 1440×900 et 1024×768, commit local APEX+pathset après Verify PASS.

## Décisions figées

1. Identités recette `DA40-015-A` / `DA40-015-B` (pas de `mt_create_task`).
2. A = ce worktree, HEAD `5d18386f1`, branche `task/DA40-015-candidate-integree`.
3. B = dépôt git jetable sous le dossier APEX (init + commit distinct), **pas** un worktree du dépôt source.
4. Overlay produit borné : `sprint-cockpit-input.ts` + tests/e2e/state qui figent les IDs. Schema/Core/HttpApi intouchés sauf C1 (correction d’intégration justifiée ; rupture fonctionnelle source → stop sprint).
5. Ports Make `WORKTREE_CODE=15` → `4115` / `4415`. `.make.env` ignoré, jamais commité.
6. Suite Schema `event-manifest` non-gate (dette DA30-005).

## Blocs

### B1 — Fixtures A/B + overlay entrée

Créer `.project/tasks/DA40-015-candidate-integree-sprint-4/fixtures/checkout-b/` : `git init`, branche `task/DA40-015-B`, un commit dont le SHA ≠ `5d18386f1`. Documenter le chemin absolu.

Mettre à jour l’entrée cockpit :

- A : `mtTaskID` `DA40-015-A`, `directory`/`worktree` = worktree DA40-015, `branch` = branche tâche, `head` = `5d18386f1`, `apexExternalRef` = dossier APEX de cette carte.
- B : `DA40-015-B`, chemins = `fixtures/checkout-b`, branche `task/DA40-015-B`, `head` = SHA du commit B.
- `repositories[]` : `root` dépôt source, `sourceRefs` A+B+`dev`, `mergeTarget` `"dev"` (jamais inféré).
- Défaut layout : sélection A.

Aligner tests/e2e qui assertent `DA10-005-*`. Ne pas créer de cartes MT.

Divergence / refus (préparés, exercés en Smoke) : `mergeTarget` vide ; payload invalide ; identité/token A présenté pour B. Pas de mutation Git/MT.

Checks B1 : `bun typecheck` `packages/app` ; `bun test` `packages/app` ciblé `sprint-cockpit.test.ts` ; `git diff --check` pathset B1.

Livrable : `blocs/B1.md`.

### B2 — Checks techniques rejoués

Sans changer le produit sauf C1.

- `packages/schema` : `bun typecheck` (pas la suite `event-manifest` comme gate).
- `packages/core` : `bun typecheck` ; tests `task-queue`, `task-ownership`, `repository-topology`, `task-metrics`.
- `packages/opencode` : `bun typecheck` ; `httpapi-global.test.ts`.
- `packages/app` : `bun typecheck` ; `sprint-cockpit.test.ts`.
- `git diff --check`.

Rouge nouveau non isolable → stop sprint. C1 seulement si delta d’intégration strict, puis rejouer les checks touchés.

Livrable : `blocs/B2.md`.

### B3 — Recette parent

Écrire `recette-parent.md` (APEX) : URL `http://127.0.0.1:4415/sprint/cockpit` ; Make `config-check` / `preflight-ports` / `dev` ; Chrome Cursor.

Séquence aux deux viewports :

1. A active (identité, worktree, branche, HEAD `5d18386f1`).
2. Passage B (identité B, checkout-b, HEAD ≠ A).
3. Reprise A (sélection A, pas de fuite d’identité A→B).
4. Refus fail-closed (mergeTarget vide / payload invalide / token A pour B) → faits `invalid`/`absent`/`unknown`, pas de chiffres inventés.
5. Lecture seule : dialogue simulation, zéro écriture Git/MT, arrêt des seuls process lancés.

Livrable : `blocs/B3.md` + `recette-parent.md`.

## Pathset

- `packages/app/src/pages/sprint-cockpit-input.ts`
- `packages/app/src/pages/sprint-cockpit-state.ts` (défaut ID si encore `DA10-005-A`)
- `packages/app/src/pages/sprint-cockpit.test.ts`
- `packages/app/e2e/sprint-cockpit.spec.ts`
- `.project/tasks/DA40-015-candidate-integree-sprint-4/**` (scope, analyze, plan, blocs, recette, fixtures, STATE, verify, smoke-report)

Hors pathset : Schema/Core/HttpApi (sauf C1), `.make.env`, `PLAN-GENERAL.md` / `sprint.md` de ce HEAD, staging, worktrees métier, endpoint `TaskQueue`.

## Smoke (après B3, même chaîne)

Alerte courte puis exécuter `recette-parent.md`. Preuves : snapshots/notes APEX. `smoke-report.md`.

## Verify + commit

`verify.md` : HEAD, pathset, checks PASS, SHA commit. Commit local `chore(app): …` — dossier APEX + overlay App du pathset. Pas de push/merge. Remise SHA au sprint. MT non `done` ici.

## Arrêt

Conflit Git / delta produit inexpliqué / C1 fonctionnel source / checks encore rouges / secrets dans le diff.
