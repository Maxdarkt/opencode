# Verify — DA40-020

- Tests Core `bun test test/make-dev.test.ts` : 8 pass
- Tests App `session-make-dev.test.ts` : 5 pass
- Typecheck schema, core, protocol, client, app : pass (B1–B3)
- `git diff --check` : pass
- Smoke : PASS (`smoke-report.md`) — `0% · 3 Mo` puis `—`
- `runtime_profile: none`
- Commit : `22231e7ac` `feat(make-dev): show CPU and RAM for the owned process tree`
