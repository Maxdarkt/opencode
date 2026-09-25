# DA10-012 — Écran de droite du cockpit V2

- Story : US-12
- Feature : `.project/features/cockpit-v2`
- Maquette : `docs/product/maquette/cockpit-cursor.html`
- Worktree : `10`

## Objectif

L’écran de droite est fermé par défaut, s’ouvre à 50 % du workspace, puis se règle. Ses onglets sont horizontaux : Diff, Navigateur, Fichiers.

## Contexte

DA10-010 a livré le panneau secondaire V1. Cette carte le remplace par l’écran V2. Le bouton Écran et les cartes du fil qui l’ouvrent sont DA10-017. Cette carte fournit l’écran, la poignée et la barre d’onglets.

## Dans le périmètre

- L’écran est fermé à l’arrivée sur un chat.
- La première ouverture prend 50 % de la largeur du workspace. La poignée règle ensuite de 320 px à 80 % de cette largeur. La largeur choisie reste.
- La barre d’onglets est horizontale. Le bouton + est dans la rangée, juste après le dernier onglet. La rangée défile en X.
- Le + propose seulement Navigateur, Fichiers, Diff.
- Chaque chat a un onglet Diff tant qu’il n’est pas fermé. Le fermer le laisse absent. Un nouveau chat recrée Diff et laisse l’écran fermé.
- Changer de chat ou de machine ferme l’écran.
- Terminal n’est pas un onglet de cet écran.

## Hors périmètre

- Pastille d’hôte, cartes Diff et Aperçu, libellé du bouton Écran (DA10-017). L’écran doit toutefois pouvoir s’ouvrir et se fermer.
- Adresse distante (US-08).
- Inspecteur (DA10-016). Carton (DA10-014). Bandeau (DA10-015).

## Acceptation

Les sept points du périmètre sont vrais dans le cockpit produit. Un clic sur un onglet change le contenu. Un second clic ne referme pas l’écran : seul le contrôle de fermeture le fait.

## Surfaces

Shell App, panneau droit et barre d’onglets.

## Dépendances

Aucune carte cockpit pour démarrer. Débloque DA10-014, DA10-016, DA10-017. Un seul écrivain sur le worktree `10`.

## Validation

Smoke visuel : écran fermé au départ, ouverture à 50 %, drag, trois types d’onglets, fermer Diff, nouveau chat, changer de chat.
