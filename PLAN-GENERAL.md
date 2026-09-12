# Daidalon — plan général

Mis à jour le 2026-09-12. Projet MT DA ; branche source `staging` à `b3aa79245` (merge candidate Sprint 4). [Index sprints](/Users/leanbot/Documents/40_Daidalon/Daidalon/sprint.md).

## Travail courant

Aucun sprint actif. Sprint 4 completed et promu : merge `b3aa79245` (`545718268` dans `staging`), push `origin/staging`, 7 worktrees de cartes retirés. [Bilan](docs/product/sprints/sprint-4.md). Sprint 5 : [proposition](docs/product/sprints/sprint-5-proposal.md), non créé.

## Historique

- Sprint 4 completed : 7 cartes produit, 35 SP acceptés, candidate `545718268` fusionnée dans `staging` au merge `b3aa79245` ; [bilan](docs/product/sprints/sprint-4.md) ; [journal de promotion](.project/journals/OP-DA40-016-sprint-4-promotion.md).

- Sprint 3 completed : 7 cartes, 34 SP acceptés, candidate `57da5e0d` intégrée localement dans `staging` au merge `948a99387`; autorité MT/APEX explicite, fraîche et fail-closed; [bilan](docs/product/sprints/sprint-3.md) ; [journal de promotion](.project/journals/OP-DA40-016-sprint-3-promotion-rotation.md).

- Sprint 2 completed : 5 cartes, 29 SP acceptés, candidate locale `10e1234b3`; smoke technique et visuel parent verts. [Bilan](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/sprints/sprint-2.md) ; [plan sortant](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/archives/sprint-2/plan-sortant.md).

- Sprint 1 completed : 7 cartes, 26 SP acceptés puis archivés. [Bilan](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/sprints/sprint-1.md) ; [plan sortant](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/archives/sprint-1/plan-sortant.md).
- M0 completed : six cartes archivées après validation done. [Bilan et dossiers](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/sprints/m0.md). Snapshot conservé dans `.project/archives/m0`.
- Carte héritée OC-0003 réconciliée, rattachée à `40-tooling`, close puis archived ; [trace](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/archives/legacy-oc-0003.md).
- DA40-005 reçue hors sprint : protocole Markdown/MT, modèles, réconciliation, reprise et routage modèle validés ; [trace](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/archives/da40-005.md).
- DA40-008 reçue hors sprint : `sprint-orchestrator` utilise checkpoints compacts, contexte ciblé, routage modèle attesté et guide portable de bootstrap projet ; [trace](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/archives/da40-008.md).
- DA40-009 reçue hors sprint : racine canonique, modèles, registre de projections, checkpoint et routine de reprise adoptés ; [trace](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/archives/da40-009.md).
- DA40-010 reçue hors sprint : baseline commune assemblée et validée dans `features/50-integration`, commit local `343099992` ; [trace](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/archives/da40-010.md).

## Suite

Sprint 5 non créé. Briefing : [proposition](docs/product/sprints/sprint-5-proposal.md). Nouveaux worktrees depuis `staging` `b3aa79245`. `develop`/`master` non poussés.

## Besoin produit à cadrer

Mémoire durable de projet : conception DA40-005, intégration au skill DA40-008 et adoption Daidalon DA40-009 sont terminées. Le [protocole opérationnel](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/workflow/memoire-durable.md) et le [checkpoint](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/runtime/durable-memory-checkpoint.md) deviennent les points d'entrée.

### Backlog validé

| Carte | Résultat attendu | État | Référence |
|---|---|---|---|
| DA30-011 | Réconcilier le worktree métriques Sprint 3 avec la révision intégrée avant réalignement | todo, proposé Sprint 5 | [scope](.project/tasks/DA30-DA30-011-reconcilier-divergence-metriques-sprint3/scope.md) |

À cadrer au Sprint 5 (pas encore de carte MT) : codes DA10/20/30/40 = thème ; worktrees métier permanents à geler. Promotion Sprint 4 faite.

La dette de compaction desktop reste portée par la tâche APEX-only globale `desktop-compaction-transport` dans `codex-workflow-config`; elle ne devient pas une carte produit Daidalon.
