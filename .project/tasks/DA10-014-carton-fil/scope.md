# DA10-014 — Carton du fil du cockpit V2

- Story : US-13
- Feature : `.project/features/cockpit-v2`
- Maquette : `docs/product/maquette/cockpit-cursor.html`
- Worktree : `10`

## Objectif

Un carton fixe en haut à droite du chat montre l’emplacement, les tokens, le coût, la perf de l’hôte du fil et les sources. Il disparaît quand l’écran de droite est ouvert.

## Contexte

DA30-014 a livré tokens et coût. DA40-020 a livré le CPU/RAM local. DA10-012 livre l’écran dont l’ouverture masque ce carton.

## Dans le périmètre

- Visible seulement si un chat est ouvert et l’écran de droite est fermé.
- Il affiche le projet, l’hôte et le dossier, la branche et le HEAD, les tokens du fil, le coût du fil, le CPU et la RAM de la machine de ce fil, puis les sources.
- Un clic sur une source ouvre l’écran sur Fichiers et sélectionne ce fichier.
- Le fil ne passe pas sous le carton.
- Tokens et coût viennent de DA30-014. Absents → `unknown`.
- CPU/RAM locaux viennent de DA40-020. Une machine distante sans mesure affiche `—`.

## Hors périmètre

- Mesure CPU/RAM distante (US-06).
- Nouveau calcul de coût.
- Contenu des autres zones (DA10-012 hors le fait de s’ouvrir sur Fichiers, DA10-013, DA10-015, DA10-016, DA10-017).

## Acceptation

Les six points du périmètre sont vrais. Ouvrir l’écran masque le carton. Le refermer le réaffiche. Aucun faux zéro.

## Surfaces

Fenêtre de chat, lecture des contrats coût et CPU déjà livrés.

## Dépendances

DA10-012, DA30-014, DA40-020. Un seul écrivain sur le worktree `10`.

## Validation

Smoke visuel : carton visible écran fermé, masqué écran ouvert, source ouvre Fichiers, coût absent affiché `unknown`.
