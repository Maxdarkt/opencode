# B02 — Checkpoint, routage et reprise

Statut : terminé le 2026-09-07.

## Réalisation

Création ciblée de
`/Users/leanbot/.codex/skills/sprint-orchestrator/references/durable-checkpoints-and-routing.md`.
La ressource définit le checkpoint Markdown court et reconstruisible, ses sources/fraîcheur, une
prochaine action unique, la reprise sans rejeu d'effet inconnu, la grille Luna/Terra/Sol/Astra et
l'attestation demandée/observée. Elle impose un point parent compact `Objectif / Réalisé / Décision
en attente` sans modifier les autorités ni permissions du contrat principal.

## Proportionnalité

Le détail n'est lu que pour lancement, checkpoint, reprise ou escalade. `SKILL.md` conserve le
routage et les garde-fous essentiels : aucune réécriture du contrat principal ni nouvelle surface
produit.

## Preuve et suite

Voir `../smoke-report.md`. Prochaine action exécutée : B03.
