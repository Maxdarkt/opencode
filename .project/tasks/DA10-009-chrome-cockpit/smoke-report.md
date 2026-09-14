# Smoke — DA10-009

- Status: PASS
- Viewport: 1440
- Maquette: `http://127.0.0.1:8765/cockpit.html`
- Session live App : pas de listener (`make dev` = DA40-019, hors pathset)

## Recette 1440 (maquette)

- `innerWidth` 1440
- Rail **244px**
- Chat + tray présents
- Secondaire `display: none`
- Split : **2 panes**
- ☰ float **320px** ouvert (Tâche · Git · Coût · Serveurs · Permissions)

## Chrome App (tests)

Layout 1440 : rail 244, chat restant, tray, pas de secondaire.
Split : 2 PTY ou pane `unknown` (pas de faux shell).
Inspecteur : Git/Tâche `unknown` honnête, merge `simulated`, coût ≠ `$0`.

Pas de faux HEAD / faux `$0` dans le pathset App.
