# Daidalon — vision produit

**Produit :** Daidalon
**Signature :** The open workspace for agentic development.
**Dépôt :** fork communautaire de `anomalyco/opencode`
**Statut :** vision directrice — recadrage 2026-09-12
**Guide d’expérience :** Cursor (contrôle humain), pas Codex (orchestrateur fournisseur)

## Intention

Daidalon est un **outil de travail agentique que le développeur possède**. OpenCode fournit le moteur (sessions, outils, Git, multi-fournisseur). Cursor fournit le **modèle de conduite** : un chat collé à un worktree, un prompt qui positionne, un agent borné, le pilote qui garde la main.

On ne repart pas de zéro. On ne clone pas le chrome de Cursor. On **suit son contrat de contrôle** et on l’améliore là où Cursor et Codex lient le développeur au marketing d’un fournisseur.

> L’outil, le contexte, la mémoire et Git appartiennent au développeur. Le LLM est un moteur interchangeable. L’abonnement est un adaptateur de paiement, jamais l’identité du produit.

## Pourquoi pas rester sur Cursor

Cursor est excellent comme poste de pilotage. Il n’est pas le produit : le fournisseur, les règles plateforme et le prix de l’abonnement le sont. Daidalon existe pour :

- choisir le LLM **après** l’outil, pas l’inverse ;
- brancher API **ou** abonnement tant que c’est moins cher, et **sortir** quand les abo montent ;
- investir l’effort dans la **couche smart** : contexte, compaction, routage, budgets, refus des courses à vide.

Un agent qui tourne 30 minutes hors mandat n’est pas un outil. C’est une irréligion pour le fournisseur.

## Trois plans (pas un monolithe)

```text
1. Workbench (Cursor)
   chat ↔ worktree, fichiers, diff, terminal, serveur de preview, navigateur

2. Conducteur de sprint (Daidalon)
   objectif, dépendances, prompts de lancement, candidate, merge vers staging

3. Couche économie (Daidalon)
   tokens, cache, coût, budget, modèle, device (CPU/RAM des process locaux)
```

Le look peut rester simple **jusqu’à la maquette**. Le chrome cible est figé dans [`maquette.md`](./maquette.md) / [`maquette/cockpit.html`](./maquette/cockpit.html). Les features à livrer : [`livrable.md`](./livrable.md).

## Principes

### Le développeur conduit

L’agent n’orchestre pas le sprint tout seul. Un chat pilote propose ; l’humain lance, arrête, merge. Chaque chat de tâche a un worktree, un mandat, une fin.

### Une carte, un worktree

Pas de worktrees métier figés (`10-product-ui`…) comme méthode produit. DA10/20/30/40 = **thème**. Exécution = `features/tasks/<carte>/`. En fin de sprint : merger **la candidate**, pousser `staging`, retirer les worktrees de cartes.

### Identité visible en permanence

Projet, sprint, carte, phase APEX, worktree, branche, écart vs `staging`, modèle, tokens, coût. Absent = `unknown`, jamais un faux zéro.

### Les modèles restent interchangeables

API d’abord. Abonnements = adaptateurs. Changer de moteur ne change pas les tâches, les preuves APEX ni Git.

### Le coût est un levier, pas un badge

Mesurer pour **décider** : moins de contexte, autre modèle, arrêt, pas pour vanter un compteur. La couche smart vise un coût API maîtrisé face à un abo intensif, et une sortie propre quand l’abo augmente.

## Expérience cible

```text
Daidalon
├── Projet (dépôt source / staging)
│   ├── chats (chaque fil affiche son worktree, comme Cursor)
│   ├── fichiers, Git, terminaux
│   └── serveurs du worktree (make dev) + navigateur intégré
└── Sprint
    ├── chat pilote : dépendances, prompts, merge candidate
    ├── rail : tâches, activité, worktree, attention
    ├── canvas : chat de la carte sélectionnée
    └── panneaux : statut, Git vs staging, tokens/budget, process machine
```

## Succès

Une personne solo peut : coller un prompt sur le bon arbre, voir où elle est, lancer la preview, suivre le sprint, merger la candidate, changer de LLM, et **savoir ce que ça a coûté** — sans être captif d’OpenAI, Anthropic ou Cursor.

## Limites

- Ne pas encoder une mauvaise habitude personnelle dans l’architecture.
- Ne pas lancer un agent sans borne de mandat / budget / temps.
- Ne pas lier le produit à un abo unique.
- Ne pas fusionner commit/merge/push dans un bouton magique.
- Ne pas optimiser les tokens au détriment d’un résultat validé.
