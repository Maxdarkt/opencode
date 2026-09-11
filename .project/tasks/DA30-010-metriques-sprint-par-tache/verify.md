# Verify — DA30-010

## Résultat

Revue enfant close : B1–B4 et Smoke passent. Contrat lecture `TaskMetrics` : jamais un faux zéro ; file `QueueBlocked` 409 ; pas d’attention sprint. Commit local `91485d37b`. Pas de push/merge.

## Contrôles relus

- B1 schéma : freshness/attention/sources + `queue?` ; typecheck schema PASS.
- B2 Core : `TaskQueue.evaluate` → `QueueBlocked` ; coût `unknown` ; fraîcheur tâche `unknown` / sprint `observedAt`.
- B3 : 10 tests Core (metrics + queue) PASS ; fix `Freshness` littéral `unknown`.
- B4 : HttpApi 9 tests PASS ; generate client ; SDK `types.gen.ts`.
- Smoke : SQLite éphémère A/B, B absente, doublon, file 409, coût sans `value` — `smoke-report.md`.
- Relance Verify : typecheck schema/core/opencode/client/sdk/js PASS ; `git diff --check` pathset PASS.

## Pathset et Git

- `packages/schema/src/task-metrics.ts`
- `packages/core/src/task-metrics.ts`
- `packages/core/test/task-metrics.test.ts`
- `packages/opencode/src/server/routes/instance/httpapi/groups/global.ts`
- `packages/opencode/src/server/routes/instance/httpapi/handlers/global.ts`
- `packages/opencode/test/server/httpapi-global.test.ts`
- `packages/sdk/js/src/v2/gen/types.gen.ts` (B4)

Hors pathset : artefacts APEX `.project/tasks/DA30-010-metriques-sprint-par-tache/`.

Branche `task/DA30-010-metriques-sprint` ; HEAD `91485d37b` ; working tree clean après commit. Pas push/merge/staging.

## Limites, dette et suite

Dette PLAN-GENERAL/sprint.md `todo` : parent DA40-016. Pas d’UI. Sprint : passer MT `done` sur cette remise.
