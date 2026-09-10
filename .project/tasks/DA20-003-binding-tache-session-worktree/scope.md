# DA20-003 — Binding tâche/session/worktree

## Objectif

Établir un binding local durable et validable entre une carte MT, son dossier APEX, une session Codex, le dépôt, la branche et le worktree qui exécutent la tâche.

## Dans le périmètre

- définir et persister les identifiants et révisions nécessaires au binding ;
- relire le binding à la reprise et détecter toute divergence de tâche, session, dépôt, branche, HEAD ou worktree ;
- permettre l'adoption et le rejeu exacts lorsque l'identité concorde ;
- refuser explicitement les réutilisations incohérentes ;
- couvrir les contrats et les cas de reprise par des tests ciblés.

## Hors périmètre

- propriété exclusive du runner et arbitrage de concurrence, traités par DA30-004 ;
- présentation du contexte dans l'interface, traitée par DA10-003 ;
- réparation Git destructive, multi-hôte ou clustering.

## Critères d'acceptation

1. Le binding durable associe sans ambiguïté carte MT, external_ref APEX, session, location, dépôt, branche et worktree.
2. Une reprise exacte retrouve le même contexte sans créer de doublon.
3. Un écart d'identité est détecté avant toute écriture et produit un refus explicite et exploitable.
4. Les migrations éventuelles et les tests ciblés passent depuis les paquets concernés.
5. Le handoff documente le contrat consommable par DA30-004 et DA10-003, les limites et un plan de smoke parent.

## Exécution

- Sprint MT : `da-release-0.1-sprint-2` ; 8 SP.
- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/s2-20-binding`.
- Branche/base : `task-session-binding` depuis `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2`.
- Routage : `gpt-5.6-sol` / `high`, car la tâche touche la persistance d'identité et les contrats de reprise.
- Dépendance d'entrée : baseline Sprint 1 uniquement.
- Sorties dépendantes : DA30-004, puis DA10-003 et DA40-011.

## Handoff APEX

Lire `AGENTS.md`, `.project/apex.json`, ce scope et `STATE.md`. Mesurer HEAD et dirty avant Analyze. Passer MT de `todo` à `in_progress` uniquement au début réel d'Analyze. Aucun Build sur staging, aucun push/merge/rebase/promotion. Le handoff en review doit inclure checks, smoke technique, commit local borné et plan de smoke parent.
