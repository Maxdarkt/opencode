# Plan — DA30-012 — Bornes agent

## Mandat et frontière

Analyze accepté (`analyze.md`). Worktree
`/Users/leanbot/Documents/40_Daidalon/features/tasks/DA30-012`, branche
`agent-bounds`, HEAD `ee629dd7f`. Pas de staging, pas
`features/30-agent-runtime`, pas de commit/push/merge avant Verify.

Livrer C4 : drain Session V2 borné (tours, tokens, temps), Interrupt réel,
signal d’arrêt lisible pour DA10-008. Hors périmètre : UI bandeau, pack
DA30-013, $ honnêtes DA30-014, watchdog `llm.stream`, runtime V1
`packages/opencode`, HTTP/SDK/`bun run generate`,
`TaskExecution.resume`.

## Décisions filaires

1. **Tours** — plafond toujours fini.
   `DEFAULT_STEPS = config.bounds.steps ?? 50`.
   `limite = agent.steps !== undefined ? min(agent.steps, DEFAULT_STEPS) : DEFAULT_STEPS`.
   Même chemin `MAX_STEPS_PROMPT` / `toolChoice: "none"` / outils vides.
   Steer ou queue promu reset le compteur (comportement actuel).
2. **Budget** — après chaque `Step.Ended` avec usage provider : accumuler
   `input + output + reasoning` du **drain** (`cache.read` exclu). Usage
   absent → axe budget `unknown`, pas de `0`, pas d’arrêt. Plafond =
   `config.bounds.tokens ?? model.limit.context` ; si les deux absents,
   skip budget. Jamais de gate sur `cost: 0`. Ne pas modifier le `cost: 0`
   publié. Dépassement → plus de `needsContinuation`, **pas** de nouvel
   `llm.stream` (pas de `MAX_STEPS_PROMPT` sur cet axe).
3. **Temps** — deadline **drain** (horloge murale),
   `DEFAULT_DURATION_MS = config.bounds.duration_ms ?? 1_800_000` (30 min).
   Idle : pas de timer. À échéance : même chemin qu’Interrupt (outils
   unsettled, assistant interrupted) + raison `timeout`. Pas de timeout
   universel sur `llm.stream`.
4. **Interrupt** — sémantique inchangée (idle/unknown = no-op ; actif =
   `Fiber.interrupt`, inbox persistée). Tests coordinator déjà présents :
   les garder verts ; ajouter la raison d’arrêt.
5. **Signal** — Schema live-only `session.next.drain.ended`
   `{ sessionID, timestamp, reason: interrupt | steps | budget | timeout }`.
   **Pas** dans `EventManifest.ServerDefinitions` ni
   `SessionEvent.Definitions` → pas de `bun run generate`. Core publie via
   `EventV2`. `sessions.active()` reste running vs idle. Arrêt naturel
   (plus de continuation) : pas d’événement (idle suffit).
6. **Portée drain** — budget et temps du drain **restent** si un steer /
   queue reset les tours. Un drain = un `SessionRunner.run`.

## Blocs Build

### B1 — Contrat Schema + defaults config

Fichiers : `packages/schema/src/session-bounds.ts` (nouveau),
`packages/schema/src/index.ts`,
`packages/core/src/config/bounds.ts` (nouveau),
`packages/core/src/config.ts`.

Schema : `StopReason`, `DrainEnded` (live, sans `durable`).
Core config : `ConfigBounds.Info` optionnel
`{ steps?, tokens?, duration_ms? }` branché sur `Config.Info.bounds`.
Constantes exportées : `DEFAULT_STEPS = 50`,
`DEFAULT_DURATION_MS = 1_800_000`.

Aucun EventManifest, aucun test runner. Check :
`bun typecheck` depuis `packages/schema` puis `packages/core`.
`git diff --check` ciblé.

### B2 — Plafond tours toujours fini

