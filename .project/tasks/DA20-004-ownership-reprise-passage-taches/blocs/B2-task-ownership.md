# B2 — Régressions A/B et smoke technique

## Fichiers

- `packages/core/test/task-ownership.test.ts` (créé)
- `packages/core/src/task-ownership.ts` : l’état global ne passe à `blocked` pour un extra d’identité que si la file était `available` ; un snapshot `expired`/`divergent` conserve l’état de file.

## Couverture

1. A `in_progress` puis A `review`/`verify` : sélection A puis B ; owner/session/worktree de A inchangés.
2. Deux tokens distincts : chaque `execution.available` ne porte que sa propre identité.
3. Attention omise → `unknown` ; attention A fournie à B → `invalid` sans `value`, snapshot `blocked`.
4. Token B avec session/worktree de A → `divergent` sans projection ; binding divergente ; snapshot expiré ; IDs dupliqués. Aucune écriture ownership/effet/binding.
5. Rejeu identique → même snapshot, mêmes lignes SQL.

## Checks

| Check | Résultat |
| `bun test test/task-ownership.test.ts test/task-authority.test.ts test/task-binding.test.ts test/task-execution.test.ts` | PASS 28/28 |
| `tsgo --noEmit` schema + core | PASS |
| oxlint 4 fichiers | PASS |
| `git diff --cached --check` | PASS |
