# Discovery — placement-distant

Date : 2026-09-25. Sources : bilans M0–S7, `PLAN-GENERAL.md`, `livrable.md`, skills `00_cursor-config` (`apex-task`, `task-runtime`, `sprint-support`), `workflows/ssh-leanbot.md`, carte CC10-010.

## Arrêt au sprint 8

Chaque sprint jusqu’au 7 suppose une seule machine. Le sprint 8 complète le catalogue local. Il ne apprend pas le SSH.

| Sprint | Ce qu’il a figé | Lieu supposé |
|---|---|---|
| M0 | Audit, pas de produit distant | Poste local |
| S1 | Ouvrir le bon dossier, Git visible, ports par worktree | Local |
| S2 | Carte, session, worktree liés et repris | Local |
| S3 | Vue sprint, pilote, coût honnête | Local |
| S4 | Cockpit lecture seule, topologie Git | Local |
| S5 | Moteur de contexte C1–C5 | Local |
| S6 | Chrome : rail, chat, terminal, Browser / Diff / Files | Local |
| S7 | Conducteur, `make dev`, candidate `staging`, ports 6400, listen `0.0.0.0` | Local, mais le bind ouvre déjà toutes les interfaces |
| S8 | DA30-014, DA30-015, DA40-020 — coûts, abo, CPU/RAM **locaux** | Local. Cartes `done` le 2026-09-25. Sprint encore `active` |

Après S8, le catalogue `livrable.md` (C, W, S, E) est couvert. W1–W5 et S1–S4 décrivent le rituel Cursor (chat, worktree, prompt collé, remise). Ils ne décrivent pas un projet qui change de machine.

## Trous entre S8 et l’exécution distante

1. **Le lieu est dans les skills.** `workflows/ssh-leanbot.md` dit : Cursor sur le MacBook, projets en Remote SSH sur le Mac mini. `apex-task` et `task-runtime` (CC10-010) calculent l’URL avec `tailscale ip -4` et exigent un listener `0.0.0.0`. Interdit : `127.0.0.1`. Si le projet revient sur la machine de l’outil, cette règle casse. DA40-021 a déjà mis le bind `0.0.0.0` dans le produit.
2. **L’adresse ne suit pas le projet.** Il faut `localhost` quand le projet est ici, et une adresse remontée (le navigateur de l’outil pointe vers la machine distante) quand il est en SSH. Smoke et preview utilisent la même règle.
3. **Le chat quitte le projet.** Le conducteur S7 donne un prompt. Le chat de tâche doit créer le worktree et s’y placer tout en restant dans le projet. Sur Cursor, `move_agent_to_root` ajoute un dossier au nom du chat, hors des projets. Le sprint, lui, marche : un fil, des prompts, des remises.
4. **Les skills portent la méthode.** Analyze, Plan, Build, Smoke, Verify, sprint support. Ils doivent appeler le produit pour le lieu et l’URL. Ils ne stockent pas l’hôte.

## Ce que la vision ajoute

L’outil reste sur une machine. Les projets sont sur cette machine ou sur des hôtes SSH, éventuellement plusieurs. Sous le projet : un dossier sprint, le fil, et tous les chats de tâches, worktrees différents compris. On voit ce qu’on a lancé sans sortir du projet.

## Décision du 2026-09-25, après-midi

Le cockpit V2 (`docs/product/maquette/cockpit-cursor.html`) est validé le 2026-09-25 comme résultat à atteindre après le sprint 8. Le chrome V1 (`cockpit.html`) reste celui livré au sprint 6.

Adresse distante, recommandation en attente de cette suite : tunnel SSH local, URL `http://127.0.0.1:<port>` sur la machine de l’outil.

## Questions encore ouvertes

1. Première preuve du 0.6 : oui, tout sur la machine de l’outil, avant un hôte SSH. Décidé le 2026-09-25.
2. L’adresse distante : tunnel SSH vers un port local de l’outil, ou URL de l’hôte joignable depuis le navigateur ?
