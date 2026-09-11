# DA20-005 — Topologie Git en lecture seule pour le cockpit Sprint

## Objectif

Fournir au cockpit Sprint une projection vérifiable du dépôt source, de ses branches et de ses
worktrees, sans exécuter aucune action Git.

## Dans le périmètre

- Snapshot par dépôt : branches configurées, worktrees connus, branche, HEAD, cible de merge,
  état propre/modifié, commits ahead/behind et statistiques `+/-` / fichiers modifiés.
- Provenance, fraîcheur et valeur `unknown` explicites lorsque Git ou une relation de merge ne
  peut pas être prouvé.
- Liaison à l'ownership DA20-004 : aucun worktree n'est attribué à une tâche sans identité
  vérifiée.
- Tests de lecture, refus fail-closed et fixture de deux tâches/worktrees pour la recette.

## Hors périmètre

Commit, merge, rebase, checkout, fetch, push, suppression, réparation de worktree ou toute
écriture Git. La carte ne choisit pas une branche globale : les refs source sont configurables par
dépôt.

## Critères d'acceptation

1. Une tâche liée affiche son worktree, branche, HEAD et cible de réintégration sans inférence.
2. Les écarts de commits et `+/-/fichiers` sont mesurés ou marqués `unknown` avec provenance.
3. Les worktrees inconnus, sales ou divergents restent lisibles et ne déclenchent aucune action.
4. Les tests couvrent au moins deux worktrees et un refus d'identité/merge target manquant.
5. DA10-005 peut consommer la projection sans importer une commande Git mutative.

## Dépendances et suite

DA20-004 fournit l'ownership tâche → worktree. DA10-005 consomme ensuite cette projection pour le
panneau `Repository topology`; DA40-015 la rejoue dans la recette A→B.
