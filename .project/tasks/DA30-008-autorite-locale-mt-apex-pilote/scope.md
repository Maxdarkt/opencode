# Scope — DA30-008 — Exposer l’autorité locale MT/APEX au pilote de tâche

## Objectif

Rendre disponible, dans le protocole local consommé par l’App, une observation fiable du statut MT et de la phase APEX d’une tâche déjà liée à une session/worktree, afin que le pilote calcule et affiche une prochaine action réelle sans jamais fabriquer de donnée.

## Contexte et preuve mesurée

Le Pass B parent de la candidate Sprint 3 (`sprint3-integration`, HEAD `7c53f4afe485fa550b38a295c3aa255b45d495f5`) montre que le contexte de liaison, l’owner, le worktree et le blocage fail-closed sont rendus. Le correctif DA10-004 C1 transmet désormais ce contexte à `TaskPilotView`, mais `LocalContext.Info.task` n’expose ni statut MT ni phase APEX. Le rendu réel reste donc `Not observed` / `None`. Cela ne satisfait pas le critère Sprint 3 : une tâche réelle doit exposer phase APEX, statut MT et prochaine action.

## Périmètre

- Définir et fournir l’observation locale minimale `mtStatus`, `apexPhase` et son contexte de concordance pour une liaison tâche/session/worktree existante.
- Tracer l’autorité et la fraîcheur des valeurs; une valeur absente, incohérente ou non vérifiable reste explicitement inconnue et bloque l’action.
- Brancher ce contrat dans le contexte consommé par DA10-004, sans dupliquer la logique de transition déjà validée dans DA30-006.
- Couvrir les transitions admises, divergence, absence de donnée, reprise et la recette intégrée à 1440×900 et 1024×768.

## Hors périmètre

- Push, publication, tag, déploiement, multi-hôte, navigateur persistant, paiement, budget bloquant et suppression de worktree.
- Centralisation distante ou donnée facturée; le contrat reste local et ne prétend pas lire une autorité non disponible.
- Refonte de MT Tasks ou modification des données métier à distance.

## Critères d’acceptation

1. Une liaison réelle concordante rend statut MT, phase APEX et la prochaine action calculée à partir du contrat DA30-006.
2. Une liaison incomplète, divergente, en reprise ou sans source bloque l’action sans afficher une valeur inventée.
3. L’App ouvre le chat/worktree déjà lié, sans doublon, et reste responsive aux deux tailles de recette.
4. Tests ciblés, typechecks, format/diff check et smoke intégré reproductible sont conservés dans les preuves APEX.

## Surfaces probables et dépendances

- Runtime/Schema/Core : contrat de contexte de tâche local et son exposition HTTP ou session locale.
- App : `ProjectContextView`, `TaskPilotView` et leurs tests, avec DA10-004 comme consommateur.
- Dépendances : DA30-006 (machine de transition), DA10-004 (panneau), DA40-013 (réintégration et Pass B). Sprint MT actif `415b28cf-2d9c-4162-9be7-f6502a453b8e`.

## Risques et validation

Le risque principal est de confondre liaison locale et statut métier. Les tests et smokes doivent prouver la provenance des champs et le refus sûr; toute impossibilité d’observer la source est un état bloqué, pas un défaut masqué. Aucune opération destructive ni écriture MT externe n’est prévue par l’implémentation.

## Relation Sprint

Extension approuvée du Sprint 3, créée après la dette `DA40-014:16`. DA30-008 précède la réception finale de DA10-004 et DA40-013; elle ne clôture pas le sprint à elle seule.
