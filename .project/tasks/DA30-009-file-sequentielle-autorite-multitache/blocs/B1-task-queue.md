# B1 — TaskQueue pur — checkpoint validé

## Résultat

Implémentation bornée du contrat de file séquentielle dans quatre fichiers fonctionnels :

- `packages/schema/src/task-queue.ts` : entrées avec contexte, sélection, completion et raisons de refus typées;
- `packages/schema/src/index.ts` : export public `TaskQueue`;
- `packages/core/src/task-queue.ts` : évaluateur pur réutilisant `TaskPilot.evaluate`, sans FS, SQLite, HTTP ou état mutable;
- `packages/core/test/task-queue.test.ts` : séquences A/B, clôture `review|done + verify`, idempotence et refus fail-closed.

Le résultat conserve seulement l'ID et l'action de l'entrée sélectionnée. Aucune identité riche, session, worktree, owner, effet ou métrique n'est transférée.

## Checks

| Check | Résultat | Preuve / limite |
|---|---|---|
| `bun build packages/core/src/task-queue.ts packages/schema/src/task-queue.ts packages/core/test/task-queue.test.ts --outdir /tmp/da30-009-b1-build-20260910 --external '*'` | PASS | Parse/transpilation des trois entrées; check complémentaire, pas le test requis. |
| `bun install --frozen-lockfile --ignore-scripts` depuis la racine | PASS | Restauration strictement verrouillée, 4687 paquets installés; hash `bun.lock` conservé `dfd3eb5187a4211c3c4eb5b24f6a8980a86e74c47b3369346daa1ee0ed30c385`; aucun script post-install exécuté. |
| `bun test test/task-queue.test.ts test/task-pilot.test.ts` depuis `packages/core` | PASS | 9 tests, 0 échec, 28 assertions. |
| `bun typecheck` depuis `packages/schema` | PASS | `tsgo --noEmit`, code 0. |
| `bun typecheck` depuis `packages/core` | PASS | `tsgo --noEmit`, code 0. |
| `git diff --check` | PASS | Aucun whitespace error sur les fichiers suivis; les artefacts non suivis ont aussi passé le contrôle `git diff --no-index --check` sans sortie. |

## Limites et décision

Les checks B1 sont maintenant verts après restauration locale du runtime. Aucun lockfile, code hors pathset, service partagé ou état externe n'a été modifié. B2 reste hors de ce checkpoint et requiert l'ouverture explicite du parent.

## Git et prochaine action

Branche `task/DA30-009-file-sequentielle-autorite-multitache`, HEAD inchangé `57da5e0d156c1b6f73c2c4528b502d6b764d9891`. Modifications fonctionnelles non commitées, limitées au pathset B1; preuves APEX non suivies. Prochaine action exacte : parent relit ce checkpoint et ouvre B2 si la dépendance est acceptée. Aucun commit, push, MT ou B2.
