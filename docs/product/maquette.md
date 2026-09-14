# Maquette visuelle — workbench Daidalon

**Format :** le **même** que DA10-006 : HTML/CSS **isolé**, cliquable, **sans** runtime OpenCode, fixtures locales, deux largeurs (1440 et 1024).

**Fichier :** [maquette/cockpit.html](./maquette/cockpit.html)

**Voir :** servir le dossier (`python3 -m http.server 8766 --bind 127.0.0.1 --directory docs/product/maquette`) puis ouvrir `http://127.0.0.1:8766/cockpit.html`. Un `.html` dans l’éditeur n’est pas le rendu.

On **ne** passe pas à Figma. `/sprint/cockpit` (App) = recette **données** Sprint 4. Cette maquette fige le **chrome agentique**.

## Chrome figé

| Surface | Rôle |
|---|---|
| Centre | Chat borné uniquement. Trace des tools dans le fil. |
| Bandeau agent | Running / idle / blocked, outil en cours, cwd, Interrupt. |
| Panneau secondaire (Cursor) | Icône split **à droite du burger**. Poignée = largeur. Chaque onglet = Browser **ou** Git Diff **ou** Files. `+` pour en ouvrir un autre. |
| Files | Arbre du worktree **à droite** du split ; fichier au centre ; fil d’Ariane en haut. |
| Git Diff | Fichiers touchés par **ce chat**, `+n/−n`, clic = patch entier. |
| Browser | URL + onglets de preview de l’app du worktree. |
| Bas | Terminal **humain** (VS Code) : bandeau, split, plusieurs shells. Pas la trace agent. |
| Inspecteur flottant | Tâche, Git vs staging, Coût, Serveurs, Permissions. Show/hide. |
| Rail | Carte + worktree + pastille (écrit / attend / budget). Pilote ≠ tâche. |

## Ce qui est simulé

Clic rail, icône split (après ☰) panneau secondaire, `+` Browser/Git Diff/Files, poignée de split, arbre → fichier, liste diff → patch, inspecteur, Start/Stop, Copier le prompt, Interrupt, Split terminal. Git/agent mutatif = dialogue « simulation, no effect ».

## Ce qui n’est pas dans la maquette

Vraies sessions, vrais tokens, `make dev` réel, merge réel. Voir [`livrable.md`](./livrable.md).

## Recette

1. 1440×900 : chat plein ; icône split (droite) ouvre le secondaire (défaut Files : éditeur + explorer droite).
2. `+` : nouvel onglet Browser / Git Diff / Files. Poignée entre chat et secondaire.
3. ☰ inspecteur flottant. Terminal bas.
4. 1024×768 : rail compact, secondaire encore adressable.
5. Isolation : zéro requête hors origine.
