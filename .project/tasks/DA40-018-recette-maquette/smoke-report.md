# Smoke — DA40-018

- Status: PASS (maquette) ; App session live = limite
- Maquette: `http://127.0.0.1:8766/cockpit.html`
- App ports: `WORKTREE_CODE=18` → `4118` / `4418` (`make config-check` PASS, `.make.env` ignoré)
- Session liée: **absente** — pas inventée ; chrome 0.3 App = tests B1

## Maquette 1440×900

Rail 244, chat plein, tray. Split → Files (arbre à droite), menu `+`
Browser / Git Diff / Files, poignée, ☰ inspecteur flottant.

## Maquette 1024×768

Rail 64, split encore visible, secondaire ouvert, `+` et tray présents.

## Isolation HTML

Access log : seulement `GET /cockpit.html` (200). Pas de fetch hors origine.

## App

`make config-check` / `context` / `ports` verts. `make dev` non lancé : aucune
session liée à montrer. Pas de faux HEAD / `$0` / preview live.

## A/B

Unitaires verts (B3). E2E Playwright non joué (Chromium absent).
