# DA10-018 — Retour d’agent du cockpit V2

- Story : US-17
- Feature : `.project/features/cockpit-v2`
- Maquette : `docs/product/maquette/cockpit-cursor.html`
- Worktree : `10`

## Objectif

Chaque retour d’agent dans le fil tient dans une fenêtre : objectif demandé, réalisé, problèmes, dettes, points. Les fichiers touchés s’ouvrent dans Fichiers. Une autorisation se copie pour le prompt suivant.

## Contexte

Le sprint colle un prompt. Le chat APEX rend une remise. Aujourd’hui ce texte est libre. Cette carte fige la fenêtre, pas le texte des skills.

## Dans le périmètre

- La fenêtre a cinq libellés, dans cet ordre : Objectif, Réalisé, Problèmes, Dettes, Points. Une section vide affiche « Aucun ».
- Sous ces libellés, la liste des fichiers touchés, avec le delta de lignes. Un clic ouvre l’écran de droite sur Fichiers et sélectionne ce fichier.
- Si une autorisation ou une remise est demandée, elle est dans une fenêtre sous la liste, avec un bouton Copier. Le texte copié est celui à coller dans le prompt suivant.
- Pas d’autre endroit du fil pour demander cette autorisation.

## Hors périmètre

- Changer le texte des skills `apex-task` et `sprint-support`.
- Calculer le diff (la liste vient du diff du chat, DA10-012).
- Marquer la carte MT `done` depuis cette fenêtre.

## Acceptation

Les quatre points du périmètre sont vrais dans le cockpit produit, comparés à la maquette. Copier place le texte dans le presse-papiers.

## Dépendances

DA10-012 pour ouvrir Fichiers. DA10-017 pour le fil. Un seul écrivain sur le worktree `10`.

## Validation

Smoke visuel : les cinq libellés, clic fichier ouvre Fichiers, bouton Copier, aucune autorisation hors de cette fenêtre.
