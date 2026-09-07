# Daidalon — topologie Git et worktrees

**Statut :** convention active  
**Dernière mise à jour :** 2026-09-06

## Structure locale

```text
/Users/leanbot/Documents/40_Daidalon/
├── Daidalon/                    # dépôt source, branche staging
└── features/
    ├── 10-product-ui/           # branche 10-product-ui
    ├── 20-workspace-git/        # branche 20-workspace-git
    ├── 30-agent-runtime/        # branche 30-agent-runtime
    ├── 40-tooling/              # branche 40-tooling
    └── 50-integration/          # branche baseline-integration, assemblage borné
```

Les quatre worktrees métier sont permanents. `50-integration` est un worktree dédié à l'assemblage de la baseline commune ; il ne crée pas un cinquième domaine MT. Les tâches sont exécutées séquentiellement dans un même worktree et peuvent avancer en parallèle entre domaines indépendants.

## Domaines

| Code | Domaine         | Responsabilité principale                                               |
| ---- | --------------- | ----------------------------------------------------------------------- |
| `10` | `product-ui`    | expérience produit, interface et organisation du travail du développeur |
| `20` | `workspace-git` | projets locaux, dépôts, branches, worktrees, fichiers et Git            |
| `30` | `agent-runtime` | agents, contexte, mémoire, modèles, routage, coûts et orchestration     |
| `40` | `tooling`       | MCP, skills, qualité, automatisation, CI et maintenance transverse      |

## Ports de développement local

Chaque racine Daidalon a un `.make.env` local, ignoré par Git et limité à `WORKTREE_CODE`, `BACKEND_PORT`, `UI_PORT` et `HOST`. Il ne doit contenir aucun secret. La formule est stable : le backend vaut `4100 + code`, et l'UI vaut `4400 + code`.

| Racine                   | Code | Backend |   UI |
| ------------------------ | ---: | ------: | ---: |
| dépôt source (`staging`) | `00` |    4100 | 4400 |
| `10-product-ui`          | `10` |    4110 | 4410 |
| `20-workspace-git`       | `20` |    4120 | 4420 |
| `30-agent-runtime`       | `30` |    4130 | 4430 |
| `40-tooling`             | `40` |    4140 | 4440 |
| `50-integration`         | `50` |    4150 | 4450 |

La façade du worktree `40-tooling` est la référence versionnée. Exécuter `make help`, puis `make context`, `make ports` ou `DRY_RUN=1 make dev`. `make dev-app` fournit `VITE_OPENCODE_SERVER_HOST` et `VITE_OPENCODE_SERVER_PORT` à Vite ; `make dev-server` exécute `opencode serve`. Le préflight refuse les ports occupés sans arrêter aucun processus, et les cibles de qualité délèguent aux packages plutôt qu'à la garde de tests racine.

## Flux Git cible

```text
upstream/dev
     ↓ audit et synchronisation explicite
staging
 ├── 10-product-ui
 ├── 20-workspace-git
 ├── 30-agent-runtime
 └── 40-tooling
     ↓ intégration validée
origin/dev
```

- `staging` est la branche d'intégration locale du dépôt source.
- Aucun développement de tâche n'est réalisé directement sur `staging`.
- Une tâche de code appartient à un seul domaine, une seule branche active et un seul worktree.
- Les opérations commit, rebase, merge, push et suppression de worktree restent des portes séparées et explicites.
- Les branches métier permanentes sont réalignées sur `staging` uniquement par une opération contrôlée.

## Convention MT Tasks et APEX

Les nouvelles cartes utilisent le préfixe projet `DA` et le code du domaine :

```text
DA10-001  product-ui
DA20-001  workspace-git
DA30-001  agent-runtime
DA40-001  tooling
```

Chaque carte suivie doit pointer vers un dossier canonique sous `.project/tasks/` et conserver la même référence dans MT Tasks, le plan général et l'état APEX.

## Projections documentaires

`/Users/leanbot/Documents/40_Daidalon/Daidalon` est la racine documentaire canonique. Les `PLAN-GENERAL.md` et `sprint.md` des worktrees sont des projections read-only conservées pour le contexte local ; le [registre canonique](../../.project/runtime/canonical-projections.md) porte leur `canonical_ref`, date, révision et fraîcheur. Aucun worktree ne publie le canonique en modifiant sa copie. Les dossiers APEX restent, eux, dans leur worktree métier ou d'intégration attitré et conservent leur `external_ref` stable.
