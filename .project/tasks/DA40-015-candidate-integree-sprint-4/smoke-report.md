# Smoke — DA40-015

- Status: PASS
- URL: `http://127.0.0.1:4415/sprint/cockpit`
- Ports: `WORKTREE_CODE=15` → backend `4115`, UI `4415`

## 1440×900

- A et B lisibles (`DA40-015-A`, `DA40-015-B`)
- A par défaut puis sélection B (`DA40-015-B` dans le contexte vérifiable) puis reprise A (pas de fuite d’identité)
- Faits fail-closed UI : `absent (runtime_snapshot)` / `absent (task_binding)` / `unknown (session)` / `unknown (metrics)` — pas de zéro inventé
- Commit → « will not run » / « Simulation — no effect » → Acknowledge

Preuves : `evidence/da40-015-1440-A.png`, `evidence/da40-015-1440-A-resume.png`, `evidence/da40-015-1440-commit-sim.png`

## 1024×768

- Rail compact (`absent` tronqué), A/B toujours adressables
- Passage B + dialogue simulation inerte

Preuve : `evidence/da40-015-1024-B-sim.png`

## HTTP fail-closed

Rejoué en B2 (`httpapi-global` : `mergeTarget` vide → `invalid` ; payload `repositories: []` → 400). POST live custom contre `4115` non relancé (sonde large bloquée). UI n’invente pas de chiffres.

## Lecture seule

Git worktree : overlay App + dossier APEX seulement. `.make.env` ignoré. Process `make dev` à arrêter après smoke.
