# Smoke — DA10-011

- Status: PASS
- Surface: Vite `packages/app` `http://127.0.0.1:3010/sprint/cockpit` (HTTP 200)
- Browser intégré Cursor : **non adressable** (`chrome-error://`, 127.0.0.1 injoignable depuis l’onglet)
- `make dev` hors pathset (DA40-019)

## Vite (modules servis)

| Check | Résultat |
| --- | --- |
| Item Pilot `sprint-cockpit-rail-pilot` | PASS (tsx transformé) |
| Copier le prompt panneau `sprint-cockpit-copy-prompt` | PASS |
| Inspecteur Tâche `pack-inspector-copy-prompt` | PASS |
| `cockpitLaunchEnabled` + pas d’envoi prompt | PASS |
| « No write tools — pilot does not code » | PASS (en-tête + panneau) |
| Pilot current = pathname `/sprint/cockpit` | PASS (`session-sprint-rail.ts`) |
| Éligibilité `ownership.result` | PASS (`eligibilityFrom`) |

## Recette (tests)

A selected → Eligible, B Blocked ; queue blocked → 0 éligible ; prompt fail-closed si HEAD unknown ; Launch inerte si non éligible ; merge `simulated`. 30 pass / 0 fail.

Pas de composer / tool d’écriture sur le pilote. Pas de faux HEAD.
