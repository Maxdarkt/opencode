# Maquette visuelle — workbench Daidalon

**Format :** le **même** que DA10-006 : HTML/CSS **isolé**, cliquable, **sans** runtime OpenCode, fixtures locales, deux largeurs (1440 et 1024).

**Fichier :** [maquette/cockpit.html](./maquette/cockpit.html) — ouvrir dans le navigateur (`open docs/product/maquette/cockpit.html`).

On **ne** passe pas à Figma. La maquette App Solid existante (`/sprint/cockpit`) reste la recette **données** Sprint 4 ; celle-ci fige le **look et les panneaux** de la vision Cursor (rail worktree, prompt, Git vs staging, coût, serveurs).

## Ce qui est simulé

Clic rail A/B, onglets canvas, onglets droite, Start/Stop preview, Copier le prompt. Git/agent mutatif = dialogue « simulation, no effect ».

## Ce qui n’est pas dans la maquette

Vraies sessions, vrais tokens, `make dev` réel, merge réel. Voir [`livrable.md`](./livrable.md).

## Recette

1. 1440×900 : rail avec worktree sous chaque carte, centre chat, droite Tâche/Git/Coût/Serveurs.
2. 1024×768 : rail compact, panneaux encore adressables.
3. Isolation : zéro requête hors origine (fichier local).
