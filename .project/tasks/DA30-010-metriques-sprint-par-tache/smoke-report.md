# Smoke — DA30-010

## Résultat

PASS. SQLite éphémère via `Database.node` (tests Core/HttpApi). Pas de provider. Pas d’UI (hors plan).

## Commandes

```bash
cd packages/core && bun test test/task-metrics.test.ts test/task-queue.test.ts
# 10 pass, 0 fail, 43 expect

cd packages/opencode && bun test test/server/httpapi-global.test.ts
# 9 pass, 0 fail, 17 expect

git diff --check -- <pathset B1–B4 + types.gen.ts>
# PASS
```

## Scénarios (JSON observé par les tests)

**A+B mesurées distinctes** — `POST /global/metrics` 200 :

```json
{
  "type": "sprint",
  "metrics": {
    "taskIDs": ["DA30-010-A", "DA30-010-B"],
    "tasks": [{ "taskID": "DA30-010-A" }, { "taskID": "DA30-010-B" }],
    "tokens": { "state": "measured", "value": { "input": 14, "output": 3 } },
    "cost": { "state": "unknown" }
  }
}
```

Pas de `cost.value`, pas de `metrics.attention`. Core : tokens A `{10,1}` ≠ B `{4,2}` ; fraîcheur sprint `available` ; fraîcheur/attention tâche `unknown`.

**A mesurée + B absente** — Core `taskIDs` `["DA30-010-A","missing-b"]`, B visible, tokens non `measured`, `cost.state: "unknown"`. HTTP équivalent DA30-008 + `missing` : `tokens`/`latency` `partial`, doublon `DA30-008`.

**File bloquée** — 409, aucun total :

```json
{ "_tag": "TaskMetrics.QueueBlocked", "reason": "duplicate_task_id" }
```

**Coût** — runner `cost: 0` → `{ "state": "unknown" }` sans `value` (tâche et sprint).

## Hors smoke

Pas de navigateur (plan : preuves JSON + tests). PLAN-GENERAL/sprint.md `todo` : DA40-016.
