# Analyze — DA40-019 — Start/stop make dev et preview du worktree

## Git, MT, autorité

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA40-019`
- Branche : `preview-make-dev` @ `03f621743` (staging Sprint 6 ; pas de Build produit ici)
- APEX : `.project/tasks/DA40-019-preview-make-dev`
- MT `DA40-019` : `in_progress` (Sprint 7 — `da-release-0.1-sprint-7`)
- Thème DA40 ≠ checkout `features/40-tooling`. Aucun code produit sur `staging`.
- Dépend de DA10-010 (Browser stub) et DA40-006 (façade Make / `.make.env`) — faits.
- Bloque le preview live 0.4. Ne bloque pas le conducteur (DA10-011) ni le merge (DA20-006).

## Objectif

W5 : **Démarrer / Arrêter** `make dev` du **cet** arbre (cwd = worktree de la session / `Location.directory`), ports lus dans **son** `.make.env`, preview dans le Browser du secondaire.

Acceptation (scope) : start/stop borné à l’arbre. Pas les ports d’un autre worktree.

## Surfaces observées (ce HEAD)

| Surface | État | Écart DA40-019 |
| --- | --- | --- |
| Maquette `cockpit.html` inspecteur Serveurs | `make dev` OFF/ON · ports `4117/4417` ; bouton Démarrer/Arrêter ; CPU/RAM maquette | Onglet Serveurs = `"unknown"` (`packInspectorUnknownBody`) |
| Maquette Browser | OFF → `about:blank` + hint ; ON → `http://127.0.0.1:4417/sprint/cockpit` + iframe simulée | Stub : URL `about:blank`, `iframe: false`, `+ onglet` toast |
| Conception P5 | Lire `.make.env` ; start/stop **ce** arbre ; navigateur UI ; ne pas tuer un autre worktree | Rien de câblé |
| `Makefile` (DA40-006) | `make dev` coordonne backend+UI ; `config-check` + `PORT_PRECHECK` ; ROOT = arbre du Makefile | Façade OK ; pas d’API produit |
| `.make.env` | Exemple versionné `40/4140/4440` ; fichier local gitignoré | Absent ici ; ne jamais le committer ni en inventer un code |
| PTY public | `pty.create` accepte `command`/`args`/`cwd` ; location-scoped ; tray terminal humain | Pas un bouton Start/Stop isolé ; mélange shell |
| `file.read` | Contenu du worktree session | Peut lire `.make.env` s’il existe ; l’App ne doit pas *choisir* les ports |
| Inspecteur Permissions | `"unknown"` | Hors scope |
| CPU/RAM | Maquette affiche `12% · 410 Mo` | **DA40-020 / E4** — pas de faux chiffres ici |

## Décisions proposées (à valider pour Plan)

1. **Où.** Vue session layout v2 (`/{b64}/session/{id}`). Inspecteur onglet **Serveurs** + panneau secondaire **Browser**. Pas de rewrite `/sprint/cockpit`. Pas de 3ᵉ peau.

2. **Ports.** Source unique = `.make.env` de `Location.directory` (arbre de **cette** session). Parser `WORKTREE_CODE`, `BACKEND_PORT`, `UI_PORT`, `HOST` (défaut `127.0.0.1`). Jamais déduire un code depuis `DA40-019`, le chemin, ou un autre arbre. Fichier manquant / invalide / couple hors formule `4100+code` / `4400+code` → état `unknown`, Start inactif, message observé (échec Make), pas de guess.

3. **Start / Stop.** HttpApi location-scopé (Schema + Protocol + Server), pas un dump dans le PTY du tray. Start = `make -C <directory> dev` en groupe de process **de cet arbre**. Stop = tuer **seulement** ce groupe. Ports déjà occupés par un process que **nous n’avons pas** lancé → Start échoue (preflight Make), Stop = no-op. Ne jamais `kill` un listener d’un autre worktree. Collision avec l’instance App courante (mêmes ports) = échec honnête, pas un suicide du serveur.

4. **État inspecteur.** `OFF` / `ON` / `unknown` à partir du process possédé + ports **lus**. Afficher les ports observés (`backend` / `ui`). CPU/RAM : `—` si OFF, `unknown` si ON (DA40-020 remplira). Pas de `12%` inventé.

5. **Browser.** OFF / unknown → `about:blank`, pas d’iframe, hint inchangé. ON → barre URL = origine observée `http://HOST:UI_PORT/sprint/cockpit` (maquette / P5) + **iframe réelle**. `+ onglet` reste simulation (toast) : W5 = une preview, pas un navigateur multi-onglets.

6. **Honnêteté / frontières.** App n’importe jamais Core. `bun run generate` après HttpApi. Aucun HEAD, port ou preview inventé. `.make.env` local gitignoré, jamais au commit.

7. **Tests / smoke.** Unitaire : parse env (sans secret) ; Start scoped au directory ; refus d’un autre couple de ports ; Browser iframe seulement si ON. Typecheck `packages/app` + packages HttpApi touchés. Smoke : `.make.env` local `WORKTREE_CODE=19` → `4119`/`4419` (ignoré) ; Start → iframe ; Stop → `about:blank` ; `make preflight-ports` vert après Stop. Alerte courte avant le browser.

## Hors périmètre (confirmé)

Merge / candidate / retrait d’arbres (DA20-006). Conducteur (DA10-011). CPU/RAM réel (DA40-020). Permissions inspecteur. Multi-onglets Browser. `TaskExecution.resume`. Push / merge / rebase / staging. Worktrees métier `features/10-…`.

## Pathset probable

- Schema + Protocol + Server : status/start/stop `make dev` location-scopé
- `packages/client` generate (pas d’édition manuelle `src/generated`)
- App : inspecteur Serveurs, `secondaryBrowserView(state)`, i18n `en.ts` (+ locales typées)
- Tests App + HTTP ; APEX `blocs/` + smoke/verify
- Hors pathset : Core orchestration Session/V2 ; Makefile (déjà DA40-006) sauf constat ; `.make.env` commité ; `/sprint/cockpit` dashboard

## Risques

- Start `make dev` dans **cet** arbre alors que l’App smoke tourne déjà sur 4119/4419 → preflight rouge ; Smoke devra Start sur un arbre **dont les ports sont libres**, ou séparer `dev-server` déjà up vs preview (échec honnête documenté).
- Iframe vers une autre origine (`127.0.0.1:UI_PORT`) : cookies / `X-Frame-Options` Vite à vérifier ; si bloqué → URL visible + état ON, pas une fausse page.
- Ne pas réutiliser un PTY humain du tray comme « le » make dev.
- i18n : nouvelles clés dans `en.ts` et fichiers de locale (typecheck).

## Décisions ouvertes

Aucune métier. À valider : les 7 décisions ci-dessus (surtout 3 = HttpApi dédié vs PTY, et 5 = chemin `/sprint/cockpit`).
