# Sprint 4 — Cockpit Sprint lecture seule

**Sprint MT :** `5059b73b-d8e8-40db-b9d5-1cbfb5c6424e` · **État :** actif, checkpoint demandé le 2026-09-11 · **Référence de plan :** [proposition Sprint 4](./sprint-4-proposal.md).

## Décision produit à préserver

La livraison visée n'est pas un chat qui orchestre indistinctement les tâches. C'est un cockpit de Sprint où le pilote garde l'objectif, les décisions, les reprises et les intégrations, tandis que chaque tâche conserve son chat, son worktree et ses preuves.

La maquette validée est la référence UX : rail de tâches à gauche (activité tournante et attention bleue), canvas central pleine hauteur pour l'espace actif, puis panneau droit avec état de tâche, contexte vérifiable et topologie Git. La topologie est lue depuis le dépôt configuré : branches source, worktrees, cible de réintégration, propreté, avance/retard et statistiques `+/-`. Aucun nom de branche n'est figé. Toutes les actions du cockpit restent en lecture seule pendant ce Sprint.

## État au point d'arrêt

| Carte | SP | État MT / APEX | Fait vérifié | Prochaine action |
|---|---:|---|---|---|
| DA10-006 | 3 | `done` / Verify accepté | Maquette cliquable isolée, deux formats et absence de requête hors origine Vite. Commit `9de3b2e1c`. | Conserver comme référence UX ; pas de merge. |
| DA30-009 | 8 | `done` / Verify accepté | File séquentielle et autorité A→B fail-closed. 23 tests / 117 assertions, typechecks et smoke technique. Commit `3fa91aba1`. | Réception UI différée à DA40-015. |
| DA20-004 | 5 | `in_progress` / Plan checkpointé | Contrat `TaskOwnership` lecture seule, ownership A/B isolé et attention sans source à `unknown`. | B1 seul : Schema/Core, routé Luna sur reprise. |
| DA20-005 | 3 | `todo` / scoped | Scope canonique : topologie Git lecture seule. | Analyze après DA20-004. |
| DA30-010 | 5 | `todo` / re-scoped | Métriques, provenance, fraîcheur et attention. | Analyze après la fondation de file. |
| DA10-005 | 8 | `todo` / re-scoped | Cockpit réel : rail, canvas, panneau droit, données provenant des projections. | Analyze après DA20-004/005 et DA30-010. |
| DA40-015 | 3 | `todo` / re-scoped | Candidate, fixtures A/B, checks et recette parent. | Intégration après les lots produit. |
| DA40-016 | 3 | `in_progress` / orchestration | Mémoire, routage, réconciliations et ce checkpoint. | Attendre la reprise utilisateur. |

Les cartes terminées représentent 11 SP sur 38. MT Tasks affiche encore un agrégat `0 SP done` malgré les cartes `done` : c'est une divergence de totalisation à réconcilier, pas un avancement nul et pas une donnée que l'interface devra inventer.

## Ordre de reprise et limites

1. DA20-004 B1, puis B2 et ses preuves.
2. DA20-005 et DA30-010, dans des worktrees dédiés propres.
3. DA10-005 seulement avec les projections prouvées ; aucune donnée manquante ne devient un faux zéro.
4. DA40-015 : intégration et smoke visuel parent aux formats 1440×900 et 1024×768.

Le Sprint n'autorise ni action Git ou agent depuis le cockpit, ni push, merge, rebase, déploiement, suppression de worktree ou parallélisme d'écrivains. Les worktrees métier permanents restent préservés ; les nouveaux Builds passent par des worktrees dédiés.

## Preuves et reprise durable

- [État parent APEX](../../../.project/tasks/DA40-016-orchestration-sprint-4/STATE.md)
- [Registre de remises](../../../.project/sprints/5059b73b-d8e8-40db-b9d5-1cbfb5c6424e/remittances.md)
- [Plan DA20-004](../../../../features/tasks/DA20-004-cockpit-ownership/.project/tasks/DA20-004-ownership-reprise-passage-taches/plan.md)
- [Suivi des sprints](../../../sprint.md) et [plan général](../../../PLAN-GENERAL.md)

Au prochain redémarrage, relire ces projections et l'état Git avant de lancer B1. Le modèle demandé est consigné à chaque frontière ; une observation absente ou divergente reste informative et ne suspend pas le travail.
