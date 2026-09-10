# Verify — DA20-003

## Acceptation

1. Le contrat versionné relie sans ambiguïté MT task ID, external_ref APEX, session, projet,
   `Location.Ref`, dépôt Git, branche, worktree et HEAD : PASS.
2. `adopt` puis `resume` exacts retrouvent une ligne unique sans doublon ni mutation : PASS.
3. Session absente, binding absent et toute divergence d'identité sont refusés avant insertion avec
   erreurs typées et champs exploitables : PASS.
4. Migration générée, migration check, typechecks Schema/Core et tests ciblés/régression : PASS.
5. Contrat consommable et plan de smoke parent documentés dans `smoke-report.md` : PASS.

## Vérifications fraîches

- Core ciblé + LocalContext + migrations : 30 PASS / 123 assertions.
- Schema typecheck : PASS.
- Core typecheck : PASS.
- Générateur migration `--check` : PASS.
- Prettier ciblé : PASS.
- Oxlint ciblé : 0 warning / 0 erreur.
- `git diff --check` : PASS.

La suite Schema globale conserve 13 PASS / 2 FAIL préexistants dans `event-manifest.test.ts`,
reproduits sur la baseline exacte `9ba850b68`. Voir `problems.md`; aucun événement n'est ajouté par
DA20-003.

## Dette et limites

- Dette locale/in-scope : aucune.
- Dette préexistante : `DEBT-SCHEMA-EVENT-MANIFEST`, à scoper seulement sur décision parent.
- Ownership/lease : DA30-004.
- Présentation UI : DA10-003.
- Endpoint/intégration finale : hors pathset DA20-003, à composer par les cartes dépendantes.

## Pathset validé pour commit

- `.project/tasks/DA20-003-binding-tache-session-worktree/**`
- `packages/schema/src/index.ts`
- `packages/schema/src/task-binding.ts`
- `packages/core/schema.json`
- `packages/core/src/database/migration.gen.ts`
- `packages/core/src/database/schema.gen.ts`
- `packages/core/src/database/migration/20260907110405_task_binding.ts`
- `packages/core/src/task-binding.ts`
- `packages/core/src/task-binding/sql.ts`
- `packages/core/test/task-binding.test.ts`

Sont explicitement exclus les projections Sprint préexistantes `PLAN-GENERAL.md`, `sprint.md`,
`docs/product/releases/0.1.md` et `docs/product/sprints/sprint-2.md`.
