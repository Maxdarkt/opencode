# DA30-001 — Auditer le contexte, les modèles et les coûts

## Objectif

Mesurer ce qu'OpenCode fournit déjà pour le contexte, la mémoire, les fournisseurs, le routage et la télémétrie, puis définir un protocole économique reproductible.

## Dans le périmètre

- persistance, compaction, retrieval, cache et sélection du contexte ;
- abstraction providers/modèles et changement de modèle ;
- routage, retries et escalade ;
- tokens entrée/sortie/cache, coût et latence ;
- protocole abonnement actuel, API naïve et runtime optimisé sur des tâches réelles.

## Hors périmètre

- optimisation du runtime ;
- sélection définitive d'un fournisseur ;
- conclusion économique sans données mesurées.

## Critères d'acceptation

- flux complet d'un appel documenté avec références de code ;
- métriques disponibles et manquantes inventoriées ;
- hypothèses économiques explicitement falsifiables ;
- protocole de mesure, jeux de tâches et critères de comparaison définis.

## Exécution

- Worktree : `30-agent-runtime`
- Branche : `30-agent-runtime`
- Dépendance : aucune
- Validation : audit de code, traces instrumentables et tableau des métriques
