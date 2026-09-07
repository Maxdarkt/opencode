---
id: OP-<stable-id>
type: reconciliation-journal
document_status: active
authority: operation-owner
sources: []
observed_at: <ISO-8601>
---
# OP-<stable-id> — <transition>

## Intention idempotente

- cible stable : <display_id/external_ref>.
- propriétaire : <acteur>; préconditions : <révisions MT/APEX/Git>.
- effet attendu : <transition>.

## Étapes observées

| Étape | Support | Effet observé | Preuve | État |
|---|---|---|---|---|
| 1 | <support> | <fait> | <lien/revision> | <observed|pending> |

## Conclusion

- `<reconciled|reconciliation_incomplete|conflict>`; prochaine action : <une action>.
