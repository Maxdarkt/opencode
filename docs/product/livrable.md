# Daidalon — livrable (outil à construire)

**Statut :** catalogue de features, recadrage 2026-09-12
**Autorités :** [`vision.md`](./vision.md) · [`contexte.md`](./contexte.md) · [`maquette.md`](./maquette.md)

Ce n’est pas un sprint. C’est **ce que l’outil doit devenir**. Chaque feature a une preuve. Look figé par la [maquette cliquable](./maquette/cockpit.html).

## Moteur de contexte (priorité)

| ID | Feature | Preuve |
|---|---|---|
| C1 | Pack visible avant envoi : tokens, fichiers, résumé | Inspecteur ≠ unknown inventé |
| C2 | Sélection minimale : mandat + pathset du **worktree** | Pas de dump repo / fuite `staging` |
| C3 | Compaction / prune / troncature d’outils (OpenCode) | Un tour ne recolle pas tout l’historique |
| C4 | Agent borné : tours, budget, temps, Interrupt | Pas de course à vide 30 min |
| C5 | Préfixe cache-stable (cwd, règles, outils) | Moins de tokens d’entrée à mandat égal |

## Workbench (Cursor)

| ID | Feature | Preuve |
|---|---|---|
| W1 | Un chat = un worktree, visible dans le rail et le fil | Libellé worktree sur chaque carte |
| W2 | Prompt qui positionne ; pas de second chat si la carte en a un | Reprise du fil existant |
| W3 | Agent borné (mandat, pathset, budget/temps) | Arrêt visible, pas 30 min hors sujet |
| W4 | Fichiers, diff, terminal du **même** arbre | Pas de fuite vers `staging` |
| W5 | Start/stop serveurs du worktree (`make dev`) + navigateur | Ports du `.make.env` de **cet** arbre |

## Conducteur de sprint

| ID | Feature | Preuve |
|---|---|---|
| S1 | Objectif, dépendances, tâches éligibles | Rail + panneau sprint |
| S2 | Prompt collable pour lancer une carte | Copie, pas d’orchestration magique |
| S3 | Candidate unique → merge `staging` → retirer les arbres de cartes | Portes Git séparées |
| S4 | Le pilote ne code pas | Chat sprint vs chat tâche |

## Économie

| ID | Feature | Preuve |
|---|---|---|
| E1 | Tokens / cache / coût / modèle / fournisseur | Jamais un faux zéro |
| E2 | Budget tâche et sprint + alerte (contexte, retries, course à vide) | Provenance affichée |
| E3 | API ou abo = adaptateur, pas l’identité | Changer de moteur sans perdre Git/APEX |
| E4 | CPU/RAM des process locaux | Panneau Serveurs |

## Hors livrable (pour l’instant)

Parallélisme d’écrivains, look « agence », worktrees métier figés, prod `master` automatique, capter un fournisseur unique, polish du panneau secondaire (onglets Browser/Diff/Files) — maquette OK, implémentation plus tard.
