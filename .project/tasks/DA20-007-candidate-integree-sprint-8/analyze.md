# Analyze — DA20-007 — Candidate intégrée Sprint 8

## Git, MT, autorité

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA20-007-candidate-integree-sprint-8`
- Branche : `task/DA20-007-candidate-integree-sprint-8` @ `8db56f535` (base demandée)
- APEX : `.project/tasks/DA20-007-candidate-integree-sprint-8`
- MT `DA20-007` : `in_progress` (Sprint 8 `da-release-0.1-sprint-8`)
- Thème DA20. Pas un checkout `features/20-workspace-git`.
- Aucune écriture produit sur `staging`.
- `runtime_profile: none`. `node_modules` et `.make.env` liés depuis le checkout source (lockfile identique).
- Git destructif (merge `staging`, push, `worktree remove`, rebase, `--force`) : interdit pendant Build. Promotion = mandat séparé après Verify.

## Objectif

Une candidate locale qui contient DA30-014, DA30-015 et DA40-020. Une checklist de promotion vers `staging`. Pas d’exécution de cette promotion ici.

## Entrées observées

| Carte | Branche | SHA | Commits depuis la base | Worktree |
|---|---|---|---|---|
| DA30-014 | `task/DA30-014-couts-budgets` | `7da410789` | `ca0aec2ca` feat + verify docs | propre |
| DA30-015 | `task/DA30-015-adaptateurs-abo` | `584401a7e` | `232bfaedb` feat + verify docs | propre |
| DA40-020 | `task/DA40-020-process-cpu-ram` | `27146219b` | `22231e7ac` feat + verify docs | sale : `?? .apex/` et `?? .project/tasks/DA40-020-process-cpu-ram/fixtures/` |

Les trois tips ont `8db56f535` pour ancêtre. Le SHA à merger est le tip Verify, pas seulement le feat. Les fichiers non suivis de DA40-020 restent hors SHA.

## Surfaces

Seul chemin commun aux diffs : `packages/client/src/generated/types.ts` (014 et 020). 015 ne partage aucun chemin avec 014 ni 020.

Lots :

- 014 : schema session, core coût / task-metrics, app budget + cockpit, types générés.
- 015 : app dialogues provider + i18n + `billing-channel`.
- 020 : schema / core `make-dev`, app inspecteur CPU/RAM, types générés.

`docs/workflow/suivi-sprints.md` cite encore Sprint 7 (`candidate-merge` / `1292aafe9` / DA20-006). L’exemple Sprint 8 s’écrit **après** promotion, pas pendant ce Build.

## Assemblage (lecture seule)

`git merge-tree --write-tree` enchaîné, sans bouger de ref :

1. HEAD + `7da410789` → arbre `c87996b5c`, exit 0
2. ce résultat + `584401a7e` → arbre `3cbfca6a3`, exit 0
3. ce résultat + `27146219b` → arbre `4e7c56f79`, exit 0

Aucun chemin en conflit. L’arbre simulé contient `budget-alert.ts`, `billing-channel.ts` et `make-dev.ts`. HEAD de la branche reste `8db56f535`.

## Staging (observation)

Checkout `Daidalon/` `staging` sale : docs et journaux Sprint 7/8, `PLAN-GENERAL.md`, `sprint.md`, scopes DA10-012…017, dossier APEX DA20-007 non versionné, `.cursor/permissions.json`. À ranger **sur staging** avant promotion, hors Build.

## Décisions proposées

1. **Candidate = ce worktree.** Après Plan, Build fusionne en local, `ort --no-ff`, dans l’ordre `7da410789`, puis `584401a7e`, puis `27146219b`. Stop au premier conflit non trivial. Pas de cherry-pick du seul feat. Pas de merge `staging`.

2. **Aucune porte Git externe pendant Build.** Pas de push, pas de `worktree remove`, pas de rebase, pas de `--force`. Le commit post-Verify reste sur cette branche.

3. **Procédure dans le dossier APEX** (`procedure-promotion.md`) : une candidate, jamais les trois branches ; `git push origin staging` seulement ; `worktree remove` seulement des arbres `features/tasks/` du sprint **propres**. `suivi-sprints.md` n’est pas modifié dans ce Build.

4. **DA40-020 n’est pas propre.** La checklist refuse son `worktree remove` tant que `.apex/` et `fixtures/` sont là. Cette carte ne les efface pas.

5. **Checks.** Typecheck `schema`, `core`, `client`, `app`. Tests ciblés : core `session-runner-cost`, `session-runner`, `task-metrics`, `make-dev` ; app `budget-alert`, `pack-inspector`, `billing-channel`, `session-make-dev`. `git diff --check`. Smoke sans serveur : ancêtres des trois SHA, log, `git status` propre.

6. **Promotion différée.** Après Verify+commit, stop et remise sprint. Le parent merge cette candidate seulement sur mandat explicite.

## Hors périmètre

Force-push. Cibles `dev` / `develop` / `main` / `master`. `worktree remove` ici. Worktrees métier. Réécriture de DA20-006. Nouveau produit. Nettoyage du staging sale.

## Risques

- Auto-merge de `generated/types.ts` : relire au Build que les symboles 014 et 020 coexistent.
- Staging sale : un merge vers `staging` maintenant mélangerait des docs non versionnées.
- Retirer DA40-020 avant d’avoir traité ses fichiers non suivis perdrait la fixture locale.

## Décisions ouvertes

Les 6 décisions ci-dessus. À valider avant Plan.
