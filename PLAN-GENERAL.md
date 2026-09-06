# Daidalon — plan général

**Projet MT Tasks :** `DA`  
**Branche d'intégration locale :** `staging`  
**Dernière mise à jour :** 2026-09-06

## M0 — Audit et validation

**Statut :** actif  
**Budget :** 17 SP

| Ordre | Identifiant | Domaine | Titre | Statut | Référence APEX |
|---:|---|---|---|---|---|
| 0 | `DA40-002` | `40 tooling` | Orchestrer le Sprint M0 — Audit et validation | À faire | `.project/tasks/DA40-002-orchestration-m0` |
| 1 | `DA10-001` | `10 product-ui` | Auditer le parcours UI et inventorier les irritants | À faire | `.project/tasks/DA10-001-audit-ui-opencode` |
| 2 | `DA20-001` | `20 workspace-git` | Auditer l’architecture projet, session, Git et worktrees | À faire | `.project/tasks/DA20-001-audit-workspace-git` |
| 3 | `DA30-001` | `30 agent-runtime` | Auditer le contexte, les modèles et les coûts | À faire | `.project/tasks/DA30-001-audit-runtime-couts` |
| 4 | `DA30-002` | `30 agent-runtime` | Formaliser le modèle cible APEX et Sprint | À faire | `.project/tasks/DA30-002-modele-apex-sprint` |
| 5 | `DA40-001` | `40 tooling` | Produire la gap analysis et la décision M0 | À faire | `.project/tasks/DA40-001-gap-analysis-m0` |

### Dépendances

- `DA10-001`, `DA20-001` et `DA30-001` peuvent être analysées en parallèle dans leurs worktrees respectifs.
- `DA40-002` orchestre le sprint depuis `staging` sans développer le produit.
- `DA30-002` utilise les constats des trois audits et s'exécute après `DA30-001` dans le même worktree.
- `DA40-001` consolide les quatre tâches précédentes et porte la décision GO/NO-GO de M0.
- Aucun développement produit important ne commence avant la clôture de `DA40-001`.

## Sprint 1 candidat

Le Sprint 1 ne sera matérialisé qu'après la décision M0. Sa tranche verticale candidate couvre un projet, une tâche APEX, une session et un worktree de bout en bout, avec contexte Git visible et premières métriques de coût.
