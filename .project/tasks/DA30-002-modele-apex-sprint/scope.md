# DA30-002 — Formaliser le modèle cible APEX et Sprint

## Objectif

Transformer la vision Projet → Sprint → tâche → chat → branche → worktree en contrats produit et runtime suffisamment précis pour guider une tranche verticale.

## Dans le périmètre

- entités, identités, autorités et relations ;
- rôle du chat orchestrateur et limites avec les chats de tâches ;
- états, dépendances, reprise et réconciliation ;
- budgets, métriques et portes de validation ;
- compatibilité avec les contrats OpenCode observés pendant M0.

## Hors périmètre

- implémentation de l'orchestrateur ;
- couplage définitif à MT Tasks ;
- orchestration parallèle avant sécurisation du cycle mono-tâche.

## Critères d'acceptation

- modèle de données et machine d'états compréhensibles ;
- chaque donnée possède une autorité ;
- responsabilités du pilote et des tâches séparées ;
- scénario complet de reprise et de réconciliation documenté.

## Exécution

- Worktree : `30-agent-runtime`
- Branche : `30-agent-runtime`
- Dépendances : `DA10-001`, `DA20-001`, `DA30-001`
- Validation : scénario Sprint complet sur papier et revue des invariants
