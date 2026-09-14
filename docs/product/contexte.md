# Moteur de contexte — couche métier Daidalon

**Statut :** livré en local le 2026-09-14 (Sprint 5, merge `0014d62e1`)
**Nom :** moteur de contexte (*context engine*). Pas « orchestrateur ». Pas le chrome.

C’est ce que Cursor fait **avant** chaque appel LLM : choisir **peu** de tokens **utiles**, borner l’agent, réutiliser le cache. Sans ça, le workbench est un habillage.

OpenCode a déjà des **briques** : `SessionCompaction` (prune, troncature d’outils, résumé), overflow, `prompt_cache_key`. Daidalon doit en faire une **politique métier** visible, collée au worktree.

## Contrat

1. Pack = mandat + pathset du worktree + sélection minimale (pas tout l’historique, pas tout le repo).
2. Compaction / prune **avant** overflow, pas après 30 min.
3. Préfixe cache-stable (cwd, règles, outils) pour ne pas brûler le prompt cache.
4. Bornes : tours, budget, temps, Interrupt. Course à vide = arrêt.
5. Inspecteur : ce qui **sera** envoyé (tokens, fichiers, résumé) — jamais un faux zéro.

## Preuves (catalogue)

Voir C1–C5 dans [`livrable.md`](./livrable.md).
