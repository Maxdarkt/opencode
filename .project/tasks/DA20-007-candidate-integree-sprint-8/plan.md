# Plan — DA20-007 — Candidate Sprint 8

## Mandat

Analyze validé (6 décisions). Build local sur
`task/DA20-007-candidate-integree-sprint-8` dans
`/Users/leanbot/Documents/40_Daidalon/features/tasks/DA20-007-candidate-integree-sprint-8`.
HEAD de départ `8db56f535`. `runtime_profile: none` jusqu’à la fin, Smoke inclus.

**Interdit pendant Build / Smoke / Verify :** merge vers `staging`,
`git push`, `git worktree remove`, rebase, `--force`, cibles
`dev` / `develop` / `main` / `master`. Promotion = mandat user après
Verify+commit.

Succès : un SHA dont les ancêtres sont `7da410789`, `584401a7e` et
`27146219b` ; checklist APEX ; checks verts ; `git status` propre ;
commit local sur cette branche seulement.

## Décisions figées

1. Merge `ort --no-ff`, ordre `7da410789` puis `584401a7e` puis
   `27146219b`. Stop au premier conflit non trivial. Tips Verify entiers.
2. Aucune porte Git externe. Commit post-Verify = cette branche.
3. `procedure-promotion.md` dans le dossier APEX. Pas d’édition de
   `docs/workflow/suivi-sprints.md`.
4. DA40-020 reste non retiré (`.apex/` et `fixtures/` non suivis).
5. Checks : typecheck schema / core / client / app ; tests ciblés ;
   `git diff --check`. Smoke sans serveur.
6. Après Verify+commit : stop et remise sprint.

## Blocs

### B1 — Assemblage local

Depuis ce worktree :

1. `git merge --no-ff 7da410789` (DA30-014).
2. `git merge --no-ff 584401a7e` (DA30-015).
3. `git merge --no-ff 27146219b` (DA40-020).

Relire `packages/client/src/generated/types.ts` : symboles coût (014)
et make-dev CPU/RAM (020) présents ensemble. Marqueurs `<<<<<<<` → stop,
ne pas continuer le merge suivant.

Checks B1 : `git merge-base --is-ancestor` pour les trois SHA ;
`git diff --check` ; zéro marqueur. Livrable `blocs/B1.md`.

### B2 — Procédure de promotion

Écrire `.project/tasks/DA20-007-candidate-integree-sprint-8/procedure-promotion.md`.

Checklist, non exécutée ici :

1. Ranger le checkout `staging` sale avant tout merge.
2. Merger **uniquement** cette candidate (branche + SHA Verify), jamais
   les trois branches séparément. Arrêt au conflit. Jamais `--force`.
   Jamais `dev` / `develop` / `main` / `master`.
3. `git push origin staging` seulement.
4. `git worktree remove` seulement des arbres `features/tasks/` du
   sprint **propres**. DA40-020 est exclu tant que `.apex/` et
   `fixtures/` sont présents. Ne pas les effacer dans cette carte.
   Branches locales conservées. Métier / `s2` / `s3` intouchés.
5. L’exemple Sprint 8 de `suivi-sprints.md` s’écrit après promotion,
   hors ce Build.

SHA Verify : placeholder `VERIFY_SHA`, rempli au Verify.

Checks B2 : `git diff --check` sur le fichier. Pas de serveur.
Livrable `blocs/B2.md`.

## Checks de clôture (Verify)

Depuis les paquets, pas la racine du dépôt :

- `packages/schema` : `bun typecheck`
- `packages/core` : `bun typecheck` puis `bun test` sur
  `session-runner-cost.test.ts`, `session-runner.test.ts`,
  `task-metrics.test.ts`, `make-dev.test.ts`
- `packages/client` : `bun typecheck`
- `packages/app` : `bun typecheck` puis `bun test` unitaire sur
  `budget-alert.test.ts`, `pack-inspector.test.ts`,
  `billing-channel.test.ts`, `session-make-dev.test.ts`
- `git diff --check`
- ancêtres des trois SHA ; status propre hors liens ignorés

Pas de `bun run generate`. Pas de suite browser ni e2e.

## Smoke

Pas de wake. `runtime_profile: none`.

Vérifier `git merge-base --is-ancestor` des trois SHA, `git log` de la
candidate, `git status` propre. Écrire `smoke-report.md` seulement
après ça.

## Pathset

- Merges des trois tips (fichiers déjà dans chaque lot)
- `packages/client/src/generated/types.ts` (relecture, pas une réécriture manuelle)
- `.project/tasks/DA20-007-candidate-integree-sprint-8/procedure-promotion.md`
- APEX `blocs/`, `smoke-report.md`, `verify.md`, `STATE.md`

Hors pathset : `docs/workflow/suivi-sprints.md`, `staging`, worktrees
sources, DA20-006, `.apex/` et fixtures de DA40-020.

## Risques

Auto-merge de `generated/types.ts`. Staging sale si quelqu’un merge
trop tôt. Retrait prématuré de DA40-020.
