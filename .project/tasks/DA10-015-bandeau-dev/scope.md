# DA10-015 — Bandeau machines et terminal du cockpit V2

- Story : US-14
- Feature : `.project/features/cockpit-v2`
- Maquette : `docs/product/maquette/cockpit-cursor.html`
- Worktree : `10`

## Objectif

Le bandeau du bas liste toutes les machines connues, locale d’abord, jusqu’au bouton Terminal. Le terminal est un bandeau bas, pas un onglet de l’écran de droite.

## Contexte

DA40-020 mesure le CPU/RAM local. Le terminal humain existe déjà dans le chrome V1. Cette carte le sort de l’écran de droite et aligne le bandeau sur la maquette.

## Dans le périmètre

- La rangée des machines occupe la largeur jusqu’au bouton Terminal (`flex: 1`, `min-width: 0`, `overflow-x: auto`).
- Le bouton Terminal ne défile pas avec les puces.
- La machine locale est la première puce. Les autres suivent l’ordre d’enregistrement.
- Chaque puce montre le nom, le CPU et la RAM. La puce de l’hôte du chat ouvert est marquée.
- Terminal ouvre un bandeau bas. Un shell ajouté porte le nom de son hôte. Fermer ce bandeau ne ferme pas l’écran de droite.

## Hors périmètre

- Enregistrer un hôte (US-02).
- PTY sur une machine distante.
- CPU/RAM distant (US-06) : puce `—` si la mesure n’existe pas.
- Écran de droite (DA10-012).

## Acceptation

Les cinq points du périmètre sont vrais. Avec une seule machine, une seule puce, locale, et le bouton Terminal reste à droite.

## Surfaces

Pied de fenêtre et bandeau terminal existant.

## Dépendances

DA40-020 pour les chiffres locaux. Aucune carte cockpit. Un seul écrivain sur le worktree `10`.

## Validation

Smoke visuel : ordre des puces, scroll si la rangée dépasse, Terminal ouvre et ferme le bandeau bas sans toucher l’écran de droite.
