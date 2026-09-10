# Daidalon — plan général

**Projet MT Tasks :** `DA`
**Branche d'intégration locale :** `staging`
**Dernière mise à jour :** 2026-09-06

## M0 — Audit et validation

**Statut :** terminé
**Budget :** 17 SP

| Ordre | Identifiant | Domaine | Titre | Statut | Référence APEX |
|---:|---|---|---|---|---|
| 0 | `DA40-002` | `40 tooling` | Orchestrer le Sprint M0 — Audit et validation | Terminé | `.project/tasks/DA40-002-orchestration-m0` |
| 1 | `DA10-001` | `10 product-ui` | Auditer le parcours UI et inventorier les irritants | Terminé | `.project/tasks/DA10-001-audit-ui-opencode` |
| 2 | `DA20-001` | `20 workspace-git` | Auditer l’architecture projet, session, Git et worktrees | Terminé | `.project/tasks/DA20-001-audit-workspace-git` |
| 3 | `DA30-001` | `30 agent-runtime` | Auditer le contexte, les modèles et les coûts | Terminé | `.project/tasks/DA30-001-audit-runtime-couts` |
| 4 | `DA30-002` | `30 agent-runtime` | Formaliser le modèle cible APEX et Sprint | Terminé | `.project/tasks/DA30-002-modele-apex-sprint` |
| 5 | `DA40-001` | `40 tooling` | Produire la gap analysis et la décision M0 | Terminé | `.project/tasks/DA40-001-gap-analysis-m0` |

### Dépendances

- `DA10-001`, `DA20-001` et `DA30-001` peuvent être analysées en parallèle dans leurs worktrees respectifs.
- `DA40-002` orchestre le sprint depuis `staging` sans développer le produit.
- `DA30-002` utilise les constats des trois audits et s'exécute après `DA30-001` dans le même worktree.
- `DA40-001` consolide les quatre tâches précédentes et porte la décision GO/NO-GO de M0.
- Aucun développement produit important ne commence avant la clôture de `DA40-001`.

## Sprint 1 candidat

Le Sprint 1 ne sera matérialisé qu'après la décision M0. Sa tranche verticale candidate couvre un projet, une tâche APEX, une session et un worktree de bout en bout, avec contexte Git visible et premières métriques de coût.

Revue parent M0 : cinq livraisons done, orchestration en review ; GO conditionnel proposé, arbitrage utilisateur attendu. Sprint 1 non créé et non lancé.

## Décision M0 acceptée — 2026-09-06

M0 completed, six cartes done ; audit accepté, défauts produit encore ouverts. Les anciennes mentions de proposition/attente ci-dessus sont historiques. [Release 0.1](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/releases/0.1.md).

## Sprint 1 — Projet et environnement fiables

Statut planning ; 18 SP initiaux révisables ; aucune date engagée. [Mandat](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/sprints/sprint-1.md).

| Carte | Domaine | Titre | Statut | Référence APEX effective |
|---|---|---|---|---|
| DA40-003 | 40 | Établir un environnement local reproductible et les checks de référence | À faire | [scope](/Users/leanbot/Documents/40_Daidalon/features/40-tooling/.project/tasks/DA40-003-socle-local-reproductible/scope.md) |
| DA30-003 | 30 | Qualifier le parcours runtime et les points de contrôle du placement | À faire | [scope](/Users/leanbot/Documents/40_Daidalon/features/30-agent-runtime/.project/tasks/DA30-003-qualification-parcours-runtime/scope.md) |
| DA20-002 | 20 | Exposer un contexte local et Git vérifiable en lecture seule | À faire | [scope](/Users/leanbot/Documents/40_Daidalon/features/20-workspace-git/.project/tasks/DA20-002-contexte-local-verifiable/scope.md) |
| DA10-002 | 10 | Ouvrir explicitement le bon projet et afficher son contexte réel | À faire | [scope](/Users/leanbot/Documents/40_Daidalon/features/10-product-ui/.project/tasks/DA10-002-ouverture-projet-explicite/scope.md) |
| DA40-004 | 40 | Orchestrer et réceptionner le Sprint 1 — Projet et environnement fiables | À faire | [scope](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/tasks/DA40-004-orchestration-sprint-1/scope.md) |

Ordre : DA40-003 → DA30-003 → DA20-002 → DA10-002 ; DA40-004 supervise et réceptionne. Sprints 2/3 intentions seulement, aucune carte créée.
