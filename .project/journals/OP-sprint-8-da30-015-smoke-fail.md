---
id: OP-sprint-8-da30-015-smoke-fail
type: reconciliation-journal
document_status: active
authority: parent Cursor sprint-support
sources:
  - remise utilisateur 2026-09-25 DA30-015 Smoke FAIL, pas de commit
  - git worktree DA30-015 HEAD 8db56f535 dirty
  - MT Sprint 8 active, DA30-015 in_progress
observed_at: 2026-09-25T12:10:00+02:00
---
# OP-sprint-8-da30-015-smoke-fail

## Intention idempotente

- cible : DA30-015 reste `in_progress` ; pas `done` ; pas de commit/push/merge
- préconditions : HEAD worktree = `8db56f535` (base staging) ; arbre sale ; smoke-report FAIL
- effet attendu : PLAN-GENERAL / sprint.md / sprint-8.md / STATE staging / canvas alignés sur Smoke FAIL
- exclusion : pas d’édition du worktree carte ; pas de runtime wake/sleep ; pas de second chat 015

## Observation

- typecheck PASS ; billing-channel 6 PASS ; smoke FAIL
- blocage : libellé API/abo absent du cockpit (pas de contrôle modèle) et du catalogue de connexion affiché (fournisseur personnalisé seulement)
- runtime 015 : `none` (serveurs arrêtés)
- 014 smoke `web` ; 020 smoke `web-api` ; `runtimes_ge_api: 1` GREEN

## Conclusion

- **reconciled** : MT inchangé (`in_progress`) ; carte non `done` ; docs conductor mises à jour.
- **trou** : critère Smoke du plan (« libellé sur le contrôle modèle du cockpit ») vs UI réelle. Décision parent requise avant reprise Build.
