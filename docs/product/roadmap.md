# Daidalon — roadmap fonctionnelle

**Statut :** backlog de cadrage
**Sources :** [`vision.md`](./vision.md), [`conception.md`](./conception.md)
**Dernière mise à jour :** 2026-09-12

Les sprints M0–4 sont **faits** (voir `sprint.md`). Ce fichier ordonne les **capacités restantes**. MT Tasks porte le statut ; APEX les preuves.

## Ordre de construction (après Sprint 4)

### W1 — workbench Cursor

- rail de chats avec **worktree visible** ;
- une tâche = un arbre = un fil ;
- identité Git vs `staging` ;
- lancer / arrêter `make dev` du worktree et ouvrir le navigateur intégré.

### W2 — conducteur de sprint

- dépendances et tâches éligibles ;
- prompt collable pour lancer une carte ;
- candidate, merge vers `staging`, retrait des arbres de cartes ;
- le pilote ne code pas.

### W3 — économie et couche smart

- tokens, cache, coût, modèle, fournisseur par tour / tâche / sprint ;
- budgets et alertes (contexte trop large, retries, course à vide) ;
- adaptateurs d’abonnement **sans** en faire l’identité du produit ;
- charge machine : CPU / RAM des process locaux (serveur, Vite, agent).

### W4 — contexte maîtrisé

- compaction, cache, sélection minimale, provenance ;
- bornes de mandat (temps, budget, pathset) pour qu’un agent ne « parte pas 30 min ».

### W5 — communauté et sorties

- `develop` preview / `master` prod = portes explicites ;
- sync amont OpenCode, extensions, multi-OS.

## Règles de priorisation

1. Le développeur garde la main.
2. État visible (Git, sprint, coût).
3. Preview locale rapide.
4. Coût et contexte.
5. Parallélisme en dernier.

## Hors chemin critique

`DA30-011` (hygiène métriques Sprint 3). Worktrees métier `10-*`… : geler, ne pas reconstruire.
