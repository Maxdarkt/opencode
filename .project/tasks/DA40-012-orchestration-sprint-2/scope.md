# DA40-012 — Orchestration Sprint 2

## Objectif

Piloter le Sprint 2 depuis le chat parent en gardant MT Tasks, APEX, Git, documents canoniques, worktrees et chats concordants jusqu'à la réception, la rotation et l'archivage.

## Dans le périmètre

- activer et suivre le sprint, ses dépendances et ses propriétaires de worktree ;
- lancer chaque chat avec modèle et effort explicites, puis attester le routage ;
- contrôler les handoffs, smokes parents, corrections, statuts et commits locaux ;
- tenir le checkpoint compact et les projections ;
- clôturer, faire la rotation du plan et archiver cartes done et chats terminés après validation utilisateur.

## Hors périmètre

- coder les tâches enfant sur staging ;
- push, publication, merge/rebase/promotion ou suppression de worktree sans mandat distinct.

## Critères d'acceptation

1. Chaque carte garde dossier APEX, chat, modèle, branche et worktree concordants.
2. Les dépendances déclenchent les tâches dans l'ordre prévu sans faux statut blocked.
3. Le parent exécute les smokes finaux sur les révisions exactes.
4. MT, plan, sprint, release, checkpoint et archives concordent à la clôture.

## Exécution

- Sprint MT : `da-release-0.1-sprint-2` ; 3 SP.
- Chat : parent courant ; racine canonique `/Users/leanbot/Documents/40_Daidalon/Daidalon`.
- Branche d'observation : `staging`, sans Build produit.
- Routage : `gpt-5.6-terra` / `high`, orchestration standard multi-autorités.
- Dépendance d'entrée : aucune ; dépendances de sortie : réception des quatre tâches enfant.
