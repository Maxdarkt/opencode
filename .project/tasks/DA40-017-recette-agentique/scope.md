# DA40-017 — Recette 0.2 : tests de codage agentique isolés

## Objectif
Prouver qu’on peut lancer un agent de **codage** sur un worktree de carte : isolation vs staging, pack visible, Interrupt.

## Périmètre
Scénario reproductible, checks, smoke. Pas de merge.

## Acceptation
1. Fichiers changés seulement dans l’arbre de carte.
2. Pack/tokens visibles.
3. Interrupt stoppe un run.

## Dépendances
DA30-013, DA30-012, DA10-007, DA10-008.
