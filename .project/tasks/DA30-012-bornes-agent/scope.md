# DA30-012 — Borner l’agent : tours, budget, Interrupt

## Objectif
C4 : l’agent s’arrête (tours, budget, temps). Interrupt réel. Pas de course à vide 30 min.

## Périmètre
Bornes runtime Session/agent. Stop et signal d’état.

## Hors périmètre
UI bandeau (DA10-008). Pack (DA30-013).

## Acceptation
Dépassement → arrêt. Interrupt no-op si idle. Tests runtime.

## Dépendances
DA30-013. Bloque DA10-008, DA40-017.
