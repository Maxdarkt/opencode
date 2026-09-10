# DA40-010 — Assembler et valider la baseline commune du Sprint 1

## Objectif

Produire dans un worktree d'intégration dédié une baseline locale unique qui rassemble les livraisons validées du Sprint 1, puis démontrer qu'elle peut servir de base fiable au cadrage du Sprint 2.

## Contexte

- Base commune actuelle : `staging` à `702bf7dcd7468638c17fd95b110deb38bd253e9a`.
- `10-product-ui` à `e22d723895e3a8537f9bf21d5d6e4561ff630de1` contient le parcours UI et une copie du socle DA20.
- `20-workspace-git` à `2d973aeaf6a289ba1f343663a758d7c70b1bcc11` porte le commit autonome DA20.
- `40-tooling` porte `1b3278898`, `50019f223` et `b7111b6e9` pour le socle, l'architecture, le Makefile et les ports.
- Les worktrees existants comportent des projections et preuves locales à préserver.

## Dans le périmètre

- créer et utiliser `/Users/leanbot/Documents/40_Daidalon/features/50-integration` sur la branche `baseline-integration` ;
- inventorier les pathsets des commits acceptés et choisir un ordre d'intégration traçable ;
- réconcilier le chevauchement DA10/DA20 sans dupliquer ni perdre les changements validés ;
- intégrer les livraisons DA40 et les documents canoniques nécessaires ;
- exécuter les générations, checks ciblés et smoke intégré requis par les surfaces modifiées ;
- consigner l'assemblage, les écarts, les preuves, la dette et le handoff vers le Sprint 2 ;
- corriger les projections devenues obsolètes dans le plan, la release et le bilan Sprint 1.

## Hors périmètre

- push ou publication ;
- merge ou rebase de branches métier ;
- promotion vers `staging` ;
- suppression ou nettoyage des worktrees et preuves existants ;
- démarrage ou activation du Sprint 2.

## Critères d'acceptation

1. La branche d'intégration contient exactement les fonctionnalités validées du Sprint 1 et les documents canoniques utiles, avec provenance vérifiable.
2. Le chevauchement DA10/DA20 est expliqué et résolu sans double application.
3. Les checks ciblés et le smoke du parcours ouvrir un projet/contexte local passent sur la baseline assemblée.
4. Le Makefile et `.make.env` permettent d'utiliser le worktree avec des ports propres.
5. MT Tasks, APEX, `PLAN-GENERAL.md`, `sprint.md`, la release 0.1 et le checkpoint durable concordent.
6. Aucun changement n'est appliqué à `staging` ni aux branches métier existantes.

## Exécution

- MT Tasks : `DA40-010`, hors sprint, 5 SP.
- Domaine MT : `40` ; worktree effectif dédié : `features/50-integration`.
- Branche : `baseline-integration`.
- Dépendances reçues : DA10-002, DA20-002, DA40-003, DA40-006 et DA40-007, toutes archivées après validation.
- Routage : `gpt-5.6-sol` / `high`, car l'intégration croise plusieurs commits, générations et contrats avec un chevauchement confirmé.
- Autorités : MT pour le statut, ce dossier pour APEX, Git pour les faits, racine `Daidalon` pour les vues canoniques.

## Validation

Le chat enfant exécute Analyze, Plan, Build, checks et smoke technique, puis remet la tâche en review avec un plan de smoke parent. Le parent relit les pathsets, exécute le smoke final et clôture. Aucun acte Git externe ou promotion implicite.
