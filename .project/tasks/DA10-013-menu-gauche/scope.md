# DA10-013 — Menu gauche du cockpit V2

- Story : US-11
- Feature : `.project/features/cockpit-v2`
- Maquette : `docs/product/maquette/cockpit-cursor.html`
- Worktree : `10`

## Objectif

Le menu gauche du produit se replie, se règle à la souris, et montre les machines, la recherche et l’arbre sprint/chats de la machine active.

## Contexte

DA10-009 a livré le rail du chrome V1. Cette carte le remplace par le menu de la maquette V2. Le sprint 8 ne contient pas cette carte.

## Dans le périmètre

- Le bouton ☰ replie le menu à 52 px et cache navigation, recherche, machines et arbre. La poignée de largeur disparaît.
- La poignée règle la largeur de 200 à 480 px.
- La liste des machines change la machine active. La recherche filtre les projets de cette machine. Le placeholder est « Projet sur {machine} ».
- L’arbre montre le nom du projet, le libellé du sprint, puis les chats. Le chat ouvert est marqué.
- Rattacher et Connecter (+) sont visibles.

## Hors périmètre

- Enregistrer un hôte SSH (US-02).
- Changer le rattachement d’un projet (US-07).
- Écran de droite, carton, bandeau, inspecteur, cartes du fil (DA10-012, DA10-014, DA10-015, DA10-016, DA10-017).

## Acceptation

Les cinq points du périmètre sont vrais dans le cockpit produit, comparés à la maquette. Rattacher et Connecter ouvrent leur dialogue et ne persistent rien.

## Surfaces

Shell App, colonne gauche. Pas de nouveau calcul de projets : la liste déjà ouverte par le produit.

## Dépendances

Aucune carte cockpit. Un seul écrivain à la fois sur le worktree `10`.

## Validation

Smoke visuel : replier, tirer la largeur, filtrer un projet, changer de machine. Pas de serveur distant.