Fichiers : `packages/core/src/session/runner/llm.ts`,
`packages/core/src/session/runner/bounds.ts` (nouveau, helpers purs :
limite tours, tokens brûlés),
`packages/core/test/session-runner.test.ts`,
`packages/core/test/session-runner-bounds.test.ts` (nouveau, helpers).

Remplacer `agent.info?.steps !== undefined && currentStep >= …` par la
limite B1. Cocher le TODO runner « Honor optional agent step limits »
vers un plafond toujours fini.

Cas tests : `agent.steps` absent + `bounds.steps = 2` → 2e tour
`toolChoice: none` ; `agent.steps = 1` gagne sur DEFAULT ; helpers
`resolveStepLimit(undefined, undefined) === 50` et
`min(agent, default)` ; tests existants « final step » et reset steer
restent verts.

Check : depuis `packages/core` :
`bun test test/session-runner-bounds.test.ts test/session-runner.test.ts`
puis `bun typecheck`.

### B3 — Budget tokens + deadline drain + signal

Fichiers : les mêmes B2 +
`packages/core/src/session/runner/llm.ts` (accumulateur drain, timeout,
publish `DrainEnded`),
`packages/core/test/session-run-coordinator.test.ts` (idle no-op déjà
là : garder),
`packages/core/test/session-runner.test.ts` (cas C4).

Avant chaque `runTurn` : si budget déjà dépassé → ne plus streamer.
Après `Step.Ended` : ajouter les tokens mesurés. `cost: 0` inchangé.
Autour du drain : `Effect.timeout` / race horloge (`TestClock` dans les
tests) ; à échéance interrupt interne + `reason: timeout`. Sur
`Cause.hasInterrupts` externe → `reason: interrupt`. Stop tours →
`steps`. Stop tokens → `budget`. Steer reset steps seulement.

Cas tests : usage absent → pas d’arrêt budget ; somme
input+output+reasoning (sans cache.read) ≥ plafond → un stream de moins ;
`Step.Ended.cost === 0` ; duration courte + `TestClock.adjust` coupe un
outil en vol (`Tool execution interrupted`) ; interrupt idle no-op ;
interrupt actif → `DrainEnded.reason = interrupt` ; prune /
`promptCacheKey` inchangés (assertion existante conservée).

Check : depuis `packages/core` :
`bun test test/session-runner-bounds.test.ts test/session-runner.test.ts test/session-run-coordinator.test.ts test/context-pack.test.ts`
puis `bun typecheck`. `git diff --check` ciblé.

## Pathset

- `packages/schema/src/session-bounds.ts` (nouveau)
- `packages/schema/src/index.ts`
- `packages/core/src/config/bounds.ts` (nouveau)
- `packages/core/src/config.ts`
- `packages/core/src/session/runner/bounds.ts` (nouveau)
- `packages/core/src/session/runner/llm.ts`
- `packages/core/test/session-runner-bounds.test.ts` (nouveau)
- `packages/core/test/session-runner.test.ts`
- `packages/core/test/session-run-coordinator.test.ts`

Hors pathset : `packages/opencode` V1, HTTP/SDK/`src/generated`,
EventManifest, UI, `TaskExecution`, staging, DA30-013 prune/cache.

## Smoke (après B3, pas maintenant)

Pas de chrome. Smoke technique = checks B3 + les quatre raisons
publiées + idle interrupt no-op + pas de 51e `llm.stream` sans
`agent.steps`. Aucun provider réel.

## Risques

- Somme des `input` par step vs fenêtre modèle : un drain long s’arrête
  tôt ; c’est le contrat C4 ; `bounds.tokens` relève le plafond.
- `Effect.timeout` vs interrupt utilisateur : un flag drain-local pour
  ne pas publier `interrupt` sur un timeout.
- Tests runner figent encore `agent.steps` optionnel : B2 doit les
  garder (steps=2 reste plus petit que 50).

## Autorité

B1–B3 autorisés par ce Plan après « Lance le build ». Enchaîner les
trois blocs puis Smoke puis Verify. Pas de commit/push/merge avant
Verify vert.
