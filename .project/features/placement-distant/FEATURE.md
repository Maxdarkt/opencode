# Feature — placement-distant

- Statut : `discovery`
- Créée : 2026-09-25
- Contexte : Daidalon, fork OpenCode. Le sprint 8 (0.5) reste l’arrêt local.
- Prochaine action : valider la découpe des tâches (stories déjà écrites + chrome V2) avant toute carte MT

## Objectif

L’outil agentique tourne sur une machine. Chaque projet est rattaché à cette machine ou à un hôte SSH. Le sprint, ses chats et ses worktrees restent dans ce projet. L’adresse ouverte dans le navigateur suit le rattachement. Les skills décrivent la méthode de travail, pas le lieu.

## Dans le périmètre

- Rattachement d’un projet : cette machine, ou un hôte SSH, modifiable.
- Dossier sprint dans le projet : fil du sprint et chats de tâches, quel que soit le worktree.
- L’outil impose le worktree de la carte. Le modèle ne choisit pas le dossier.
- Preview et smoke : `localhost` si le projet est ici ; adresse remontée vers le navigateur de l’outil si le projet est distant.
- Worktree, Git et `make dev` sur la machine du projet.
- Charge CPU/RAM de la machine qui exécute.

## Hors périmètre

- Réécriture Rust.
- Code Firetower (AGPL).
- Remplacer OpenCode par Claude Code ou Codex.
- Compte multi-utilisateurs, Postgres de contrôle, exposition publique.
- Sprint 8 : coûts, abonnements, CPU/RAM du poste local.

## Décisions

| Date | Décision | Motif |
|---|---|---|
| 2026-09-25 | Le sprint 8 s’arrête au livrable local | C, W, S sont livrés. E1–E4 se testent sur une seule machine |
| 2026-09-25 | Le 0.6 ancre le lieu dans le produit | Aujourd’hui l’URL de smoke est dans les skills (`tailscale ip -4`, bind `0.0.0.0`) |
| 2026-09-25 | Un projet peut revenir en local | Le même chemin produit recalcule l’adresse. Les skills ne changent pas |
| 2026-09-25 | Le navigateur reste sur la machine de l’outil | Jamais un Chrome sur l’hôte distant |
| 2026-09-25 | Les chats restent sous le projet | Cursor crée un dossier au nom du chat (`move_agent_to_root`). Daidalon l’interdit par le code |
| 2026-09-25 | Le cockpit V2 est la cible | `cockpit-cursor.html` validé. Mix Cursor et Codex. Le chrome V1 reste celui du sprint 6, pas la cible d’après S8 |

## Stories → APEX

Voir `STORIES.md`. Aucune carte MT avant validation.
