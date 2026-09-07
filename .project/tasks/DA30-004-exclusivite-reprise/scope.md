# DA30-004 — Exclusivité et reprise

## Objectif

Garantir un propriétaire actif unique pour le contexte d'exécution d'une tâche, refuser les conflits et réconcilier une exécution interrompue à partir du binding durable de DA20-003.

## Dans le périmètre

- définir la propriété locale et ses invariants pour tâche, session et worktree ;
- refuser un second écrivain lorsque la propriété active ne concorde pas ;
- reprendre ou réconcilier une exécution interrompue sans réattribuer un effet incertain ;
- couvrir les conflits, l'idempotence et les frontières d'interruption par des tests ciblés.

## Hors périmètre

- clustering ou coordination multi-hôte ;
- réparation Git destructive ;
- présentation UI détaillée, traitée par DA10-003.

## Critères d'acceptation

1. Un seul propriétaire écrivain peut être actif pour le binding visé.
2. Une tentative concurrente ou incohérente échoue avant toute mutation métier.
3. La reprise distingue clairement effet confirmé, absent et incertain.
4. Les tests ciblés couvrent concurrence locale et interruption.
5. Le handoff fixe le contrat UI et le plan de smoke parent.

## Exécution

- Sprint MT : `da-release-0.1-sprint-2` ; 8 SP.
- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/s2-30-ownership`.
- Branche/base : `execution-ownership` depuis `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2`.
- Routage : `gpt-5.6-sol` / `high`, pour les invariants de concurrence, interruption et reprise.
- Dépendance d'entrée : commit accepté et contrat de DA20-003.
- Sorties dépendantes : DA10-003 et DA40-011.

## Handoff APEX

Le chat peut effectuer le préflight et relire ce scope, mais reste `todo` jusqu'à réception de DA20-003. Le parent déclenche alors Analyze et transmet le commit exact. Aucun Build sur staging, aucun acte Git externe ou destructif.
