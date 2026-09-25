# Daidalon — topologie Git et worktrees

**Statut :** convention active (recadrage 2026-09-12)
**Dernière mise à jour :** 2026-09-25

## Méthode actuelle (Cursor)

```text
Daidalon/                          # source, branche staging — observation, pas de Build produit
features/tasks/<CARTE>/            # un worktree par carte MT, créé au lancement
```

- Une **carte** = une branche `task/…` = un worktree = un chat.
- DA10 / DA20 / DA30 / DA40 = **thème** informatif, pas un checkout.
- `staging` n’exécute pas le produit. Les nouveaux arbres partent du HEAD `staging` après promotion.
- Fin de sprint : merger **uniquement la candidate** (dernier worktree qui contient les commits), `git push origin staging` seulement, retirer les worktrees de cartes **propres**. Jamais de force-push. Preview (`develop`) et prod (`master`) restent facultatives et **séparées**.
- Sprint 7 : candidate = worktree `features/tasks/DA20-006`, branche `candidate-merge`, SHA Verify `VERIFY_SHA`. Après promotion `staging` : retirer seulement `features/tasks/DA10-011`, `DA40-019`, `DA20-006` s’ils sont propres. Les arbres métier (`features/10-*` … `40-*`) et `s2`/`s3` restent.

## Legacy — worktrees métier permanents

```text
features/10-product-ui/
features/20-workspace-git/
features/30-agent-runtime/
features/40-tooling/
```

Ces arbres existent encore. Ils **ne sont plus** le modèle d’exécution. Les y empiler plusieurs tâches à la suite a bloqué le flux. Ne pas les supprimer sans mandat. Ne pas les reproduire dans l’UI comme « les » worktrees du produit.

## Thèmes (pas des checkouts)

| Code | Thème | Exemples |
|---|---|---|
| `10` | workbench / UI | cockpit, rail, preview |
| `20` | Git / workspace | topologie, diff vs staging |
| `30` | runtime / économie | file, tokens, budget, contexte |
| `40` | tooling | candidate, promotion, serveurs, MCP |

## Flux Git

```text
staging  (source saine)
  └── task/DA…-…     (carte)
        └── candidate sprint
              └── merge → staging → origin/staging
```

Aucun développement de carte sur `staging`. Commit / merge / push / `worktree remove` sont des portes séparées.

## APEX et projections

La racine documentaire canonique est le checkout `staging`. Les dossiers APEX vivent **dans le worktree de la carte**. Les copies `PLAN-GENERAL.md` / `sprint.md` ailleurs sont des projections read-only.
