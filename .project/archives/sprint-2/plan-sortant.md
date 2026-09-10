# Daidalon — plan général

Mis à jour le 2026-09-07. Projet MT DA ; branche source staging, sans Build produit. [Index sprints](/Users/leanbot/Documents/40_Daidalon/Daidalon/sprint.md).

## Travail courant

Sprint 2 actif depuis la baseline commune `9ba850b68`. Objectif : lier durablement carte MT, APEX, session et worktree, garantir l'exclusivité/reprise, rendre ce contexte visible puis produire une candidate intégrée.

| Carte | Résultat attendu | SP | Dépendances | État |
|---|---|---:|---|---|
| DA20-003 | Binding tâche/session/worktree durable et validé | 8 | baseline | done, commit `a70bf26ad` |
| DA30-004 | Propriétaire exclusif et reprise sûre | 8 | DA20-003 | done, commit `1de05c023` |
| DA10-003 | Contexte actif et divergences visibles dans l'UI | 5 | DA20-003, DA30-004 | done, commit final `f4b7b44d8` |
| DA40-011 | Candidate exacte et smoke intégré | 5 | trois tâches produit | in_progress, assemblage lancé |
| DA40-012 | Orchestration, réception et rotation du sprint | 3 | aucune à l'entrée | in_progress |

[Mandat Sprint 2](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/sprints/sprint-2.md). Une attente de dépendance reste `todo`, jamais `blocked`.

## Historique

- Sprint 1 completed : 7 cartes, 26 SP acceptés puis archivés. [Bilan](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/sprints/sprint-1.md) ; [plan sortant](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/archives/sprint-1/plan-sortant.md).
- M0 completed : six cartes archivées après validation done. [Bilan et dossiers](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/sprints/m0.md). Snapshot conservé dans `.project/archives/m0`.
- Carte héritée OC-0003 réconciliée, rattachée à `40-tooling`, close puis archived ; [trace](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/archives/legacy-oc-0003.md).
- DA40-005 reçue hors sprint : protocole Markdown/MT, modèles, réconciliation, reprise et routage modèle validés ; [trace](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/archives/da40-005.md).
- DA40-008 reçue hors sprint : `sprint-orchestrator` utilise checkpoints compacts, contexte ciblé, routage modèle attesté et guide portable de bootstrap projet ; [trace](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/archives/da40-008.md).
- DA40-009 reçue hors sprint : racine canonique, modèles, registre de projections, checkpoint et routine de reprise adoptés ; [trace](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/archives/da40-009.md).
- DA40-010 reçue hors sprint : baseline commune assemblée et validée dans `features/50-integration`, commit local `343099992` ; [trace](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/archives/da40-010.md).

## Suite
Suivre DA40-011, lancée avec les trois livraisons produit acceptées, puis recevoir sa candidate par checks et smoke parent avant de clôturer DA40-012 et le sprint. Sprint 3 reste une intention jusqu'au bilan Sprint 2. [Routine permanente](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/workflow/suivi-sprints.md).

## Besoin produit à cadrer

Mémoire durable de projet : conception DA40-005, intégration au skill DA40-008 et adoption Daidalon DA40-009 sont terminées. Le [protocole opérationnel](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/workflow/memoire-durable.md) et le [checkpoint](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/runtime/durable-memory-checkpoint.md) deviennent les points d'entrée.

### Backlog validé

| Carte | Résultat attendu | SP | Domaine | État |
|---|---|---:|---|---|
| DA30-005 | Réconcilier les 55 attentes historiques avec les 58 événements Schema exposés et rétablir la suite complète | 3 | 30 | todo, hors Sprint 2 |

[Scope DA30-005](/Users/leanbot/Documents/40_Daidalon/features/30-agent-runtime/.project/tasks/DA30-005-reconcilier-manifeste-evenements-schema/scope.md). La dette de compaction desktop reste portée par la tâche APEX-only globale `desktop-compaction-transport` dans `codex-workflow-config`; elle ne devient pas une carte produit Daidalon.
