# Plan — DA10-007 — Lier chaque chat à un worktree de carte

## Objectif

Un chat App = un worktree `features/tasks/<display_id>`. Launch crée ou
reprend **une** session collée à cet arbre. Preuve W1 : libellé worktree
rail + en-tête canvas/fil. Preuve W2 : pas de second chat.

Cible : worktree `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA10-007`,
branche `chat-worktree`, base `493f3aa31`. APEX hors SHA. Pas de produit
sur `staging`. Pas de push/merge.

## Décisions (Analyze validé)

1. **Pas de `git worktree add`.** Convention : chemin observé se termine
   par `/features/tasks/<mtTaskID>`. Absent / pas un checkout Git → refus
   typé. Création Git = hors scope.
2. **`POST /global/task-chat/open`** (`mtTaskID`, `apexExternalRef`,
   `worktree` absolu). `get({ type: "mt_task" })` → session existante,
   **zéro** `session.create`. Sinon `LocalContext.inspect` fail-closed,
   `session.create({ location: { directory } })`, `adopt` avec checkout
   observé. Collision / hors convention / inspect KO → erreur typée.
   Reprise de fil = `get`, **pas** `resume` HEAD-strict.
3. **Launch réel, le reste inerte.** Seul `launch` de la carte
   sélectionnée appelle `open` puis navigue
   `/{b64(worktree)}/session/{sessionID}` (`legacySessionHref`). Commit /
   merge / production restent « simulation — aucun effet ». Interdit :
   `TaskExecution.resume`, Git mutatif, MT write.
4. **Libellé W1.** Rail + en-tête canvas/fil : suffixe relatif
   `features/tasks/…` s’il existe dans le chemin **observé** ; sinon
   `unknown` tagué. Jamais inventer `features/tasks/<id>`. Deep-link
   canvas si déjà lié : même `sessionID`, href isolé au worktree si
   connu.
5. **Isolation.** `session.location.directory === checkout.worktree`. Pas
   de second chat si le binding existe, même si HEAD a bougé.
6. **Fixtures Sprint 4 A/B.** `sprintCockpitInput` inchangé. Open testé
   à part (arbre convention). Launch A/B cockpit peut 4xx (arbre ≠
   `<display_id>`) — fail-closed attendu.

## Contrats

`@opencode-ai/schema/task-chat` :

- `OpenInput` : `mtTaskID`, `apexExternalRef`, `worktree` (`AbsolutePath`)
- `OpenResult` : `sessionID`, `created` (bool), `binding` (`TaskBinding.Info`)
- Erreurs taguées : `WorktreeMissing` | `WorktreeNotCheckout` |
  `WorktreeConvention` | `InspectFailed` | `TaskBinding.ConflictError` |
  `TaskBinding.SessionNotFoundError`

Handler : brancher `TaskBinding.node` (absent du layer HttpApi
aujourd’hui). `Session.Service` déjà là. App n’importe jamais
Core/Server.

## Blocs

### B1 — Contrat + HttpApi open + generate

Fichiers :

- `packages/schema/src/task-chat.ts` (nouveau) + `packages/schema/src/index.ts`
- `packages/opencode/src/server/routes/instance/httpapi/groups/global.ts`
  (`GlobalPaths.taskChatOpen = "/global/task-chat/open"`)
- `packages/opencode/src/server/routes/instance/httpapi/handlers/global.ts`
- `packages/opencode/src/server/routes/instance/httpapi/server.ts`
  (`TaskBinding.node`)
- `packages/opencode/test/server/httpapi-global.test.ts` (étendre)
- Générés : `bun run generate` dans `packages/client` puis
  `./packages/sdk/js/script/build.ts`. Pas d’édition manuelle
  `src/generated`.

Séquence handler :

1. `get({ type: "mt_task", value })` → return `{ created: false, … }`
2. sinon convention + `inspect({ directory: worktree })`
3. `git.status === "available"` + `top_level` / branch / head présents
4. `session.create({ location: { directory: worktree } })`
5. `adopt` identité = session + checkout inspecté
6. collision / refus → 4xx, **zéro** seconde ligne

Tests live (arbre temporaire `…/features/tasks/<id>` + `.git`) :

- create une fois (`created: true`)
- reopen même `sessionID`, `created: false`, zéro insert
- refus absent / hors convention / pas checkout / collision
- payload invalide → 4xx
- zéro écriture execution / git / MT

Checks : `bun typecheck` Schema + opencode ; tests HTTP ciblés ;
`git diff --check` pathset B1.

### B2 — Libellé W1 + launch réel

Fichiers :

- `packages/app/src/pages/sprint-cockpit-mapper.ts`
- `packages/app/src/pages/sprint-cockpit.tsx`
- `packages/app/src/pages/sprint-cockpit-state.ts` (si intent launch)
- `packages/app/src/pages/sprint-cockpit.test.ts`
- `packages/app/src/utils/session-route.ts` (`legacySessionHref`)
- `packages/app/src/i18n/en.ts` (clés nouvelles seulement)

Mapper : `worktreeLabel` = suffixe `features/tasks/…` du chemin
observé, sinon fait `unknown`. `sessionHref` =
`legacySessionHref(worktree, sessionID)` si les deux sont connus.

UI : `TaskRailItem` + en-tête canvas/fil affichent `worktreeLabel`.
Confirm `launch` → `client.global.taskChatOpen` (nom généré) avec
identité + worktree de la carte sélectionnée, puis navigation. Autres
actions : dialogue simulation inchangé.

Tests App : label rail+fil (chemin observé / `unknown`) ; launch
appelle `open` une fois ; reopen n’appelle pas `session.create` ;
commit/merge/production sans `open` ; fixtures A/B non réécrites.

Checks : `bun typecheck` App ; tests cockpit ; `git diff --check`.

## Pathset

- `packages/schema/src/task-chat.ts`
- `packages/schema/src/index.ts`
- `packages/opencode/src/server/routes/instance/httpapi/groups/global.ts`
- `packages/opencode/src/server/routes/instance/httpapi/handlers/global.ts`
- `packages/opencode/src/server/routes/instance/httpapi/server.ts`
- `packages/opencode/test/server/httpapi-global.test.ts`
- `packages/client/src/generated*` (généré)
- `packages/sdk/js/**` (généré)
- `packages/app/src/pages/sprint-cockpit*`
- `packages/app/src/utils/session-route.ts`
- `packages/app/src/i18n/en.ts`

Hors pathset : fixtures A/B, `entry.tsx`, staging, worktrees métier,
création Git, bandeau DA10-008, rail sprint complet, `make dev`.

## Checks globaux (Verify)

- `bun typecheck` : schema, opencode, app (client si generate)
- Tests HTTP open + App mapper/launch
- `git diff --check`
- Smoke `/sprint/cockpit` : labels W1 ; launch sur arbre convention →
  session cwd = worktree ; reopen même `sessionID`

## Hors plan

Panneau secondaire, rail sprint complet, `make dev`, inspecteur
DA10-008, `git worktree add` / commit / merge / push, rewrite fixtures.
