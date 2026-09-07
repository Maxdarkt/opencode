# Smoke technique — DA10-003

- HTTP : `bun test ./test/server/httpapi-control-plane.test.ts ./test/server/httpapi-global.test.ts ./test/server/httpapi-local-context.test.ts` — 7 PASS.
- UI : `bun test --conditions=solid --preload ./happydom.ts ./src/components/active-task-context-state.test.ts` — 2 PASS / 8 assertions.
- Les états incomplet, divergent et reprise refusent l’écriture; seul le contexte concordant l’autorise.

## Smoke visuel parent

Candidate locale avec binding/session/worktree/HEAD concordants et owner génération 1; viewport 1440×900 puis 1024×768. Ouvrir le contexte actif, vérifier projet/tâche/session/worktree/branche/HEAD/owner/génération/effets; vérifier sprint explicitement indisponible. Rejouer fixture HEAD divergent puis effet pending : alerte et écriture désactivée, sans réparation proposée.
