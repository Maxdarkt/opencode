# Smoke technique — DA30-008

## Résultat

Le lecteur de snapshot local retourne `available` avec `in_progress/build` pour une identité exacte et une expiration future; il retourne `divergent` pour un autre worktree et `expired` après expiration. La projection HTTP et l’OpenAPI restent décodables; le pilote UI conserve ses quatre tests de transitions.

## Commandes

- `bun --cwd packages/core test test/task-authority.test.ts` — PASS.
- `bun --cwd packages/opencode test test/server/httpapi-local-context.test.ts` — PASS (2 tests).
- `bun --cwd packages/opencode test test/server/httpapi-public-openapi.test.ts` — PASS (19 tests).
- `bun test --conditions=solid --only-failures --preload ./happydom.ts src/components/task-pilot-state.test.ts` depuis `packages/app` — PASS (4 tests).

## Pass B parent

Configurer un snapshot non expiré dans `OPENCODE_TASK_AUTHORITY_SNAPSHOT`, avec une tâche dont `id`, `git.worktreePath` et `git.head` correspondent au binding. Vérifier le rendu distinct MT/APEX/action à 1440×900 puis 1024×768; supprimer ou expirer uniquement la fixture de smoke pour vérifier le blocage, jamais une source de production. Le parent réalise ce jugement visuel.
