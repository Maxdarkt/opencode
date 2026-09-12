# Plan — DA30-010 — Métriques Sprint par tâche et provenance

## Mandat et frontière

Analyze accepté (`analyze.md`). Worktree de carte
`/Users/leanbot/Documents/40_Daidalon/features/tasks/DA30-010-metriques-sprint`,
HEAD `7df15b2cd`. Pas de staging, pas `features/30-agent-runtime`, pas de
commit/push/merge.

Étendre `TaskMetrics` existant (Sprint 3 + file DA30-009 au HEAD). Lecture seule.
Jamais un faux zéro. Hors budget/factu, UI, Git, DA30-011, Catalog/prix.

## Décisions filaires (questions Analyze)

1. **Champs additifs** — conserver `provenance: string[]`. Ajouter, en réutilisant
   `TaskOwnership` (import Schema, pas de nouveau domaine) :
   - `freshness` (`TaskOwnership.Freshness` ou indisponible/`unknown`)
   - `attention` (fait `AttentionFact` **ou** `unknown` / unavailable — jamais `0`)
   - `sources: TaskOwnership.Provenance[]` (faits structurés)
2. **Sprint** — `taskIDs` = ordre d’entrée dédupliqué (A puis B). `tasks[]` aligné.
   Pas d’attention agrégée sprint (pas de somme, pas de copie A→B).
3. **File** — `Request.Sprint.queue?` optionnel (même forme que `TaskQueue.Request`).
   Si présent : `TaskQueue.evaluate` d’abord ; file inéligible → erreur taguée
   `QueueBlocked`, **aucun** total inventé. Si absent : agréger les IDs dans l’ordre
   appelant (comportement actuel + ordre conservé).
4. **Totaux** — `combine*` existant. Sprint `measured` seulement si **toutes** les
   lignes A/B le sont. Une ligne `unknown` → total `partial` ou `unknown`, jamais
   `value: 0` de substitution. Tokens **mesurés** à 0 restent légitimes. Coût
   inchangé `unknown`.
5. **Fraîcheur sprint** — `observedAt` de cet appel Core. Fraîcheur **par tâche** :
   fait ownership s’il existe, sinon `unknown` (ne pas dater une absence).
6. **Appartenance MT** — toujours fournie par l’appelant (`sprintID` + IDs).

SDK : `bun run generate` (client) + SDK JS **après** changement Schema/HttpApi
(public), jamais d’édition manuelle de `src/generated`.

## Blocs Build

### B1 — Schéma public `TaskMetrics`

Fichiers : `packages/schema/src/task-metrics.ts`, export Schema si besoin.

Ajouter les champs additifs ci-dessus sur `Task` / `Sprint` / `Request.Sprint`.
Réutiliser les schémas `TaskOwnership` (Provenance, Freshness, Attention).
Ne pas toucher Core, HTTP, ni générer le SDK dans ce bloc.

Check : `bun typecheck` depuis `packages/schema`. `git diff --check` ciblé.

### B2 — Core lecture, file, honnêteté

Fichiers : `packages/core/src/task-metrics.ts`. Composer `TaskQueue` /
`TaskOwnership` en lecture (contrats inchangés).

Par tâche : métriques actuelles + freshness/attention/sources ; attention
absente → `unknown`. Sprint : ordre `taskIDs`, dédup `duplicateTaskIDs`,
inconnus visibles, totaux sans promotion d’inconnu, `QueueBlocked` si file
fournie et inéligible. Coût runner `0` → toujours `unknown`.

Check : `bun typecheck` depuis `packages/core`.

### B3 — Tests Core A/B + régressions

Fichier : `packages/core/test/task-metrics.test.ts`.

Fixture **deux** tâches distinctes (sessions/tokens/attention séparés). Cas :
doublon d’ID ; binding manquant ; file bloquée ; totaux sprint non `measured`
si une membre `unknown` ; coût `0` → `unknown` ; tests DA30-007 encore verts.

Check : depuis `packages/core` :
`bun test test/task-metrics.test.ts test/task-queue.test.ts`
(+ ownership si composition cassée). Typecheck core.

### B4 — HTTP + SDK

Fichiers : `packages/opencode/src/server/routes/instance/httpapi/groups/global.ts`,
`handlers/global.ts`, `packages/opencode/test/server/httpapi-global.test.ts`,
sorties générées via commandes prescrites.

Même `POST /global/metrics`, contrat étendu. Fixture HTTP A/B + file bloquée
sans totaux. Puis `bun run generate` dans `packages/client` et build SDK JS
si le contrat public change. Typecheck opencode (+ client/sdk). `git diff --check`.

## Pathset

- `packages/schema/src/task-metrics.ts` (+ index Schema si export)
- `packages/core/src/task-metrics.ts`
- `packages/core/test/task-metrics.test.ts`
- `packages/opencode/src/server/routes/instance/httpapi/{groups,handlers}/global.ts`
- `packages/opencode/test/server/httpapi-global.test.ts`
- SDK générés seulement en B4

Hors pathset : UI, migrations, Catalog, Git, staging, contrats TaskQueue/Ownership
(sauf import).

## Smoke (après B4, pas maintenant)

SQLite éphémère : A mesurée + B mesurée distincte ; A mesurée + B absente
(`partial`/`unknown`, B visible) ; doublon ; file bloquée (erreur, pas `0`) ;
coût jamais `0`. Preuve = JSON + commandes test. Pas de provider.

## Risques

- Oubli generate → SDK stale (gate B4).
- Collision DA20-005 faible (autres fichiers).
- Dettes PLAN-GENERAL/sprint.md `todo` : parent DA40-016.

## Autorité

B1 autorisé par ce Plan + mandat utilisateur « après Plan : /summarize, puis B1 ».
Pas de B2 avant fin B1 + palier. Pas de commit/push/merge.
