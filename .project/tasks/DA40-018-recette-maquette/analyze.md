# Analyze — DA40-018 — Recette 0.3 : maquette visuelle 1440 / 1024

## Git, MT, autorité

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA40-018`
- Branche : `recette-maquette` @ `fecaf044c` (HEAD DA10-010 Verify ; produit `4f39692c8`)
- Arbre propre. Aucun `.make.env` (local ignoré si Smoke)
- APEX canonique : `/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/tasks/DA40-018-recette-maquette`
- Copie worktree : `.project/tasks/DA40-018-recette-maquette`
- MT `DA40-018` : `in_progress` (Sprint 6)
- Dépend de DA10-009 (`f6f54383c`) et DA10-010 (`4f39692c8`) — Verify verts. Bloque le close 0.3.
- Aucun Build produit sur `staging`. Thème DA40 ≠ worktree `features/40-tooling`. `make dev` preview = DA40-019.

## Objectif

Recette **visuelle** vs maquette figée (`docs/product/maquette.md` + `maquette/cockpit.html`) aux largeurs **1440×900** et **1024×768**. Livrable = **écarts listés ou nuls**. Isolation A/B Sprint 4 **inchangée**.

Acceptation (scope) :

1. Grille maquette rejouée aux deux largeurs
2. Écarts consignés (ou « nuls »)
3. Isolation A/B encore verte (fixtures non réécrites)

## Surfaces déjà livrées (ce HEAD) — ne pas reconstruire

| Preuve 0.3 | Où | Limite recette |
| --- | --- | --- |
| Chrome rail / chat / tray / ☰ | DA10-009 — session v2 `/{b64}/session/{id}` | Smoke 009 = maquette HTML + tests ; session live App souvent absente |
| Secondaire split / Files / Diff / Browser stub | DA10-010 — bandeau ☰+split, slot v2 | Smoke 010 = home 3010 sans session ; contrat = tests |
| Layout 1440 rail 244, 1024 rail 64 | `sessionWorkbenchLayout` | Unitaire, pas une capture navigateur |
| Isolation A/B | `/sprint/cockpit` + `sprint-cockpit.test.ts` + HTTP A/B + e2e 1440/1024 | **Dashboard données**, pas le chrome agentique |
| Maquette HTML | `docs/product/maquette/cockpit.html` | Fixtures simulées (`$12.40`, HEAD inventé) — **pas** le contrat App |

## Grille maquette.md (référentiel)

1. 1440×900 : chat plein ; split ouvre secondaire (défaut Files : éditeur + explorer **droite**)
2. `+` : onglet Browser / Git Diff / Files ; poignée chat ↔ secondaire
3. ☰ inspecteur flottant ; terminal bas
4. 1024×768 : rail compact 64px ; secondaire encore adressable
5. Isolation maquette HTML : zéro requête hors origine (déjà le format DA10-006)

## Écarts **attendus** (hors trou 0.3 — à noter, pas à « corriger » ici)

| Écart vs HTML | Décision déjà figée |
| --- | --- |
| ☰ + split dans le **bandeau agent**, pas le header top | DA10-010 |
| Inspecteur : onglet **Contexte** en plus | DA10-009 |
| Browser = `about:blank`, pas d’iframe `make dev` | DA40-019 |
| App honnête (`unknown`, pas `$12.40` / HEAD maquette) | DA10-008 / 009 |
| `/sprint/cockpit` inchangé | launch + recette A/B, pas le workbench |

Un écart **0.3** = la grille ci-dessus manque sur la vue session (rail, tray, split, Files à droite, menu `+`, 1024 adressable) alors que 009/010 l’avaient promis.

## Décisions proposées (à valider pour Plan)

1. **Nature.** Recette + preuves APEX, pas un rewrite chrome. Produit **seulement** si un trou de la grille 0.3 est **démontré** (alors C1 borné App, pas DA40-019).
2. **Référentiel.** Maquette servie (`python3 -m http.server` sur `docs/product/maquette`), pas le fichier dans l’éditeur. Viewports **1440×900** puis **1024×768**. Comparer **structure** (rail, chat, tray, secondaire, ☰), pas les fixtures simulées du HTML.
3. **Surface App.** Vue session v2 uniquement pour le chrome 0.3. Si aucune session liée (comme DA10-010) : le dire dans `smoke-report.md` ; le contrat UI = tests 009/010 rejoués + captures maquette. Ne pas inventer un projet / session.
4. **Liste d’écarts.** Un fichier `ecarts.md` (1440 et 1024) : attendus (tableau ci-dessus) vs 0.3 (nuls ou nommés). Succès = liste complète, pas « zéro pixel près de Figma ».
5. **Isolation A/B.** Rejouer `sprint-cockpit.test.ts` (+ HTTP A/B déjà là). E2E Playwright seulement si Chromium **déjà** installé ; sinon limite notée, pas de téléchargement. **Ne pas** réécrire fixtures `DA40-015-A/B`.
6. **Smoke.** Alerte courte. Maquette 8766 aux deux largeurs (étapes 1–4). App ports **18** (`.make.env` local `WORKTREE_CODE=18` → 4118/4418) si `make config-check`. Isolation HTML = pas de fetch hors origine sur la maquette.
7. **Honnêteté.** Pas de faux HEAD / `$0` / preview live. `bun.lock` = blob du SHA. Zéro écriture recette dans `staging` hors APEX canonique.

## Hors périmètre (confirmé)

`make dev` réel / iframe preview (DA40-019). `$` DA30-014. Conducteur DA10-011. Merge / push / rebase. `TaskExecution.resume`. Rewrite `/sprint/cockpit`. Chrome 009/010 sauf C1 trou démontré. Build produit sur `staging`.

## Pathset probable

- APEX : `analyze.md`, `plan.md`, `ecarts.md`, `blocs/`, `smoke-report.md`, `verify.md`, `evidence/`
- `.make.env` local (gitignored) si Smoke App
- Tests existants rejoués (app layout / secondary / sprint-cockpit) — **pas** de duplication
- C1 App **seulement** si trou 0.3 démontré

## Risques

- Session live absente → recette chrome App incomplète visuellement ; ne pas masquer ça
- Playwright / Chromium peut manquer (déjà vu Sprint 4)
- Confondre fixtures maquette (`$12.40`) avec un écart App
- Isolation A/B ≠ isolation HTML maquette : deux preuves distinctes

## Décisions ouvertes

Aucune métier. À valider : les 7 décisions ci-dessus.
