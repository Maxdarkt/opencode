# Smoke — DA30-013

## Résultat

PASS. Smoke technique, pas de chrome, pas de provider.

## Commandes

```bash
cd packages/schema && bun run typecheck
# PASS tsgo --noEmit

cd packages/core && bun test test/context-pack.test.ts \
  test/session-compaction.test.ts test/session-runner.test.ts \
  test/system-context/builtins.test.ts test/task-metrics.test.ts
# 107 pass, 0 fail, 335 expect

cd packages/core && bun run typecheck
# PASS

git diff --check -- <pathset>
# PASS
```

## Scénarios

- Pathset worktree : `src/index.ts` / `AGENTS.md` gardés ; staging, sibling, `AGENTS.md` global omis.
- Tokens absents : `{ state: "unknown", provenance: ["Token.estimate"] }` sans `value`.
- Prune : after < before (`estimated`) ; sous seuil et `skill` inchangés.
- Cache : clé 64 hex identique si cwd+règles+outils identiques ; change si l’un des trois change. `cache.read` non observé → pas de `0`.
