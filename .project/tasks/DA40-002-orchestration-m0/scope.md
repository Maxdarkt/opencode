# DA40-002 — Orchestrer le Sprint M0 — Audit et validation

## Objectif

Piloter M0 depuis `staging`, distribuer les audits dans les worktrees métier, surveiller les dépendances et réconcilier MT Tasks, APEX, Git et les chats Codex jusqu'à la décision finale.

## Dans le périmètre

- allocation et lancement des chats de tâches ;
- contrôle d'un propriétaire actif par worktree ;
- suivi des statuts, dépendances, découvertes et checkpoints ;
- revue des preuves et exécution des smokes parents ;
- coordination des corrections et clôture des tâches validées ;
- synthèse et préparation de la décision M0.

## Hors périmètre

- développement produit sur `staging` ;
- implémentation à la place des chats enfants ;
- push, merge, rebase, promotion ou suppression de worktree sans autorisation distincte.

## Critères d'acceptation

- chaque tâche est liée au bon chat, au bon worktree et à la bonne branche ;
- MT Tasks, APEX et Git restent réconciliés ;
- les dépendances empêchent les lancements prématurés ;
- les preuves des audits sont consolidées avant `DA40-001` ;
- le Sprint M0 se termine par une décision traçable.

## Exécution

- Dépôt parent : `/Users/leanbot/Documents/40_Daidalon/Daidalon`
- Branche : `staging`
- Chat parent : `01a074f6-0251-70f3-8535-85ac8565aa53`
- Dépendance : aucune
