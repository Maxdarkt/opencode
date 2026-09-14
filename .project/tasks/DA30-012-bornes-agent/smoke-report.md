# Smoke — DA30-012 — Bornes agent

Pas de chrome. Smoke technique = checks B3.

- `packages/core` : 121 tests (bounds, runner, coordinator, context-pack) PASS
- Quatre raisons : `steps`, `budget`, `timeout`, `interrupt` (tests runner C4)
- Interrupt idle : aucun `DrainEnded` (runner + coordinator)
- Plafond tours fini : `resolveStepLimit(undefined, undefined) === 50` ; config `steps: 2` → 2e tour `toolChoice: none` (pas de 51e `llm.stream` sans `agent.steps`)
- Typecheck schema + core PASS

Verdict : vert. Enchaîner Verify.
