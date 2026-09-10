# B1 — Contrat et persistance

## Résultat

- `packages/schema/src/task-binding.ts` définit le contrat version 1 : carte MT, external_ref APEX,
  session, projet, location, dépôt, branche, worktree et HEAD, plus les champs de divergence.
- `packages/core/src/task-binding/sql.ts` ajoute `task_binding` avec clés uniques MT/APEX/session,
  références projet/session, faits checkout explicites et timestamps.
- `packages/core/src/task-binding.ts` expose `get`, `adopt` idempotent et `resume` sans écriture, avec
  erreurs typées pour absence de binding/session et divergence exploitable.
- Migration générée : `packages/core/src/database/migration/20260907110405_task_binding.ts`; snapshot,
  registre et schéma complet synchronisés par le générateur canonique.

## Décisions

- Le binding persiste un checkpoint HEAD attendu et refuse toute adoption implicite d'un autre HEAD.
- L'observation Git réelle reste fournie en amont par `LocalContext`; le binding ne lance aucune
  commande Git et ne prend aucun lease.
- Toute collision connue est relue et comparée avant insertion ; le rejeu exact retourne la ligne
  existante sans toucher ses timestamps.

## Checks

- `bun typecheck` dans `packages/schema` : PASS.
- `bun typecheck` dans `packages/core` : PASS.
- `bun run script/migration.ts --check` dans `packages/core` : PASS, aucune migration manquante et
  schéma complet courant.
- Précondition : le premier typecheck a signalé `tsgo: command not found`; résolu avec
  `bun install --frozen-lockfile` dans le worktree, sans modification de `bun.lock`.

## Déviation / reste

Aucune déviation fonctionnelle. B2 doit prouver persistance, idempotence et refus sans mutation.
