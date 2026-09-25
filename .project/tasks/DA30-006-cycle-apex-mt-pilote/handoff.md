# Handoff review — DA30-006

## Résultat

Le pilote local `opencode task pilot` évalue la prochaine action d'une observation APEX/MT sans
écrire ses autorités. Il distingue les phases `analyze → plan → build → smoke → verify` des statuts
MT `todo/in_progress/review/done/blocked`, refuse les couples incohérents et les contextes
incomplets/divergents/en reprise, et rend une sortie JSON stable/idempotente. Le contrat UI v1 est
déjà disponible dans `phase-contract.md` pour DA10-004.

## Fichiers et vérifications

- Produit : `packages/schema/src/task-pilot.ts`, son export, `packages/core/src/task-pilot.ts`,
  `packages/core/test/task-pilot.test.ts`, `packages/opencode/src/cli/cmd/task.ts` et l'index CLI.
- `bun typecheck` Schema : PASS; Core : test ciblé PASS (3/15) et typecheck PASS; OpenCode :
  typecheck PASS.
- Oxlint (0 warning/error), Prettier et `git diff --check` : PASS.
- Smoke CLI : 8 parcours admis, 3 refus et aucune persistance observée; détails dans
  `smoke-report.md`.

## État et limites

- MT est **review** : update `52981d74-092a-4484-b6f7-cad8ef983fc8`, relecture
  `cf871153-9f06-466f-b52a-5a207689752e`; jamais `done` par cet enfant.
- Branche `apex-cycle`, HEAD inchangé
  `10e1234b3b08b986ef966f01d04e25bbf1185433`; aucun commit créé. Le diff non committé est limité
  aux six fichiers produit/test ci-dessus. Les preuves APEX/journaux résident séparément dans le
  worktree stable `30-agent-runtime` et sont eux aussi non commités.
- Aucune dette en périmètre. DA30-007 a signalé que les tâches Sprint ne sont pas inférables depuis
  `task_binding` et que les coûts à zéro sans provenance doivent rester `unknown`; DA30-006 ne les
  agrège ni ne les affiche comme mesurés.

## Smoke visuel parent et reprise

Exécuter le plan complet de `smoke-report.md` : candidate intégrée, fixtures phase/statut, identité
concordante, desktop `1440×900` puis `1024×768`, affichage séparé phase/statut/action/motif et
preuves capture/JSON/HEAD. En cas d'échec, remettre MT à `in_progress` après relecture et reprendre
un bloc correction dans `packages/core/src/task-pilot.ts` ou `packages/opencode/src/cli/cmd/task.ts`.
Une source live MT/APEX, agrégation Sprint ou prix vérifié requiert un scope distinct.
