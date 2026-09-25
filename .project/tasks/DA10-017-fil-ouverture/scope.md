# DA10-017 — Fil et ouverture de l’écran du cockpit V2

- Story : US-16
- Feature : `.project/features/cockpit-v2`
- Maquette : `docs/product/maquette/cockpit-cursor.html`
- Worktree : `10`

## Objectif

Le fil montre l’hôte et ouvre l’écran de droite via le bouton Écran, la carte Diff et la carte Aperçu. Un nouveau chat prépare Diff sans ouvrir l’écran.

## Contexte

DA10-012 fournit l’écran et l’onglet Diff par défaut. Cette carte fournit les commandes du fil qui l’ouvrent. L’adresse distante reste US-08.

## Dans le périmètre

- L’en-tête montre l’état, la pastille d’hôte, le chemin, Interrupt, et le bouton Écran. Le bouton est marqué quand l’écran est ouvert.
- La carte « Diff de ce chat » ouvre l’écran sur l’onglet Diff.
- La carte « Aperçu » n’apparaît que si le fil a une preview. Elle ouvre l’onglet Navigateur.
- L’URL affichée est celle que le produit fournit. Pour un projet local, c’est `http://127.0.0.1:<port>`.
- Un nouveau chat a l’onglet Diff et l’écran fermé. Le carton du fil est visible.

## Hors périmètre

- Calcul de l’adresse distante (US-08).
- Placement du chat dans le worktree (US-10).
- Contenu du carton (DA10-014), sauf le laisser visible quand l’écran est fermé.
- Barre d’onglets elle-même (DA10-012).

## Acceptation

Les cinq points du périmètre sont vrais. Créer un chat ne force pas l’écran ouvert.

## Surfaces

En-tête et fil du chat. Appels d’ouverture vers l’écran DA10-012.

## Dépendances

DA10-012. Un seul écrivain sur le worktree `10`.

## Validation

Smoke visuel : pastille d’hôte, Écran ouvre et ferme, carte Diff ouvre Diff, Aperçu absent sans preview, nouveau chat avec écran fermé.
