# Verify — DA10-007 — Lier chaque chat à un worktree de carte

B1–B2 et Smoke passent. Un chat = un worktree `features/tasks/<id>`. Launch
crée ou reprend **une** session collée à l’arbre observé. Preuve W1 : libellé
rail + en-tête. Preuve W2 : reopen même `sessionID`. Commit local `28038c5cf`.
Pas de push/merge.

## Checks

- `bun typecheck` schema / opencode / app — PASS
- Tests HTTP open : 20 pass ; App cockpit : 8 pass
- `git diff --check` — PASS
- Smoke `/sprint/cockpit` + `open` live — `smoke-report.md`

## Remise

SHA `28038c5cf` sur `chat-worktree`. MT : passer done (sprint).
