# STATE — DA20-004 — Ownership et reprise lors du passage entre tâches

- schema: `apex-state/v2`
- generation: `5`
- updated_at: `2026-09-11T17:50:00+02:00`
- phase: `VERIFY`
- status: `checkpoint`
- tracking: `tracked`
- git: branche `cockpit-ownership`; commit local B1/B2 + preuves APEX autorisé. Pas de push/merge.
- active_block: `null`
- completed_blocks: `[analyze, plan, B1, B2, smoke, verify]`
- decisions: APEX Verify terminé. Commit local autorisé. MT reste `in_progress` jusqu’à clôture explicite. Hors scope : UI, DA20-005, push.
- read_set: `blocs/B1-task-ownership.md`, `blocs/B2-task-ownership.md`, `smoke-report.md`, `verify.md`.
- checks: typecheck Schema/Core PASS ; oxlint PASS ; 28 tests PASS ; `git diff --cached --check` PASS.
- blockers: `aucun`.
- debts: `No debt`.
- next_action: après commit, revue puis clôture MT si accepté ; pas de push.
- resume: relire ce STATE et `verify.md`. Ne pas relancer B1/B2.

## Context

- Epoch: `4`
- Compaction: `ready`
- Boundary: `VERIFY complete → handoff / commit si autorisé`
