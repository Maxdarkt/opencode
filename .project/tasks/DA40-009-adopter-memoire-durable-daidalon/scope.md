# Scope — DA40-009

## Titre et objectif

Adopter dans Daidalon le protocole de mémoire durable Markdown/MT validé par DA40-005, sans migration destructive. Le projet doit posséder une racine documentaire canonique, des projections de worktree identifiables, des modèles applicables et une reprise démontrable depuis un checkpoint compact.

## Contexte mesuré

- Les plans sont actuellement copiés dans cinq racines et peuvent diverger.
- DA40-005 propose une autorité par fait, un seul écrivain canonique, des journaux idempotents, huit modèles Markdown et un archivage non destructif.
- La routine `docs/workflow/suivi-sprints.md` impose déjà la synchronisation MT/APEX/plan/sprints et l'archivage des tâches/chats terminés.

## Inclus

- Désigner et documenter `Daidalon/` comme racine documentaire canonique.
- Ajouter les répertoires/modèles nécessaires pour décisions, journaux, checkpoints et index d'archives.
- Marquer les projections de worktree comme lecture seule, avec référence canonique, observation et fraîcheur.
- Mettre à jour la routine de suivi et les documents d'entrée utiles.
- Prototyper une reprise réelle à partir d'un checkpoint compact et vérifier la réconciliation MT/Markdown.

## Exclus

- Déplacement ou suppression des dossiers APEX, historiques ou worktrees.
- Base vectorielle, index de recherche propriétaire, changement produit/runtime ou connecteur MT.
- Création/activation du Sprint 2 et réécriture rétroactive de tous les anciens documents.

## Acceptation

1. La racine canonique et les propriétaires d'écriture sont explicites.
2. Les nouveaux documents peuvent être créés depuis des modèles versionnés et validés.
3. Les projections locales ne peuvent pas être prises pour l'autorité et leur fraîcheur est lisible.
4. Un nouveau chat peut reconstruire l'état actif avec règles, checkpoint, MT et STATE sans relire les anciens chats.
5. Timeout, état périmé et carte archivée masquée ont une procédure concrète sans suppression de preuve.

## Surfaces, risques et validation

- Surfaces : documentation canonique, `.project/runtime`, `.project/journals`, `.project/archives`, routine de suivi et projections `PLAN-GENERAL.md`/`sprint.md`.
- Risque : divergence pendant la transition ; appliquer une adoption incrémentale et conserver les copies historiques.
- Validation : liens/pathsets, diff check, reconstruction à froid et comparaison des cinq projections.

## Dépendances

- Entrées : DA40-005 et DA40-008 terminées.
- Exécution sur `40-tooling`, après libération du worktree par DA40-008. Aucun sprint lancé par cette tâche.
