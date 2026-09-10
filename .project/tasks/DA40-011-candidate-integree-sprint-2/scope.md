# DA40-011 — Candidate intégrée Sprint 2

## Objectif

Assembler dans un worktree dédié les livraisons acceptées de DA20-003, DA30-004 et DA10-003, puis démontrer une candidate exacte du Sprint 2 sans promotion sur staging.

## Dans le périmètre

- inventorier les commits et pathsets acceptés ;
- intégrer les trois livraisons dans un ordre traçable et résoudre les chevauchements ;
- exécuter checks ciblés, typechecks, smoke technique et préparer le smoke parent ;
- consigner provenance, limites, dettes et procédure de retour à la baseline.

## Hors périmètre

- push, publication, merge/rebase des branches métier ou promotion vers staging ;
- changement fonctionnel qui relève d'une tâche source.

## Critères d'acceptation

1. La candidate contient les seuls commits acceptés du sprint avec provenance vérifiable.
2. Les contrats binding, exclusivité/reprise et UI fonctionnent ensemble.
3. Les checks et le smoke intégré passent sur le HEAD exact de la candidate.
4. Le parent dispose d'un plan de smoke complet et d'un retour arrière documenté.

## Exécution

- Sprint MT : `da-release-0.1-sprint-2` ; 5 SP.
- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/s2-integration`.
- Branche/base : `sprint2-integration` depuis `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2`.
- Routage : `gpt-5.6-sol` / `high`, pour l'arbitrage d'intégration entre trois changements dépendants.
- Dépendances d'entrée : DA20-003, DA30-004 et DA10-003 acceptées.

## Handoff APEX

Le chat reste `todo` après préflight jusqu'aux trois handoffs. Aucun Build sur staging et aucune promotion implicite. Le parent réceptionne le smoke final avant toute clôture.
