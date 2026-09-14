# Écarts — DA40-018 — Recette 0.3 (1440 / 1024)

Référentiel : maquette servie (`127.0.0.1:8766/cockpit.html`), structure
chrome, **pas** les fixtures HTML (`$12.40`, HEAD inventé).
Contrat App 0.3 = tests B1 (layout / secondaire / inspecteur). Vue session
live **non inventée** (même limite que DA10-010).

## Attendus (hors trou 0.3) — 1440 et 1024

| Écart vs HTML | Où | 1440 | 1024 |
| --- | --- | --- | --- |
| ☰ + split dans le **bandeau agent**, pas le header top | DA10-010 | attendu | attendu |
| Inspecteur App : onglet **Contexte** en plus | DA10-009 | attendu | attendu |
| Browser = `about:blank`, pas d’iframe `make dev` | DA40-019 | attendu | attendu |
| App honnête (`unknown`, jamais `$12.40` / HEAD maquette) | DA10-008 / 009 | attendu | attendu |
| `/sprint/cockpit` inchangé (données Sprint 4, pas le workbench) | launch + recette A/B | attendu | attendu |

## Grille 0.3 (vue session) — nuls

Un trou 0.3 = la grille manque alors que 009/010 l’avaient promise.

| Surface | 1440 | 1024 | Preuve |
| --- | --- | --- | --- |
| Rail | 244, chat plein | 64 compact | `sessionWorkbenchLayout` + maquette CDP |
| Tray terminal | présent | présent | B1 + B2 |
| Split / secondaire | fermé défaut ; open → Files | icône adressable | B1 + B2 |
| Files arbre **droite** | oui | oui (modèle) | `session-secondary.test.ts` + maquette |
| Menu `+` Browser / Git Diff / Files | oui | oui | B1 + B2 |
| Poignée chat ↔ secondaire | clamp ≥ 280 | idem | B1 ; maquette `#split` |
| Browser stub `about:blank` sans iframe | oui | oui | B1 + B2 |
| ☰ inspecteur | bandeau agent | bandeau agent | B1 `pack-inspector` + B2 |

**0.3 = nuls** aux deux largeurs. Pas de C1.

## Isolation A/B

`sprint-cockpit.test.ts` : 8 pass. Fixtures `DA40-015-A/B` **non** réécrites.
E2E `e2e/sprint-cockpit.spec.ts` : **non joué** — Chromium Playwright absent
(`~/Library/Caches/ms-playwright` vide). Pas de téléchargement.

## Limite visuelle App

Pas de session liée ouverte ici. Chrome session live = Smoke / `smoke-report.md`.
Ne pas confondre dashboard `/sprint/cockpit` avec le chrome 0.3.
