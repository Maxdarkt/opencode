# DA10-007 — Lier chaque chat à un worktree de carte

## Objectif
W1 W2 : un chat App = un worktree `features/tasks/<carte>`. Lancer/reprendre le fil. Permet les tests de codage agentique.

## Périmètre
Création/reprise session collée à l’arbre. Libellé worktree. Pas de second chat si le fil existe.

## Hors périmètre
Panneau secondaire, rail sprint complet, make dev.

## Acceptation
Agent n’écrit que dans cet arbre. Reprise du fil existant.

## Dépendances
S’appuie sur DA20-003 (fait). Bloque DA10-008, DA40-017.
