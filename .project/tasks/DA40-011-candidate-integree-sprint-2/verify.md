# Verify — DA40-011

## Révision et périmètre vérifiés

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/s2-integration`.
- Branche : `sprint2-integration`.
- HEAD pré-commit : `9d0decb2be8abd1d7e7a31b28117572b0d873606` ; tree :
  `0b927e585cc947b682e053918d282d4f02ace6a4` ; baseline :
  `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2` ; divergence : 0 derrière / 10 devant.
- Index pré-B6 vide. Les projections `PLAN-GENERAL.md`, `sprint.md`, release/sprint et `.make.env`
  restent exclues du commit.

Le pathset produit autorisé contient exactement dix fichiers :

- C1 : `packages/schema/src/local-context.ts` ;
- C3 : `packages/opencode/test/server/httpapi-public-openapi.test.ts` ;
- C4 : `packages/app/src/components/active-task-write-guard.ts`, son test,
  `project-context-view.tsx`, `prompt-input/submit.ts` et son test ;
- C5 : `packages/app/src/components/titlebar.tsx`, `packages/app/src/pages/home/home-controller.ts`
  et son test.

Le dossier `.project/tasks/DA40-011-candidate-integree-sprint-2/` constitue le reste du pathset.

## Contrôles finaux

- Core : `bun test` — 1123 tests, 3143 assertions, 0 échec ; `bun typecheck` PASS ; migration
  `bun run script/migration.ts --check` PASS.
- Schema : `bun typecheck` PASS ; `bun test` — 13 tests passent et exactement 2 échouent, les deux
  `public event manifest` hérités et suivis par DA30-005.
- OpenCode : quatre tests HTTP/OpenAPI ciblés — 26 tests, 234 assertions, 0 échec ; typecheck PASS.
- App : contexte/garde/submit — 13 tests, 46 assertions, 0 échec ; contrôleur accueil isolé — 3
  tests, 4 assertions, 0 échec ; typecheck PASS.
- Client : génération PASS, aucun delta. SDK JS : build et typecheck PASS, aucun delta.
- Format/diff : Prettier du pathset et `git diff --check` PASS ; aucun généré inattendu.
- Smoke C6 accepté par le parent : divergent → resuming → concordant, `postAttempts=[]`, brouillon
  inchangé, session/tâche/worktree/branche/HEAD/owner/génération/effet exacts.

## Conclusion

La candidate satisfait les critères de DA40-011. Les deux rouges Schema et les avertissements App
hérités sont isolés dans `problems.md`; aucun défaut nouveau ne bloque le passage en review.
