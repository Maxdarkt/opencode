# Verify — DA40-021

- `make config-check` : exit 0.
- `DRY_RUN=1 make dev` : `0.0.0.0`, ports `6400` et `6402`, pas de `127.0.0.1`.
- `bun typecheck` dans `packages/app` : exit 0.
- Smoke : PASS (`smoke-report.md`).
- Aucun `config.toml`.
- `.make.env` ignoré, hors commit.
- Registre Codex déjà commité : `e8f573c8c`, fichier unique, bloc DA seul.

SHA worktree : `801e783ac` (`feat(opencode): bind local servers on 6400`). Pas de push.
