# Feature — cockpit-v2

- Statut : `scoped`
- Créée : 2026-09-25
- Contexte : maquette validée `docs/product/maquette/cockpit-cursor.html`
- Prochaine action : Analyze des cartes, dans l’ordre des dépendances, un écrivain à la fois sur le worktree 10

## Objectif

Le chrome produit reprend le cockpit V2. Chaque story ci-dessous est une zone de cette maquette. La carte APEX de la story a le même objectif, le même hors-périmètre et les mêmes critères.

## Dans le périmètre

- Menu gauche repliable et réglable.
- Écran de droite caché, 50 % à l’ouverture, onglets horizontaux.
- Carton du fil, masqué quand l’écran est ouvert.
- Bandeau des machines et terminal à droite.
- Inspecteur au clic droit sur la page du navigateur.
- Fil : pastille d’hôte, bouton Écran, cartes Diff et Aperçu.

## Hors périmètre

- `placement-distant` : US-07 à US-10, US-02, US-03, US-01, US-04, US-05, US-06.
- Réécriture du moteur OpenCode, Rust, code Firetower.
- Chrome V1 `docs/product/maquette/cockpit.html` comme cible. Il reste la référence du sprint 6.

## Décisions

| Date | Décision | Motif |
|---|---|---|
| 2026-09-25 | La maquette V2 est le contrat visuel | Validée dans le chat. Les critères des stories en recopient les comportements |
| 2026-09-25 | Une story, une carte | Évite qu’une carte absorbe une zone voisine ou une story de placement |
