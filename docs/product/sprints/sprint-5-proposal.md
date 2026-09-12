# Proposition Sprint 5 — Pilotage séquentiel réel

Statut : **proposition**. Aucun sprint MT créé. À valider puis créer dans un **nouveau chat** support.

## Objectif

Passer du cockpit lecture seule (fixtures A/B) à un **pilotage séquentiel réel** : le pilote voit les vraies cartes MT/APEX, ouvre/reprend le chat et le worktree existants, refuse les identités divergentes. Une seule tâche en écriture. Toujours **sans** commit/merge/lancement d’agent depuis le cockpit.

Incrément 0.2 suite. 0.3 (parallélisme, commandes Git/agent mutatives) hors périmètre.

## Lots proposés (~29 SP)

Les `display_id` nouveaux seront créés au cadrage ; ne pas les inventer avant. `DA30-011` existe déjà.

| Ordre | Thème | Résultat | SP | Notes |
|---:|---|---|---:|---|
| 1 | DA40 | Promouvoir `545718268` vers `staging` (préflight) | 3 | Mandat Git explicite dans la carte |
| 2 | DA30 | `DA30-011` réconcilier métriques Sprint 3 | 3 | Carte backlog existante |
| 3 | DA40 | Thèmes DA10/20/30/40 seulement ; geler/documenter les worktrees métier permanents | 3 | Pas de suppression destructive sans mandat |
| 4 | DA10 | Cockpit branché aux identités réelles (plus fixtures A/B comme source) | 8 | Fail-closed si snapshot absent |
| 5 | DA10/DA20 | Actions non mutatives réelles : ouvrir worktree, reprendre chat, afficher prochaine action APEX | 5 | Deep-link / open folder ; pas d’effet Git |
| 6 | DA40 | Candidate + recette parent aux deux tailles | 3 | Après 4–5 |
| 7 | DA40 | Orchestration / rotation | 3 | Parent du sprint |

## Contrat

1. A reste consultable après activation de B ; aucune fuite d’identité.
2. Reprendre un chat existant ; ne pas en créer un second pour B.
3. Le cockpit n’exécute pas commit, merge, push, spawn agent.
4. Promotion `staging` seulement dans le lot 1, après préflight.

## Exclusions

Parallélisme d’écrivains, multi-hôte, publication, paiement, force-push, suppression de worktree.

## Première action du chat suivant

Skill `sprint-support` + `task-scope` après validation de ce briefing. Créer le sprint MT (`da-release-0.1-sprint-5`), les cartes, `PLAN-GENERAL`, `sprint.md`. Ne pas coder sur `staging`.
