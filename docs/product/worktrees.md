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
    └── 40-tooling/              # branche 40-tooling
```

Les quatre worktrees sont permanents et représentent des domaines métier. Les tâches sont exécutées séquentiellement dans un même worktree et peuvent avancer en parallèle entre domaines indépendants.

## Domaines

| Code | Domaine | Responsabilité principale |
|---|---|---|
| `10` | `product-ui` | expérience produit, interface et organisation du travail du développeur |
| `20` | `workspace-git` | projets locaux, dépôts, branches, worktrees, fichiers et Git |
| `30` | `agent-runtime` | agents, contexte, mémoire, modèles, routage, coûts et orchestration |
| `40` | `tooling` | MCP, skills, qualité, automatisation, CI et maintenance transverse |

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
