---
id: OP-sprint-8-archive-candidate
type: reconciliation-journal
document_status: active
authority: parent Cursor sprint-support
sources:
  - mandat utilisateur 2026-09-25 archive MT + candidate merge
  - DA30-014 7da410789, DA30-015 584401a7e, DA40-020 27146219b
observed_at: 2026-09-25T14:00:00+02:00
---
# OP-sprint-8-archive-candidate

## Intention idempotente

- cible : archiver DA30-014, DA30-015, DA40-020 ; créer une carte candidate Sprint 8 (display_id MT)
- préconditions : 3 cartes `done` Verify PASS ; mandat explicite
- effet attendu : 3 archived ; 1 nouvelle `todo` assignée au sprint actif ; scope APEX ; prompt `$apex-task`
- exclusion : pas de merge staging ; pas de push ; pas de `worktree remove` ; pas de clôture sprint ; pas d’invention de `display_id`

## Conclusion

- **reconciled** : 014, 015, 020 archived ; DA20-007 `todo` sur Sprint 8 ; DA20-006 restaurée archived Sprint 7 ; scope APEX écrit. Pas de merge staging.

