# DA10-003 — Contexte actif dans l'interface

## Objectif

Rendre visible le contexte réellement actif d'une tâche et permettre à l'utilisateur de reconnaître immédiatement une concordance, un écart ou une reprise nécessaire.

## Dans le périmètre

- afficher projet, sprint, tâche, session, worktree, branche et HEAD issus des contrats réels ;
- présenter des états explicites pour contexte concordant, incomplet, divergent et en reprise ;
- empêcher une action d'écriture lorsque le contexte n'est pas sûr ;
- tester les états et fournir un parcours de smoke visuel reproductible.

## Hors périmètre

- tableau de sprint complet, coûts, navigateur ou gestion multi-projet distante ;
- redéfinition des contrats de binding et de propriété livrés par DA20-003 et DA30-004.

## Critères d'acceptation

1. Les identifiants et faits Git visibles correspondent aux autorités relues.
2. Les écarts et reprises sont compréhensibles sans inspecter des logs.
3. Une action risquée est refusée tant que le contexte diverge.
4. Les tests UI ciblés et le smoke technique passent.
5. Le plan de smoke parent couvre viewport, fixtures, états attendus et régressions.

## Exécution

- Sprint MT : `da-release-0.1-sprint-2` ; 5 SP.
- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/s2-10-context-ui`.
- Branche/base : `active-context-ui` depuis `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2`.
- Routage : `gpt-5.6-terra` / `high`, pour une implémentation UI standard traversant plusieurs contrats.
- Dépendances d'entrée : commits et contrats acceptés de DA20-003 et DA30-004.
- Sortie dépendante : DA40-011.

## Handoff APEX

Le chat reste `todo` après préflight tant que ses deux dépendances ne sont pas reçues. Aucun Build sur staging. Le handoff en review inclut commit local borné, checks, smoke technique et plan de smoke parent.
