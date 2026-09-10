# B1 — Contrat et ownership durable

- Statut : terminé le `2026-09-07T13:45:10+02:00`.
- Entrée : DA20-003 cherry-pickée à `eceeb7dd7734f60491e09cdac72fa297993f4c4b` avec tree
  identique à la source acceptée.

## Résultat

- Contrat browser-safe `TaskExecution` : propriétaire, effet, génération, jeton, fencing,
  snapshot, décision `execute|confirmed` et résolution `confirmed|absent|uncertain`.
- Persistance SQLite : ownership unique par `mt_task_id`, `session_id` et `worktree`; effets
  `pending|confirmed` rattachés avec suppression en cascade.
- `acquire` appelle `TaskBinding.resume` avant transaction, rejoue seulement le propriétaire exact
  et refuse les collisions sans mutation.
- Migration `20260907113953_task_execution_ownership` générée par le script canonique.

## Fichiers

- `packages/schema/src/task-execution.ts`, `packages/schema/src/index.ts`.
- `packages/core/src/task-execution.ts`, `packages/core/src/task-execution/sql.ts`.
- `packages/core/src/database/migration/20260907113953_task_execution_ownership.ts` et artefacts
  générés `schema.json`, `schema.gen.ts`, `migration.gen.ts`.
- `packages/core/test/task-execution.test.ts`.

## Checks

- `bun install --frozen-lockfile` : PASS après absence initiale de `node_modules`; `bun.lock`
  inchangé.
- Première génération : FAIL, `drizzle-kit` absent avant installation; relance après preuve : PASS.
- `bun typecheck` dans Schema : PASS.
- `bun typecheck` dans Core : PASS après correction d'un flux Drizzle non converti en défaut.
- `bun test test/task-execution.test.ts test/task-binding.test.ts` : PASS, 16 tests / 95 assertions.
- `git diff --check` ciblé : PASS.

## Déviations et suite

- Aucun élargissement. L'installation locale est ignorée par Git et le lockfile n'a pas changé.
- B2 doit compléter les combinaisons de résolution multi-effets et confirmer qu'une divergence de
  binding ou un jeton obsolète ne produit aucune mutation partielle.
