# DA20-004 — Ownership et reprise lors du passage entre tâches

## Objectif

Garantir qu'un cockpit Sprint lit et reprend deux tâches successives sans attribuer à B le chat,
le worktree, les preuves, les effets ou l'attention de A.

## Contexte

DA30-009 fournit la file et l'autorité séquentielle. La maquette DA10-006 validée exige une pile
de tâches, un `Task status` vérifiable et une topologie de worktrees; DA20-004 est la frontière qui
attache ces faits à la bonne tâche avant que DA20-005 les rende visibles.

## Dans le périmètre

- Binding explicite et fail-closed tâche → owner → session → worktree → branche/HEAD, avec
  provenance et fraîcheur.
- Reprise A → B : A reste consultable; B ne reçoit aucune référence de A sans liaison prouvée.
- Signaux d'attention attachés à la tâche source, sans consommation croisée.
- Snapshots de lecture utilisables par DA20-005 et DA10-005, sans commande Git ni action d'agent.
- Tests A/B, refus d'identité divergent, snapshot périmé et reprise croisée.

## Hors périmètre

Topologie Git détaillée/diff (DA20-005), métriques agrégées (DA30-010), UI cockpit (DA10-005),
actions mutatives Git/agent, deux écrivains, déplacement ou suppression de worktree.

## Critères d'acceptation

1. Chaque fait de tâche inclut son identité/provenance et une valeur inconnue est explicite.
2. Après activation de B, A conserve ses faits et toute reprise croisée est refusée sans mutation.
3. Le snapshot ne peut pas confondre deux worktrees, deux sessions ou deux alertes.
4. Tests ciblés et smoke local de reprise A/B sont verts.
5. DA20-005 peut exiger cette liaison sans inférer un worktree.

## Dépendances et livraison

Base de code : commit DA30-009 `3fa91aba1`. DA20-005 dépend de cette tâche; DA10-005 et
DA40-015 consomment ses preuves. Le travail est limité au worktree dédié
`features/tasks/DA20-004-cockpit-ownership`, branche `cockpit-ownership`.
