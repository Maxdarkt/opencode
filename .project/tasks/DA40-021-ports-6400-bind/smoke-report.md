# Smoke — DA40-021

Profil `web-api`. Pression GREEN avant réveil (`runtimes_ge_api` 0). `UI_PORT=6400`, dans `6400–6499`.

## Réveil

- `make dev` : Vite `0.0.0.0:6400`, Bun `0.0.0.0:6402`.
- PID OWNED : bun `28282`, node `28283`, bash `28270`, make `28264`. Cwd dans ce worktree.
- `GET http://100.112.223.7:6402/global/health` → `{"healthy":true,"version":"local"}`.
- `GET http://100.112.223.7:6400/sprint/cockpit` → HTTP 200, titre `OpenCode`, script Vite.

## Panneau Cursor

URL `http://100.112.223.7:6400/sprint/cockpit`. `browser_navigate` seul, onglet nouveau, position active. Pas de `browser_tabs`.

La page affiche Sprint cockpit (tâches DA40-015, onglets Chat / Terminal / Git / Diff / Browser). Clic Terminal : onglet sélectionné. Les faits « inaccessible (http) » sont l’état lecture seule du cockpit, pas un refus d’écoute.

## Sommeil

Dry-run `make dev-stop` : would SIGTERM des quatre PID, kill count 0. Puis `APPLY=1` : kill count 4. Ports `6400` et `6402` libres. `runtime_profile: none`.
