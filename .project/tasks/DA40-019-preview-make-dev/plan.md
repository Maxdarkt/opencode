# Plan — DA40-019 — Start/stop make dev et preview du worktree

Analyze accepté (7 décisions). Worktree `features/tasks/DA40-019`,
branche `preview-make-dev`, HEAD `03f621743`. Vue session layout v2
seulement. Pas de staging, cockpit rewrite, PTY, CPU/RAM réel,
push/merge.

## Décisions

1. Vue `/{b64}/session/{id}`. Inspecteur **Serveurs** + secondaire
   **Browser**. Pas de rewrite `/sprint/cockpit`. Pas de 3ᵉ peau.
2. Ports = `.make.env` de `Location.directory` (cette session). Parser
   `WORKTREE_CODE`, `BACKEND_PORT`, `UI_PORT`, `HOST` (défaut
   `127.0.0.1`). Formule `4100+code` / `4400+code`. Jamais déduire un
   code depuis `DA40-019`, le chemin, ou un autre arbre. Manquant /
   invalide → `unknown`, Start inactif, message observé.
3. HttpApi location-scopé, **pas** le PTY du tray. Start =
   `make -C <directory> dev` en groupe de process **de cet arbre**.
   Stop = tuer **seulement** ce groupe. Ports occupés par un process
   non possédé → Start échoue (preflight Make), Stop = no-op. Collision
   avec l’instance App courante = échec honnête.
4. Inspecteur : `OFF` / `ON` / `unknown` + ports lus. CPU/RAM : `—` si
   OFF, `unknown` si ON (DA40-020). Pas de `12%` inventé.
5. Browser : OFF / unknown → `about:blank`, pas d’iframe. ON →
   `http://HOST:UI_PORT/sprint/cockpit` + iframe réelle. `+ onglet` =
   toast (inchangé).
6. App n’importe jamais Core. `bun run generate` après HttpApi.
   `.make.env` local gitignoré, jamais au commit.
7. Tests parse + start scoped + refus autre couple + iframe seulement
   si ON. Smoke Start sur un **autre** directory que ROOT App (ports
   libres). Typecheck packages touchés.

## B1 — Schema, Core MakeDev, HttpApi

- `packages/schema/src/make-dev.ts` + export `index.ts` : `Status`
  (`off` | `on` | `unknown`), `host`, `backendPort`, `uiPort`,
  `worktreeCode`, `error` optionnel. Pas d’événements bus.
- `packages/core/src/make-dev.ts` (+ parse helper + test) :
  `makeLocationNode`. Lire `.make.env` de `Location.directory` seulement.
  `status` / `start` / `stop`. Spawn `make -C <directory> dev` en
  process group ; Stop = `kill` de **ce** groupe. Temp dir : Makefile
  stub, pas le vrai Vite. Refus d’arrêter un listener d’un autre
  directory. Enregistrer `MakeDev.node` dans
  `packages/core/src/location-services.ts`.
- `packages/protocol/src/groups/make-dev.ts` + `api.ts` :
  `GET /api/make-dev`, `POST /api/make-dev/start`,
  `POST /api/make-dev/stop` + `LocationQuery`.
- `packages/server/src/handlers/make-dev.ts` + `handlers.ts` : thin
  `response(...)`.
- `packages/client` : `bun run generate` (pas d’édition `src/generated`).
- `packages/opencode/test/server/httpapi-exercise/index.ts` : 3 routes.

Tests : parse sans secret ; env invalide → `unknown` ; start scoped au
directory ; ports d’un autre couple → Start échoue, Stop no-op.
Typecheck schema / core / protocol. Tests depuis les packages, pas la
racine.

## B2 — Inspecteur Serveurs

- `packages/app/src/components/session/session-pack-inspector.tsx` :
  onglet Serveurs (plus `packInspectorUnknownBody`). État + ports +
  Démarrer/Arrêter. Start inactif si `unknown`. `data-slot` /
  `data-testid="inspector-servers"`.
- Location = `{ directory: sdk.directory }`. Un GET partagé session
  (inspecteur + B3). CPU/RAM dérivé : OFF → `—`, ON → `unknown`.
- i18n `session.inspector.servers.*` dans `en.ts` **et** locales
  (parity typecheck). `fr.ts` OK.

Tests inspecteur : OFF / ON / unknown ; Start inactif unknown.
Typecheck app.

## B3 — Browser iframe

- `packages/app/src/pages/session/session-secondary.ts` (+ test) :
  `secondaryBrowserView(status)` — OFF/unknown → `about:blank`,
  `iframe: false` ; ON → URL observée + `iframe: true`.
- `session-secondary-panel.tsx` : iframe seulement si `iframe`. Hint
  inchangé si pas ON. `+ onglet` toast. Si iframe bloquée (origine) :
  URL + ON visibles, pas de fausse page.

Tests : iframe seulement ON. Typecheck app. `git diff --check`.

## Pathset

Schema `make-dev` ; Core `make-dev` + `location-services.ts` ; Protocol
group + `api.ts` ; Server handler + `handlers.ts` ; client generate ;
httpapi-exercise ; App inspecteur, `session-secondary.ts` + panel +
tests ; `en.ts` + locales.

Hors pathset : Makefile (déjà DA40-006) ; `.make.env` commité ; Core
Session/V2 ; PTY tray ; CPU/RAM (DA40-020) ; Permissions ; multi-onglets
Browser ; `/sprint/cockpit` dashboard ; merge ; conducteur ; staging.

## Verify / Smoke

Typecheck schema / core / protocol / app. Tests B1–B3. `git diff --check`.

Smoke (alerte courte puis browser, même tour) :

1. App de **cet** arbre : `.make.env` local ignoré `WORKTREE_CODE=19`
   → `4119`/`4419`. Ne pas tuer ces listeners.
2. Session liée à un **autre** directory (fixture ignorée, code `91` →
   `4191`/`4491`, Makefile stub ou `make dev` réel si ports libres).
   Start → inspecteur ON + iframe `http://HOST:UI_PORT/sprint/cockpit`.
   Stop → `about:blank` ; `make preflight-ports` vert **sur 91**.
3. Start sur l’arbre App (19) alors que l’UI tourne déjà = échec
   honnête, pas un suicide.

Après « Lance le build » : B1→B3 puis Smoke puis Verify. Commit local
après Verify vert seulement. Pas de push/merge.
