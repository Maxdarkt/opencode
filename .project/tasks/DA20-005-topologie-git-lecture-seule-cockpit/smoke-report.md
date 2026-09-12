# Smoke — DA20-005

Pass technique uniquement : dépôts **tmp** à 2 worktrees (fixture `gitRemote` + `task-a`/`task-b`). Pas le dépôt source, pas de serveur, pas de navigateur, pas de MT réel.

| Étape | Résultat |
| Lister A et B isolés, lier ownership vérifié | `DA20-005-A` / `DA20-005-B` ; `workingTreeDiff` ≠ `integrationDiff` |
| Identité absente | worktrees listés, `task.absent`, pas de `mtTaskID` |
| `mergeTarget` vide | ahead/behind/intégration `invalid` ; pas de `rev-list` |
| `mergeTarget` mort | faits `absent`/`unknown` ; pas de substitution `staging`/`dev` |
| Dirty + prunable | `cleanliness.modified` ; `prunable=true` ; aucun prune |
| Checkout ≠ mesure / double identité | `divergent` / `invalid` |
| Spy argv | zéro commande mutative |

Preuve : `packages/core/test/repository-topology.test.ts` + régression ownership, **14/14 PASS**.

Pass B visuel cockpit : hors mandat (DA10-005).
