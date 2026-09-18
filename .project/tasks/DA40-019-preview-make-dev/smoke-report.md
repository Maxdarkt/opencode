# Smoke — DA40-019

- Status: PASS (API start/stop + preview Mini ; session UI inspecteur = limite)
- App Mini: `http://192.168.1.97:4419/` (pas `127.0.0.1` MacBook)
- Backend Mini: `http://192.168.1.97:4119`
- `.make.env` local ignoré `WORKTREE_CODE=19` `HOST=192.168.1.97` → `4119`/`4419`
- Fixture `/tmp/da40-019-fixture-91` code `91` → `4191`/`4491` (non versionnée)

## URL MacBook → Mini

Cursor UI / browser = MacBook. Shell et `make dev` = Mini `Mac-001.lan` `192.168.1.97`.
Vite/backend bindés sur `192.168.1.97` (pas `127.0.0.1`). Home OpenCode chargé depuis le LAN Mini.

## Home App

Accueil visible. « Ajouter un projet » disabled. « Nouvelle session » ne navigue pas.
Inspecteur Serveurs / iframe Browser **non cliquables** sans session liée (même limite DA10-010).

## HTTP make-dev (preuve W5)

| Check | Résultat |
| --- | --- |
| GET cet arbre (19) | `off` ports `4119/4419` `HOST=192.168.1.97` |
| POST start cet arbre alors que l’App écoute déjà | `off` + `error` ; listeners **19 encore là** (pas de suicide) |
| POST start fixture 91 | `on` `4191/4491` |
| `GET http://192.168.1.97:4491/sprint/cockpit` | 200 `preview-91` |
| POST stop fixture 91 | `off` ; `4191`/`4491` libres |
| Listeners App 19 après Stop 91 | encore `4119`/`4419` |

## Recette (tests)

Start scoped, Stop no-op ailleurs, ports occupés → off, iframe seulement si ON, typecheck app/schema/core/protocol/server.

`.make.env` non commité.
