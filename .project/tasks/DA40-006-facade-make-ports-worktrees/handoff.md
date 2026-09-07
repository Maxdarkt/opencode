# Handoff — DA40-006

## État de remise

Build, Smoke et Verify techniques sont terminés. La carte doit passer de `in_progress` à `review`, jamais à `done`. Aucun commit, push, merge, rebase, promotion ou suppression n'a été réalisé.

## Livrables

- `Makefile` : help, contexte, ports, préflight non destructif, installation, qualité ciblée et dev coordonné.
- `.make.env.example` et `.gitignore` : configuration locale sans secret et convention versionnée.
- `docs/product/worktrees.md` : table source/worktrees et mode d'emploi.
- Cinq `.make.env` locaux : créés après vérification d'absence, ignorés par Git; aucun secret.

## Validation

`make help/ports/context/preflight-ports`, les dry-runs, parsing `make -n dev`, la garde de configuration incohérente, l'absence de listener post-smoke, les cinq `git check-ignore`, `make format`, `make typecheck` et `git diff --check` sont verts. `make lint` reste rouge à cause de la baseline amont : détail dans `debts.md`.

Correctif de revue inclus : `dev` préflighte les deux ports avant de créer les enfants; `dev-server` ne vérifie ensuite que le backend et `dev-app` seulement l'UI. La preuve déterministe est dans `blocs/B04.md`; aucun serveur n'a été lancé pour la produire.

Second correctif de revue inclus : `dev` possède directement les PID Bun/Vite (sous-shells `exec`), détecte la fin de l'un, arrête uniquement le survivant qu'il a créé et reap les deux. Les cibles indépendantes `dev-app`/`dev-server` sont conservées. La preuve de parsing/expansion sans processus est dans `blocs/B05.md`.

## Préservation et revue parent

Les modifications héritées sont intactes. `PLAN-GENERAL.md`, `sprint.md`, les documents globaux sprint/release et le registre runtime restent intacts. Le parent doit revoir le diff limité à DA40-006, décider de l'acceptation, puis effectuer séparément le commit local exact et la clôture métier.
