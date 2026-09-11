# B1 — Contrat et projection lecture seule

## Fichiers

- `packages/schema/src/task-ownership.ts` (créé)
- `packages/schema/src/index.ts` (export `TaskOwnership`)
- `packages/core/src/task-ownership.ts` (créé)

## Décisions

- `Fact` est une union `available` (valeur + provenance/fraîcheur) vs indisponible (état + provenance/fraîcheur), sans `toTaggedUnion` générique : le discriminant multi-états cassait le typage Schema.
- `read` compose seulement `TaskBinding.resume`, `TaskAuthority.observeQueue` et `TaskExecution.get`. Aucun appel `acquire` / `begin` / `confirm` / `resume`.
- Une attention omise devient `unknown` ; une `sourceTaskID` étrangère invalide **cette** entrée et bloque le snapshot (`context_divergent`) sans copier les faits vers l’autre ligne.
- Un owner absent reste `absent` (observation), pas une acquisition.

## Checks

| Check | Résultat |
| `tsgo --noEmit` `packages/schema` | PASS |
| `tsgo --noEmit` `packages/core` | PASS |
| `oxlint` des 3 fichiers | PASS 0 warning |
| `git diff --cached --check` des 3 fichiers | PASS |

`bun typecheck` depuis le package remonte le script turbo de la racine (turbo.json non exécutable tel quel) ; le check réel est `tsgo --noEmit` via le binaire workspace. `bun install` local a été requis (pas de `node_modules`) ; `bun.lock` restauré, aucune dépendance produit ajoutée.

## Écarts

Aucun élargissement de pathset. B2 non commencé dans ce bloc.

## Suite

B2 : `packages/core/test/task-ownership.test.ts` et smoke technique sur fixtures A/B.
