# DA10-008 — Bandeau agent et inspecteur de pack

## Objectif
C1 UI : running/idle, outil, cwd, Interrupt, pack/tokens visibles (`unknown` si absent).

## Périmètre
Bandeau + inspecteur flottant minimal (contexte/coût).

## Hors périmètre
Chrome rail/terminal/secondaire (0.3).

## Acceptation
État agent et tokens lus, jamais un faux zéro. Interrupt câblé sur DA30-012.

## Dépendances
DA30-013, DA30-012, DA10-007. Bloque DA40-017.
