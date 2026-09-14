# Verify — DA10-008 — Bandeau agent et inspecteur de pack

B1–B3 et Smoke passent. Session liée : Idle, inspecteur Contexte/Coût,
Interrupt absent à Idle, métriques `unknown` (jamais `$0.00`).

## Checks

- typecheck schema / core / protocol / app : PASS
- tests pack (core + HTTP) + bandeau + inspecteur : PASS
- `git diff --check` : PASS
- smoke session liée : PASS (`smoke-report.md`)

SHA `9bcddb2c0` sur `pack-inspector`. MT : passer done (sprint).
Pas de push/merge.
