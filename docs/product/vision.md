# Daidalon — vision produit

**Produit :** Daidalon  
**Signature :** The open workspace for agentic development.  
**Dépôt :** fork communautaire de `anomalyco/opencode`  
**Statut :** vision directrice, à valider par l'usage et les mesures de M0  
**Dernière mise à jour :** 2026-09-06

## Intention

Construire sur OpenCode un environnement de développement agentique centré sur les projets, les tâches et les worktrees, avec une expérience graphique aussi lisible que Codex Desktop et une orchestration APEX/Sprint durable.

Le fork conserve les fondations d'OpenCode et les améliore progressivement. Il ne cherche pas à réécrire son runtime, son abstraction multi-fournisseur, ses sessions, son terminal, Git, ses outils ou sa gestion du contexte.

> L'environnement, les outils, le contexte, la mémoire et l'état appartiennent au runtime. Le fournisseur LLM est un moteur d'intelligence interchangeable.

## Principes produit

### Le projet est le point d'entrée

L'utilisateur choisit un dossier local avec un sélecteur clair, vérifie son arborescence, son dépôt Git, sa branche et ses worktrees, puis entre dans un espace projet stable.

### Le sprint possède un pilote

Chaque sprint dispose d'un chat orchestrateur général. Il présente l'objectif, les dépendances, les tâches, leur statut et les décisions. Il ouvre et suit les chats de tâches sans devenir lui-même un espace d'implémentation.

### Une tâche possède un contexte d'exécution isolé

Une tâche de code relie durablement :

```text
Tâche MT Tasks
  -> dossier APEX
  -> chat OpenCode
  -> branche Git
  -> worktree dédié
  -> fichiers, terminal et diff
  -> modèle, tokens, coût et résultat
```

### L'interface rend l'état évident

À tout moment, l'utilisateur doit savoir :

- quel projet est ouvert ;
- quel dossier, quelle branche et quel worktree sont actifs ;
- quelle tâche et quelle phase APEX sont en cours ;
- quels fichiers ont changé ;
- quel modèle travaille et combien il consomme ;
- quelles validations restent à effectuer.

### Le déroulement de l'agent reste visible

Les petites étapes visibles dans le prompt OpenCode sont conservées. Elles doivent pouvoir afficher la progression réelle, les fichiers concernés, les commandes importantes et les contrôles effectués sans noyer l'utilisateur dans les détails techniques.

### Les modèles restent interchangeables

OpenAI, Anthropic, xAI, les modèles locaux et les fournisseurs compatibles sont utilisés via API en priorité. Les abonnements peuvent être proposés comme adaptateurs opportunistes, jamais comme dépendance structurante.

### Le coût est un signal produit

Le runtime mesure les tokens d'entrée, de sortie et de cache, la latence, les retries, les escalades, le modèle, le fournisseur et le succès. L'objectif est de vérifier si la persistance externe, la sélection minimale de contexte, le cache et le routage permettent un coût API comparable à un abonnement intensif.

## Expérience cible

```text
Daidalon
├── Accueil
│   └── projets récents, favoris et sélecteur local explicite
├── Projet
│   ├── chat général
│   ├── branches et worktrees
│   ├── fichiers, recherche, Git et terminaux
│   └── sprints
└── Sprint
    ├── chat pilote
    ├── tableau des tâches et statuts
    ├── tâche APEX -> chat + worktree
    ├── dépendances et validations
    └── modèles, tokens, coûts et escalades
```

Le panneau latéral droit regroupe selon le contexte la vue Sprint, les fichiers, la recherche, les diffs, Git, le terminal et, plus tard, un navigateur persistant intégré.

## Fondations réutilisées

L'audit initial confirme la présence de briques à conserver :

- application SolidJS et desktop Electron ;
- Tailwind CSS 4, Kobalte, Solid Primitives et design system interne ;
- sessions et persistance SQLite ;
- providers, modèles, streaming, outils et MCP ;
- contexte durable, compaction, prompt caching et métriques de coût ;
- terminal, fichiers, revue de diff et intégration Git ;
- mécanismes de worktree existants à sécuriser et élever au rang d'objet produit.

## Limites directrices

- Ne pas présumer qu'une brique doit être remplacée avant de l'avoir auditée et testée.
- Ne pas coupler une tâche à plusieurs worktrees écrivables.
- Ne pas lancer l'orchestration parallèle avant de sécuriser le cycle de vie d'un worktree unique.
- Ne pas masquer les opérations Git destructrices derrière une action implicite.
- Ne pas optimiser uniquement le nombre de tokens au détriment du taux de réussite.
- Garder `codex-workflow-config` séparé et inchangé durant M0 ; APEX et Sprint sont des inspirations et des contrats d'intégration à étudier.

## Succès produit

Le projet réussit si une personne peut piloter plusieurs tâches de développement depuis une vue Sprint claire, reprendre chaque tâche sans perte de contexte, isoler son code dans un worktree, changer de modèle sans perdre l'état et comprendre le coût réel d'un résultat validé.
