# C6 — fixtures reproductibles du smoke métier

## Résultat

C6 est prêt sans changement produit supplémentaire. Deux scripts et leur mode opératoire matérialisent
une session locale liée à une tâche, son ownership et son effet, puis rejouent les états concordant,
divergent, pending/resuming et concordant après reprise.

La fixture est conservée dans `/Users/leanbot/.local/share/opencode/opencode-local.db` :

- session : `ses_da40_011_smoke_s2` ;
- tâche : `DA40-011-SMOKE` ;
- effet : `c6-smoke-effect` ;
- worktree/branche/HEAD final : `s2-integration` / `sprint2-integration` /
  `9d0decb2be8abd1d7e7a31b28117572b0d873606` ;
- owner final : `c6-smoke-resumed`, génération `2`, effet `confirmed`.

## Vérifications

- Les quatre transitions ont été écrites puis relues par
  `GET /global/context?...session_id=ses_da40_011_smoke_s2` sur `127.0.0.1:4151`.
- Assertions API PASS : binding exact au HEAD en concordant, baseline
  `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2` en divergent, effet `pending` en reprise,
  puis HEAD exact + owner génération 2 + effet confirmé.
- UI locale PASS : « Active task context matches », « diverges », « requires recovery », puis
  « matches » après reprise.
- Smoke Playwright PASS : `postAttempts: []`; brouillon `C6 draft must remain intact` identique après
  les refus divergent et pending. Tout POST était en plus neutralisé au niveau navigateur, donc aucun
  effet externe ne pouvait partir.
- Tests garde/submit : `11 pass`, `0 fail`, `38 expect()` ; zéro prompt et restauration du brouillon
  et de son contexte couverts.
- Prettier des trois artefacts : PASS.

## Reproduction

Les commandes, URL et contrôles manuels sont dans
[`fixtures/README.md`](../fixtures/README.md). Les scripts sont
[`c6-business-smoke.ts`](../fixtures/c6-business-smoke.ts) et
[`c6-browser-smoke.ts`](../fixtures/c6-browser-smoke.ts).

La fixture reste volontairement concordante en génération 2. Aucun prompt, appel modèle ou acte Git
sensible n'a été effectué. B6 reste fermé.
