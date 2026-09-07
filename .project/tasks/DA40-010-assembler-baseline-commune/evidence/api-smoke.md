# Preuve API réelle — 2026-09-07

- `GET /global/health` : `{"healthy":true,"version":"local"}`.
- `GET /global/context?directory=<50-integration>&base_ref=HEAD` : availability available, canonical identique, branche `baseline-integration`, HEAD/base `702bf7dcd7468638c17fd95b110deb38bd253e9a`, dirty true, conflicts false, review changed.
- Dossier temporaire existant hors Git : availability available, status `non_git`, review incomplete.
- Enfant absent de cette fixture : availability absent, canonical null, git null.
- `GET http://127.0.0.1:4450/` : HTML OpenCode servi par Vite.
- Listeners pendant smoke : PID enfants 55346 (API) et 55347 (UI) ; après arrêt, aucun listener 4150/4450.
