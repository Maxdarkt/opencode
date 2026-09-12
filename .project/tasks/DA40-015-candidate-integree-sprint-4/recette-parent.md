# Recette parent — DA40-015

Candidate HEAD `5d18386f1`. Lecture seule. Pas de push/merge/MT `done`. Identités recette hors MT : `DA40-015-A` / `DA40-015-B`.

## Environnement

Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA40-015-candidate-integree`

`.make.env` local ignoré (jamais commité) :

```
WORKTREE_CODE=15
BACKEND_PORT=4115
UI_PORT=4415
HOST=127.0.0.1
```

```bash
make config-check
make preflight-ports
make dev
```

URL : `http://127.0.0.1:4415/sprint/cockpit`  
Navigateur : Chrome Cursor. Viewports : `1440×900` puis `1024×768`.

## Séquence (chaque viewport)

1. **A active** — `DA40-015-A` sélectionné par défaut. Worktree DA40-015, branche `task/DA40-015-candidate-integree`, HEAD `5d18386f1`.
2. **Passage B** — sélectionner `DA40-015-B`. Chemins `fixtures/checkout-b`, branche `task/DA40-015-B`, HEAD `8cda39f46` ≠ A.
3. **Reprise A** — resélectionner A. Pas de fuite d’identité A→B (libellés A et B distincts).
4. **Refus fail-closed** (HTTP `4115`, zéro écriture Git/MT) :
   - `POST /global/topology` avec `mergeTarget: ""` → fait `invalid`, pas de chiffre inventé.
   - payload topologie invalide (`repositories: []`) → 400.
   - identité/token A présenté pour B → faits `invalid` / `absent` / `unknown`, pas `0` inventé.
5. **Lecture seule** — bouton Commit → dialogue « will not run » → Acknowledge simulation. `git status` worktree A inchangé hors overlay déjà présent. Arrêt des seuls process `make dev`.

## Preuves

Snapshots APEX `evidence/` + notes dans `smoke-report.md`.
