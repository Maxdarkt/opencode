---
id: OP-sprint-6-close
type: reconciliation-journal
document_status: active
authority: parent Cursor sprint-support
sources:
  - MT Sprint 804083e3-534a-4f81-8182-05fc21f15dfb
  - git candidate e8723cb5b
observed_at: 2026-09-14T16:30:00+02:00
---
# OP-sprint-6-close — clôture et promotion Sprint 6

## Intention idempotente

- cible : Sprint MT `804083e3-534a-4f81-8182-05fc21f15dfb` / `da-release-0.1-sprint-6`
- préconditions : 3 cartes `done`, candidate `e8723cb5b` (`recette-maquette`) propre, mandat utilisateur « ok go »
- effet attendu : bilan, rotation plan, sprint `completed`, 3 cartes `archived`, docs sur `staging`, merge **seulement** `e8723cb5b`, `git push origin staging`, `worktree remove` des arbres `features/tasks/` **propres** du Sprint 6
- exclusion : pas de push `dev`/`main`/`master` ; Sprint 7 non créé ; worktrees métier `features/10-*`… conservés ; DA10-008 S5 hors périmètre

## Préflight Git (observé)

| Worktree | Branche | HEAD | porcelain |
|---|---|---|---|
| DA10-009 | chrome-cockpit | `58eb94ecc` | propre |
| DA10-010 | panneau-secondaire | `fecaf044c` | propre |
| DA40-018 | recette-maquette | `e8723cb5b` | propre |

`staging` @ `4bc70e689`. Candidate ancêtre : 009+010 inclus. `origin/staging` distant = `4bc70e689`.

## Étapes

| Étape | Support | Effet attendu |
|---|---|---|
| 1 | Docs | bilan + plan sortant + PLAN-GENERAL hors sprint actif |
| 2 | MT | 3 archived, sprint completed |
| 3 | Git | commit docs, merge candidate, push origin staging, remove worktrees propres |

## Conclusion

- `reconciled` : sprint `completed`, 3 cartes `archived`, merge `b7d70d3f8`, docs close `16b5f1dc3`, record `13b5545f0`.
- `origin/staging` @ `13b5545f0`. Sprint 7 non créé. Pas de push `dev`/`main`/`master`.
- Worktrees `features/tasks/DA10-009`, `DA10-010`, `DA40-018` retirés (propres). Residual dossier vide `features/tasks/DA10-010/packages` hors Git.
