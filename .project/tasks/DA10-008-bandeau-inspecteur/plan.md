# Plan — DA10-008 — Bandeau agent et inspecteur de pack

Analyze accepté. Worktree `features/tasks/DA10-008`, branche
`pack-inspector`, HEAD `a8884d674`. Session App seulement. Pas de
staging, cockpit, chrome 0.3, `SessionContextUsage`, push/merge.

## Décisions

1. Vue `/{b64}/session/{id}`. Running = `busy`|`retry`, Idle = `idle`.
2. Outil = dernière part tool `running`, sinon `unknown`. cwd observé
   sinon `unknown`.
3. Interrupt visible seulement si Running → `session.interrupt`.
4. `GET /api/session/:sessionID/pack` (Protocol + Server) →
   `ContextPack.Pack` via Core `assemble`. 404 si session absente.
   Pathset vide OK. Tokens sans request → `unknown` sans `value`.
5. Inspecteur flottant : Contexte / Coût. Coût via TaskMetrics si
   binding, sinon `unknown`. Jamais `0` / `$0.00` faute de mesure.
6. App n’importe jamais Core. `bun run generate` après HttpApi.

## B1 — GET pack

- `packages/core/src/context-pack.ts` + test (fromSession / assemble)
- `packages/protocol/src/groups/session.ts`
- `packages/server/src/handlers/session.ts`
- `packages/opencode/test/server/httpapi-exercise/index.ts`
- `packages/opencode/test/server/session-pack.test.ts`
- `bun run generate` (client) + SDK js. Pas d’édition `src/generated`.

Tests : 404 ; worktree observé ; `unknown` sans value ; hors worktree →
omitted. Checks : typecheck schema/core/protocol + tests + generate.

## B2 — Bandeau + Interrupt

- `packages/app/src/components/session/agent-banner.ts` (+ test + tsx)
- `packages/app/src/pages/session.tsx`
- `packages/app/src/i18n/en.ts`

Tests : idle vs running ; Interrupt seulement running. Typecheck app.

## B3 — Inspecteur

- `packages/app/src/components/session/pack-inspector.ts` (+ test + tsx)
- `packages/app/src/i18n/en.ts`

Onglets Contexte / Coût. Formatter `unknown` ≠ `"0"`. Typecheck app.

## Pathset

Core context-pack + test ; protocol session ; server session handler ;
httpapi-exercise ; session-pack.test ; generated client/sdk ; app
agent-banner* ; pack-inspector* ; session.tsx ; en.ts.

Hors pathset : cockpit, fixtures, session-context-usage/metrics, chrome
0.3, staging.

## Verify / Smoke

Typecheck schema/core/protocol/app. Tests pack + bandeau + inspecteur.
`git diff --check`. Smoke session liée : Idle, inspecteur, Interrupt
absent à Idle, pas de faux `$0.00`.

Après « Lance le build » : B1→B3 puis Smoke puis Verify. Commit après
Verify vert seulement.
