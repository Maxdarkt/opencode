# B2 — Authority queue — checkpoint validé

## Résultat

Ajout borné de la projection d'autorité séquentielle :

- `packages/schema/src/task-authority.ts` expose `QueueInput`, `QueueInputEntry`, `QueueEntryObservation` et `QueueObservation`; l'état `blocked` est distinct d'une observation indisponible;
- `packages/core/src/task-authority.ts` ajoute `observeQueue`, valide une lecture de snapshot unique et fraîche, vérifie chaque `TaskBinding.Identity` avec `TaskBinding.resume`, exige le couple worktree/HEAD de la même entrée, normalise uniquement `todo + allocated` en absence de phase, puis délègue à `TaskQueue.evaluate`;
- `packages/core/test/task-authority.test.ts` couvre deux bindings A/B, passage A→B, rejeu, expiration, absence, doublon snapshot, divergence Git/APEX et deux tâches actives.

`observe` mono-tâche, son contrat et les endpoints HTTP existants sont conservés. La projection ne persiste rien et ne renvoie aucune identité riche dans la sélection.

## Checks et smoke

| Check | Résultat | Preuve |
|---|---|---|
| `bun test test/task-authority.test.ts test/task-binding.test.ts test/task-execution.test.ts` depuis `packages/core` | PASS | 23 tests, 0 échec, 117 assertions; inclut le smoke SQLite `:memory:` et snapshots temporaires A/B. |
| `bun typecheck` depuis `packages/schema` | PASS | `tsgo --noEmit`, code 0. |
| `bun typecheck` depuis `packages/core` | PASS | `tsgo --noEmit`, code 0. |
| `bunx oxlint` sur les six fichiers B2/B1 ciblés | PASS | 0 warning, 0 erreur, 130 règles. |
| `git diff --check` | PASS | Aucun whitespace error. |
| `bun.lock` | inchangé | SHA-256 `dfd3eb5187a4211c3c4eb5b24f6a8980a86e74c47b3369346daa1ee0ed30c385`. |

Scénario smoke : deux sessions/bindings isolées, A `in_progress/analyze` sélectionnée; le snapshot suivant ferme A en `review/verify` et sélectionne B `start_analyze`; le rejeu est déterministe; worktree/HEAD divergent, `apexExternalRef` divergent, entrée absente, snapshot expiré, doublon et deux actives bloquent sans sélection.

## Limites

- Le snapshot existant ne porte pas `sessionID` ni `apexExternalRef`; ces champs sont vérifiés par `TaskBinding.resume` à partir de l'identité fournie, jamais inférés.
- `todo + allocated` est la seule normalisation runtime admise vers l'entrée B1 sans phase. Toute autre phase/statut invalide reste fail-closed.
- Aucun endpoint, UI, ownership/reprise, métrique ou mutation MT/APEX n'est inclus. Le parent doit fournir le smoke visuel et la réception Sprint.

## Git et suite

Branche `task/DA30-009-file-sequentielle-autorite-multitache`, HEAD inchangé `57da5e0d156c1b6f73c2c4528b502d6b764d9891`. Fichiers fonctionnels non committés, pathset limité à B1+B2 et preuves APEX; aucun commit, push, rebase ou changement MT. Prochaine action : parent relit B2, réalise son smoke visuel/intégration, puis décide du passage en review.
