# B3 — Helper de fixture concordante — DA40-013

## Changement

Ajout de `packages/opencode/script/create-task-pilot-fixture.ts`, commis en
deux commits locaux bornés : `0d6303113` (helper) et `57da5e0d1` (consommation
en lecture seule du snapshot autoritatif). Le helper prend une base SQLite
inexistante, un snapshot existant et un worktree; il ne contacte pas MT, ne
modifie pas le snapshot et refuse toute paire worktree/HEAD absente du snapshot.

Il crée dans la seule base fournie Project, Session `ses_task_pilot_fixture`,
TaskBinding et TaskExecution sans effets pending. Il appelle ensuite
`TaskAuthority.observe` et `TaskPilot.evaluate`; l’exécution réussit seulement
si l’observation est `available` et l’action est la décision réellement fournie
par le snapshot.

## Preuves

- `packages/opencode: bun typecheck` PASS.
- `packages/core: bun test task-authority, task-binding, task-execution` PASS — 20/20.
- `packages/opencode: bun test ./test/server/httpapi-global.test.ts` PASS — 7/7.
- `packages/app: task-pilot-state.test.ts` sous Bun 1.3.14 PASS — 4/4.
- Snapshot canonique à `c9bbcde` refusé après les commits locaux : garde HEAD
  exacte, PASS attendu.
- Copie temporaire du runtime, avec seulement le HEAD Git mesuré rafraîchi et
  les MT/APEX conservés, produit `available`, `in_progress`, `analyze` et
  `write_plan` dans une base temporaire; aucun MT distant n’a été modifié.

## Résultat

La fixture visuelle est réalisable. Le parent doit rafraîchir le runtime
canonique afin qu’il porte HEAD `57da5e0d156c1b6f73c2c4528b502d6b764d9891`
et soit encore avant `expiresAt`; aucun fichier temporaire dérivé ne constitue
une source autoritative de recette parent.
