# Plan — DA30-014 — Coûts et budgets honnêtes

## Mandat et frontière

Analyze accepté (`analyze.md`). Worktree
`/Users/leanbot/Documents/40_Daidalon/features/tasks/DA30-014-couts-budgets`,
branche `task/DA30-014-couts-budgets`, HEAD `8db56f535`. Pas de staging,
pas de commit/push/merge avant Verify.

E1 : coût de step et agrégat tâche/sprint sans faux zéro. E2 : alertes
budget, contexte, retries, course à vide, avec provenance. Hors
périmètre : DA30-015, DA40-020, ledger, bornes d’arrêt DA30-012,
détecteur d’appels identiques, migration `SessionTable.cost`,
`TaskExecution.resume`.

## Décisions filaires

1. **Step** — `session.next.step.ended` reste en durable version 2.
   `cost` devient optionnel. Champ optionnel `costState` :
   `estimated | measured`. Sans tarif : omettre `cost` et `costState`.
   Ne plus publier `0`.
2. **Tarif** — USD par 1 000 000 tokens, unités déjà portées par
   `ConfigV2.Model.cost`.
   `input * input + (output + reasoning) * output + cache * taux`
   seulement si le taux de cache est présent. Tokens cache > 0 et taux
   absent → pas d’estimé. Résultat 0 → omettre. Plusieurs paliers
   ambigus → omettre. Pas de montant fournisseur dans
   `stepSettlement` : ce plan ne publie pas `measured`. Le schéma
   l’accepte pour un assistant déjà prouvé.
3. **Message** — `message-updater` copie `cost` / `costState` seulement
   s’ils sont présents. `Session.Message.Assistant` gagne `costState`
   optionnel. `SessionTable.cost` inchangé.
4. **Generate** — l’événement est dans `EventManifest.ServerDefinitions`.
   B1 lance `bun run generate` depuis `packages/client`. Ne pas éditer
   `src/generated` ni `packages/sdk/js/src/v2/gen` à la main.
5. **TaskMetrics** — `costState: estimated` + nombre → `estimated`.
   `costState: measured` + nombre fini → `measured`. `cost` absent,
   `cost: 0` sans `costState`, ou tarif non appliqué → `unknown` sans
   `value`. Sprint : `combineNumeric` inchangé.
6. **Alertes** — fonction pure, pas de nouvel endpoint.
   Plafond sprint = `config.bounds.sprint_tokens` optionnel. Absent ou
   agrégat `unknown` → alerte `unknown`, pas de restant. Présent et
   tokens mesurés : comparer `input+output+reasoning` (cache.read
   exclu) au plafond. Contexte : tokens du pack vs fenêtre, `unknown`
   si l’un manque. Retries : `unknown` tant qu’un compte de
   `session.next.retried` n’est pas fourni ; un compte lu peut être 0.
   Course à vide : raison `steps | budget | timeout` si elle est
   fournie. `interrupt` et l’idle naturel ne sont pas une course à vide.
7. **Écran** — `formatCost` continue de rendre `unknown` pour 0.
   Cockpit : état + provenance, jamais `0` ni `$0.00`. Les `?? 0`
   visibles de `session-message.ts` passent par cet affichage.

## Blocs Build

### B1 — Coût de step sans faux zéro

Fichiers : `packages/schema/src/session-event.ts`,
`packages/schema/src/session-message.ts`,
`packages/core/src/session/runner/cost.ts` (nouveau, calcul pur),
`packages/core/src/session/runner/llm.ts`,
`packages/core/src/session/message-updater.ts`,
`packages/core/test/session-runner-cost.test.ts` (nouveau),
`packages/core/test/session-runner.test.ts` (le cas `cost === 0`
devient « coût absent »).

Check : `bun typecheck` dans `packages/schema` puis `packages/core`.
`bun test test/session-runner-cost.test.ts test/session-runner.test.ts`
depuis `packages/core`. Puis `bun run generate` depuis `packages/client`.
`git diff --check` ciblé.

### B2 — TaskMetrics lit l’état

Fichiers : `packages/core/src/task-metrics.ts`,
`packages/core/test/task-metrics.test.ts`.

Garder le test « `cost: 0` sans tarif ≠ measured ». Ajouter :
`costState: estimated` → `estimated` avec valeur ; sprint de deux
`unknown` → `unknown` sans `value` ; un estimé + un `unknown` →
`partial`.

Check : depuis `packages/core`,
`bun test test/task-metrics.test.ts` puis `bun typecheck`.

### B3 — Alertes et affichage

Fichiers : `packages/core/src/config/bounds.ts` (`sprint_tokens`
optionnel), `packages/app/src/components/session/budget-alert.ts`
(nouveau), `packages/app/src/components/session/budget-alert.test.ts`
(nouveau), `packages/app/src/components/session/pack-inspector.ts`,
`packages/app/src/components/session/pack-inspector.test.ts`,
`packages/app/src/components/session/session-pack-inspector.tsx`,
`packages/app/src/pages/sprint-cockpit-mapper.ts`,
`packages/app/src/utils/session-message.ts`.

L’inspecteur (onglet coût) et le cockpit affichent l’alerte. Sans
plafond ou sans mesure : texte `unknown`.

Check : depuis `packages/app`,
`bun test src/components/session/budget-alert.test.ts src/components/session/pack-inspector.test.ts src/pages/sprint-cockpit.test.ts`
puis `bun typecheck`. Depuis `packages/core`, `bun typecheck`.

## Pathset

- `packages/schema/src/session-event.ts`
- `packages/schema/src/session-message.ts`
- `packages/core/src/session/runner/cost.ts`
- `packages/core/src/session/runner/llm.ts`
- `packages/core/src/session/message-updater.ts`
- `packages/core/src/task-metrics.ts`
- `packages/core/src/config/bounds.ts`
- `packages/core/test/session-runner-cost.test.ts`
- `packages/core/test/session-runner.test.ts`
- `packages/core/test/task-metrics.test.ts`
- `packages/app/src/components/session/budget-alert.ts`
- `packages/app/src/components/session/budget-alert.test.ts`
- `packages/app/src/components/session/pack-inspector.ts`
- `packages/app/src/components/session/pack-inspector.test.ts`
- `packages/app/src/components/session/session-pack-inspector.tsx`
- `packages/app/src/pages/sprint-cockpit-mapper.ts`
- `packages/app/src/utils/session-message.ts`
- fichiers générés par `bun run generate` uniquement

Hors pathset : `packages/opencode`, migration SQL, `EventManifest` hors
effet du schéma, DA30-012 `bounds.ts` runner, DA30-013, staging.

## Smoke

Après B3. Pas de migration, pas de function Edge. Profil `web`.
Port `UI_PORT` du `.make.env` de ce worktree. Chemin `/sprint/cockpit`.
Listener `0.0.0.0` sans modifier le `.make.env` lié. Le coût affiché
n’est ni `0` ni `$0.00`.

## Autorité

B1–B3 autorisés après « Lance le build ». Enchaîner les trois blocs,
puis Smoke, puis Verify. Pas de commit avant Verify vert.
