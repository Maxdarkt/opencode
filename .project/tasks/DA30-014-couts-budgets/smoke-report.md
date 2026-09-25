# Smoke — DA30-014

Profil `web`. Pression GREEN (0 autre runtime ≥ api). Pas de migration,
pas de function Edge.

## Wake

Vite de ce worktree, `--host 0.0.0.0 --port 4400` (`UI_PORT` du
`.make.env`, fichier non modifié). PID shell `81127`.

## Navigateur Cursor

URL `http://<tailscale>:4400/sprint/cockpit`. Titre OpenCode. Le budget
affiché est `unknown (metrics) · unknown`. Ni `0` ni `$0.00`. Les faits
HTTP sont `inaccessible` : le backend n’était pas dans le profil `web`.

## Sleep

Dry-run `make dev-stop` : OWNED `81127`. `APPLY=1` : SIGTERM, kill count 1.
Port `4400` libre ensuite. `runtime_profile: none`.
