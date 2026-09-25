# Verify — DA30-014

Checks :

- `packages/schema` typecheck PASS
- `packages/core` typecheck PASS
- `packages/core` tests coût, runner, TaskMetrics PASS
- `packages/app` typecheck PASS
- `packages/app` tests alertes, inspecteur, cockpit, messages PASS
- `bun run generate` dans `packages/client` PASS
- `git diff --check` PASS
- smoke cockpit PASS (`unknown`, pas un faux zéro)

Commit local ensuite. Pas de push, pas de merge.
