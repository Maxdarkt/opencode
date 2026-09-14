# STATE — DA20-005 — Topologie Git lecture seule

- schema: `apex-state/v2`
- generation: `8`
- updated_at: `2026-09-13T09:48:00+02:00`
- phase: `archived`
- status: `waiting-decision`
- tracking: `tracked`
- git:
  - branch: `task/DA20-005-topologie-git`
  - base: `7df15b2cd2f61cbc6d28fd7ed54a4401fe85a2df`
  - head: `7df15b2cd2f61cbc6d28fd7ed54a4401fe85a2df`
  - dirty: Schema + Core + tests + bunfig + APEX
  - upstream: `unknown`
  - merge_target_product: `unknown`
- active_block: `null`
- completed_blocks: `[analyze, plan, B1, B2, B3, smoke, verify]`
- decisions:
  - B1 Schema, B2 Core allowlist, B3 tests 2 worktrees
  - mergeTarget jamais inféré ; diffs working tree ≠ intégration
  - Provenance locale ; pas d’extension DA20-004
  - Pas de Git mutatif, pas de staging, pas de `20-workspace-git`
  - Pas de commit (autorité carte)
- read_set:
  - path: `.project/tasks/DA20-005-topologie-git-lecture-seule-cockpit/verify.md`
    evidence: dirty
- checks: typecheck schema/core PASS ; tests 14/14 PASS ; `git diff --check` PASS
- blockers: commit local si autorisé ; MT reste `in_progress`
- debts: `packages/core/bunfig.toml` `test.root = "."`
- mt: archived (done Sprint 4, commit `cfa081ca8`, 2026-09-12)
- next_action: aucune
- resume: relire ce STATE + `verify.md` seulement. HEAD `7df15b2cd`. Pas de push/merge.

## Context

- Epoch: `7`
- Compaction: `none`
- Boundary: `VERIFY complete → handoff sprint`
