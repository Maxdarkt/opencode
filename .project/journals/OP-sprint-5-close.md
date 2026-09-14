---
id: OP-sprint-5-close
type: reconciliation-journal
document_status: active
authority: parent Cursor sprint-support
sources:
  - MT Sprint 77ff44c7-23cd-44d7-89c1-32dfecaccd9a
  - git candidate c0df066c9
observed_at: 2026-09-14T09:16:00+02:00
---
# OP-sprint-5-close — clôture et promotion Sprint 5

## Intention idempotente

- cible : Sprint MT `77ff44c7-23cd-44d7-89c1-32dfecaccd9a` / `da-release-0.1-sprint-5`
- préconditions : 5 cartes `done`, candidate `c0df066c9` propre, mandat utilisateur « ok » (clôture)
- effet attendu : bilan, rotation plan, sprint `completed`, 5 cartes `archived`, docs sur `staging`, merge **seulement** `c0df066c9`, `git push origin staging`, `worktree remove` des arbres `features/tasks/` **propres**
- exclusion : DA10-008 `bun.lock` sale → pas de `worktree remove` ; pas de push `dev`/`main`/`master` ; Sprint 6 non créé

## Étapes

| Étape | Support | Effet attendu |
|---|---|---|
| 1 | Docs | bilan + plan sortant + PLAN-GENERAL vierge |
| 2 | MT | sprint completed, 5 archived |
| 3 | Git | commit docs, merge candidate, push origin staging |
| 4 | Git | retirer 4 worktrees propres ; conserver DA10-008 tant que sale |
