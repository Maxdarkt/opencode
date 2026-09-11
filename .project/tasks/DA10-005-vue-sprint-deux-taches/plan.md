# Plan — DA10-005 — Cockpit Sprint lecture seule

## Objectif

Route réelle `/sprint/cockpit` dans le shell App : rail A/B, canvas, panneau
droit. Données = projections via HttpApi. Aucune mutation. Fail-closed.

## Décisions (Analyze validé)

- Cherry-pick **fichiers App** de `9de3b2e1c` seulement. Pas de merge staging.
  Pas de `.project` DA10-006. Pas le court-circuit `entry.tsx` / `AppInterface`.
- `POST /global/ownership` payload `TaskOwnership.Input` → `Snapshot`.
- `POST /global/topology` payload `RepositoryTopology.Input` (snapshot
  ownership **fourni**, pas recomposé) → `Snapshot`.
- Métriques : `POST /global/metrics` existant. Pas d’agrégat serveur inventé.
- Entrée explicite (identités + `repositories[]` avec `mergeTarget` string).
- Canvas : onglets locaux sans PTY / Review. Chat = deep-link `sessionID` si
  fact `available`, sinon aperçu `unknown`. Jamais `session.create`.
- Actions sensibles : dialogue « simulation — aucun effet ».
- Spinner si execution/autorité prouve un travail ; point bleu si attention
  `available` non vide. Statut = libellé, pas couleur seule.
- 1440×900 rail ~240 / panneau ~380 ; 1024×768 rail ~64 / panneau drawer.

## Blocs

### B1 — HttpApi lecture + generate

Fichiers :

- `packages/opencode/src/server/routes/instance/httpapi/groups/global.ts`
- `packages/opencode/src/server/routes/instance/httpapi/handlers/global.ts`
- `packages/opencode/src/server/routes/instance/httpapi/server.ts`
- `packages/opencode/test/server/httpapi-global.test.ts` (étendre) **ou**
  `packages/opencode/test/server/httpapi-sprint-projections.test.ts`
- Générés : `packages/client` (`bun run generate`) puis SDK JS
  (`./packages/sdk/js/script/build.ts`). Pas d’édition manuelle `src/generated`.

Handlers : `yield*` services Core `TaskOwnership` / `RepositoryTopology`,
`read` seulement. Brancher `TaskOwnership.node` et `RepositoryTopology.node`
dans le groupe HttpApi (absents aujourd’hui ; `TaskMetrics.node` déjà là).

Tests live : payload A/B ; identité absente → faits `absent`/`unknown` pas
`0` ; `mergeTarget` vide → faits `invalid` ; payload invalide → 4xx ; zéro
écriture binding/execution/git.

Checks : `bun typecheck` dans `packages/opencode` ; tests HTTP ciblés ;
`git diff --check` sur le pathset B1.

### B2 — Page réelle + mapper fail-closed

Checkout `9de3b2e1c` :

- `packages/app/src/pages/sprint-cockpit-prototype.tsx`
- `packages/app/src/pages/sprint-cockpit-prototype-state.ts`
- `packages/app/src/pages/sprint-cockpit-prototype-fixtures.ts`
- `packages/app/src/pages/sprint-cockpit-prototype.test.ts`
- `packages/app/e2e/sprint-cockpit-prototype.spec.ts` (adapter ou retirer)
- clés i18n de ce commit dans `packages/app/src/i18n/en.ts`

Renommer vers `sprint-cockpit*` (plus `prototype`). Extraire layout/état.
Document d’entrée `sprint-cockpit-input.ts` : deux identités A/B + repos
(`root`, `sourceRefs[]`, `mergeTarget` **jamais** inféré). Fixtures maquette
servent de **fallback UI** seulement si les POST échouent, avec état
`unknown`/`inaccessible` visible — pas comme faits vrais.

Mapper : `available` → valeur ; autre `State` → libellé + provenance.
Indicateurs Analyze. Onglets canvas inertes. Dialogue simulation.

`app.tsx` : route `/sprint/cockpit` **hors** isolation `entry.tsx`.

Tests App : A/B distincts ; fail-closed ; callbacks mutatifs absents ;
deep-link seulement si `sessionID` `available`.

Check : `bun typecheck` + tests ciblés dans `packages/app`.

### B3 — Consommation SDK + i18n

Fichiers App de B2 + appels SDK `global.ownership` / `global.topology` /
`global.metrics` (types générés). Séquence : ownership → topology (snapshot
rendu) → metrics `type: "sprint"` avec `taskIDs` A/B.

Ne pas importer Core/Server depuis App. i18n : pas de chaînes anglaises
en dur. Ne pas modifier les clés i18n **existantes** hors ajout cockpit.

Checks : `bun typecheck` App + opencode ; tests B1+B2 encore verts ;
`git diff --check`.

## Pathset

- `packages/opencode/src/server/routes/instance/httpapi/groups/global.ts`
- `packages/opencode/src/server/routes/instance/httpapi/handlers/global.ts`
- `packages/opencode/src/server/routes/instance/httpapi/server.ts`
- `packages/opencode/test/server/httpapi-global.test.ts` et/ou
  `packages/opencode/test/server/httpapi-sprint-projections.test.ts`
- `packages/client/src/generated*` (généré)
- `packages/sdk/js/**` (généré)
- `packages/app/src/pages/sprint-cockpit*`
- `packages/app/src/app.tsx`
- `packages/app/src/i18n/en.ts`
- `packages/app/src/pages/sprint-cockpit*.test.ts`
- `packages/app/e2e/sprint-cockpit*.spec.ts` (si conservé)

Hors pathset : Schema/Core projections (stables), `entry.tsx` prototype,
staging, worktrees métier, mutations MT/git/`TaskExecution.resume`.

## Checks globaux (Verify)

- `bun typecheck` : `packages/opencode`, `packages/app` (et `packages/client`
  si generate a tourné)
- Tests HTTP projections + App mapper
- `git diff --check`
- Smoke 1440×900 et 1024×768 (Chrome système) : A/B lisibles, fail-closed,
  actions inertes

## Hors plan

Parallélisme, file HTTP dédiée, prune, merge Git, DA40-015 recette parent.
