# DA10-016 — Inspecteur navigateur du cockpit V2

- Story : US-15
- Feature : `.project/features/cockpit-v2`
- Maquette : `docs/product/maquette/cockpit-cursor.html`
- Worktree : `10`

## Objectif

L’inspecteur s’ouvre et se ferme au clic droit sur la page du navigateur déjà affichée. Il n’a ni bouton dans le bandeau, ni onglet.

## Contexte

DA10-008 a livré l’inspecteur flottant du chrome V1. DA10-012 livre l’onglet Navigateur. Cette carte restreint l’ouverture au clic droit sur cette page.

## Dans le périmètre

- Aucun bouton Inspecteur dans le bandeau. Aucun onglet Inspecteur.
- Le clic droit sur la page du navigateur, pendant que cet onglet est celui affiché, ouvre ou ferme l’inspecteur.
- Les sections sont Tâche, Git, Coût, Serveurs, Permissions.
- Fermer l’écran, quitter l’onglet Navigateur, ou fermer cet onglet ferme l’inspecteur.

## Hors périmètre

- Nouvelles sections.
- Ouvrir l’inspecteur depuis le carton, le bandeau ou un raccourci.
- Contenu des sections au-delà de ce que DA10-008 et DA30-014 / DA40-020 fournissent déjà.

## Acceptation

Les quatre points du périmètre sont vrais. Un clic droit hors de la page du navigateur ne l’ouvre pas.

## Surfaces

Page du navigateur de l’écran DA10-012, panneau inspecteur existant.

## Dépendances

DA10-012. Un seul écrivain sur le worktree `10`.

## Validation

Smoke visuel : onglet Navigateur affiché, clic droit ouvre, second clic droit ferme, changement d’onglet ferme.
