---
id: OP-legacy-worktrees-cleanup
type: reconciliation-journal
document_status: active
authority: parent Cursor sprint-support
sources:
  - mandat utilisateur 2026-09-25 option 1 : inventaire puis worktree remove des propres
observed_at: 2026-09-25T15:45:00+02:00
---
# OP-legacy-worktrees-cleanup — worktrees `features/10-*`…`s3-*`

## Intention

- cible : `git worktree remove` **seulement** les arbres `porcelain` vides ; branches locales conservées ; pas de `--force` ; pas de merge/rebase
- exclus : arbres sales ; checkout `staging` ; dossier orphelin `features/tasks/DA10-010` (pas un worktree)

## Préflight

| Chemin | Branche | HEAD | porcelain |
|---|---|---|---|
| 10-product-ui | 10-product-ui | e22d72389 | 24 — exclu |
| 20-workspace-git | 20-workspace-git | 2d973aeaf | 21 — exclu |
| 30-agent-runtime | 30-agent-runtime | 702bf7dcd | 41 — exclu |
| 40-tooling | 40-tooling | b7111b6e9 | 33 — exclu |
| 50-integration | baseline-integration | 9ba850b68 | 5 — exclu |
| s2-10-context-ui | active-context-ui | f4b7b44d8 | 5 — exclu |
| s2-20-binding | task-session-binding | a70bf26ad | 7 — exclu |
| s2-30-ownership | execution-ownership | 1de05c023 | 6 — exclu |
| s2-integration | sprint2-integration | 10e1234b3 | 6 — exclu |
| s3-10-sprint-view | sprint-view | 2756edfc4 | 0 — retirer |
| s3-10-task-pilot-authority | task-pilot-authority | aeee8b73e | 0 — retirer |
| s3-30-apex-cycle | apex-cycle | 948a99387 | 0 — retirer |
| s3-30-cost-metrics | cost-metrics | 70e6bfedc | 0 — retirer |
| s3-30-mt-apex-authority | mt-apex-authority | 00a62c8dd | 0 — retirer |
| s3-30-schema-manifest | schema-manifest | 948a99387 | 0 — retirer |
| s3-integration | sprint3-integration | 57da5e0d1 | 0 — retirer |

Reprise des exclus : `--force` ou ranger/committer les locaux, mandat séparé.

## Conclusion

- **reconciled** : 7 worktrees `s3-*` retirés (propres, sans `--force`). 9 sales exclus. Branches locales conservées. `staging` inchangé côté produit.
