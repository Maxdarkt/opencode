---
id: OP-sprint-7-close
type: reconciliation-journal
document_status: active
authority: parent Cursor sprint-support
sources:
  - MT Sprint c6ac90e2-78ea-4955-a13e-7a64ab9d490d
  - git candidate df2885ba1
  - git DA40-021 f13b0ecff
observed_at: 2026-09-25T10:12:00+02:00
---
# OP-sprint-7-close — clôture et promotion Sprint 7

## Intention idempotente

- cible : Sprint MT `c6ac90e2-78ea-4955-a13e-7a64ab9d490d` / `da-release-0.1-sprint-7`
- préconditions : 4 cartes `done`, candidate `df2885ba1` propre, DA40-021 `f13b0ecff` propre, mandat utilisateur récupérer les travaux sur staging + clôturer
- effet attendu : bilan, rotation plan, sprint `completed`, 4 cartes `archived`, docs sur `staging`, merge **candidate-merge** puis **task/DA40-021-ports-6400-bind** (021 absente de la candidate 0.4), `git push origin staging`, `worktree remove` des arbres `features/tasks/` **propres** du Sprint 7
- exclusion : pas de push `dev`/`main`/`master` ; Sprint 8 non créé par cette clôture ; worktrees métier `features/10-*`… conservés

## Préflight Git (observé)

| Worktree | Branche | HEAD | porcelain |
|---|---|---|---|
| DA10-011 | conducteur-sprint | `da8c68597` | propre |
| DA40-019 | preview-make-dev | `d2fb5ea0f` | propre |
| DA20-006 | candidate-merge | `df2885ba1` | propre |
| DA40-021 | task/DA40-021-ports-6400-bind | `f13b0ecff` | propre |

`staging` @ `e9e2aed10` après merges. Candidate merge-base était `03f621743`. `origin/staging` à créer au push.

## Étapes

| Étape | Support | Effet attendu |
|---|---|---|
| 1 | Docs | bilan + plan sortant + PLAN-GENERAL hors sprint actif |
| 2 | Git | commit docs, merge candidate, merge 021, push origin staging, remove worktrees propres |
| 3 | MT | 4 archived, sprint completed |

## Conclusion

- **reconciled** : docs `b4ed778b1`, candidate `4f1764b59`, 021 `e9e2aed10` ; 4 cartes MT archived ; sprint `completed`
- push / worktree remove : à observer après
