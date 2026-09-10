---
id: OP-DA40-009-adoption
type: reconciliation-journal
document_status: active
authority: operation-owner
sources:
  - MT list request 8df53624-ca38-4b2b-bfd9-164293e6e5cf
  - .project/tasks/DA40-009-adopter-memoire-durable-daidalon/STATE.md
observed_at: 2026-09-07T10:03:16+02:00
---
# OP-DA40-009-adoption — Adoption non destructive de la mémoire durable

## Intention idempotente

- cible stable : `DA40-009` /
  `.project/tasks/DA40-009-adopter-memoire-durable-daidalon`.
- propriétaire : enfant `40-tooling`; préconditions : MT relu `in_progress`,
  attestation parent Terra/high, HEADs et baseline consignés dans STATE.
- effet attendu : créer conventions canoniques et projections déclarées, sans
  réécrire plans/sprints ni déplacer une preuve.

## Étapes observées

| Étape | Support | Effet observé | Preuve | État |
|---|---|---|---|---|
| Démarrage | MT | `todo → in_progress`, puis relecture | `1b34…8057`, `8df5…e5cf` | observed |
| Adoption | Markdown canonique | décision, modèles, routine, registre, index et checkpoint | liens de ce journal | observed |
| Projection | `40-tooling` | pointeur local read-only | `.project/projections/canonical-docs.md` | observed |
| Fraîcheur | projections | hash plan initial `f305…cdd1` devenu stale; relecture des cinq copies au hash `047c…3f3c` | registre canonique | observed, refreshed |
| Reprise | règles + checkpoint + MT + STATE | état reconstruit sans transcript; MT relu `in_progress` | B03, `590e…e4ae` | observed |
| Réception | MT + APEX | parent reçu, `done` relu puis carte archivée | `bd4541be…`, `bb118df0…`, `7b0eae96…`, `6b1d0662…` | observed |

## Conclusion

- `reconciled`; prochaine action : cadrer le prochain sprint depuis le checkpoint
  et les autorités canoniques. Aucun effet incertain ne reste à rejouer.
