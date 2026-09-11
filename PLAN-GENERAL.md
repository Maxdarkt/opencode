# Daidalon — plan général

Mis à jour le 2026-09-11. Projet MT DA ; branche source `staging` à `fbf4286b2`, sans Build produit direct. [Index sprints](/Users/leanbot/Documents/40_Daidalon/Daidalon/sprint.md).

## Travail courant

Sprint 4 est actif : `da-release-0.1-sprint-4` (`5059b73b-d8e8-40db-b9d5-1cbfb5c6424e`), 38 SP planifiés. L'utilisateur a validé le 2026-09-11 la maquette isolée du cockpit Sprint : 1440×900 et 1024×768, zéro requête hors origine Vite et aucune action réelle. DA10-006 est en review de livraison; DA30-009 reste en review code. La suite matérialise ce modèle en lecture seule, avant toute commande Git/agent réelle.

| Carte | Résultat attendu | SP | Dépendances | État |
|---|---|---:|---|---|
| DA30-009 | File séquentielle et autorité MT/APEX par tâche | 8 | candidate Sprint 3 intégrée dans `staging` | review — preuves code acceptées; recette intégrée réservée à DA40-015 |
| DA10-006 | Maquette isolée du cockpit Sprint | 3 | décision UX du 2026-09-11 | review — livraison UX validée; commit local et clôture à réconcilier |
| DA20-004 | Ownership et reprise sûrs lors du passage A → B | 5 | DA30-009 | todo — fournit l'identité sûre tâche → worktree |
| DA20-005 | Topologie Git en lecture seule pour le cockpit | 3 | DA20-004 | todo — source, branches, worktrees, cibles de merge et stats `+/-` — [scope](.project/tasks/DA20-005-topologie-git-lecture-seule-cockpit/scope.md) |
| DA30-010 | Métriques, provenance et signaux d’attention Sprint | 5 | DA30-009 | todo — valeurs honnêtes, fraîcheur et attention par tâche |
| DA10-005 | Cockpit Sprint réel en lecture seule | 8 | DA20-004, DA20-005, DA30-009, DA30-010 | todo — compose le modèle UX validé à partir de projections vérifiables |
| DA40-015 | Candidate intégrée et recette parent A/B | 3 | cinq lots produit | todo — recette cockpit et refus d'actions mutatives |
| DA40-016 | Orchestration, réception et rotation | 3 | aucune à l’entrée | in_progress / attente arbitrage de réception DA30-009 — [scope](../features/40-tooling/.project/tasks/DA40-016-orchestration-sprint-4/scope.md) |

## Historique

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

Sprint 4 est actif; DA10-006 est la référence UX validée et DA30-009 est en review code. La séquence est maintenant DA20-004 → DA20-005 et DA30-010 → DA10-005 → DA40-015, avec une seule écriture active. Les actions Git/agent restent hors de cette tranche. Un Sprint suivant ne sera cadré et créé qu'après sa clôture. [Briefing révisé](docs/product/sprints/sprint-4-proposal.md).

## Besoin produit à cadrer

Mémoire durable de projet : conception DA40-005, intégration au skill DA40-008 et adoption Daidalon DA40-009 sont terminées. Le [protocole opérationnel](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/workflow/memoire-durable.md) et le [checkpoint](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/runtime/durable-memory-checkpoint.md) deviennent les points d'entrée.

### Backlog validé

| Carte | Résultat attendu | État | Référence |
|---|---|---|---|
| DA30-011 | Réconcilier le worktree métriques Sprint 3 avec la révision intégrée avant réalignement | todo, hors Sprint 4 | [scope](.project/tasks/DA30-DA30-011-reconcilier-divergence-metriques-sprint3/scope.md) |

La dette de compaction desktop reste portée par la tâche APEX-only globale `desktop-compaction-transport` dans `codex-workflow-config`; elle ne devient pas une carte produit Daidalon.
