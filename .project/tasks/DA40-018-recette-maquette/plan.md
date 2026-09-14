# Plan — DA40-018 — Recette 0.3 : maquette visuelle 1440 / 1024

## Mandat

Analyze validé (7 décisions). Recette **visuelle** vs maquette figée, HEAD
`fecaf044c` (`recette-maquette`). Livrable = **écarts listés ou nuls**.
Isolation A/B Sprint 4 **inchangée**. Pas de rewrite chrome 009/010.
Produit **seulement** si un trou de la grille 0.3 est **démontré** (alors
C1 borné App, pas DA40-019).

Worktree `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA40-018`.
Pas de code produit sur `staging`. Pas de `bun install` (`bun.lock` = blob
du SHA). Pas de push / merge / rebase / `TaskExecution.resume`. MT reste
`in_progress`.

Succès = 3 acceptations du scope, `ecarts.md` complet, checks verts,
smoke noté, Verify + commit local du pathset.

## Décisions figées

1. **Nature.** Recette + preuves APEX. Surfaces 009/010 inchangées sauf
   trou **démontré** (rail, tray, split, Files à droite, menu `+`, 1024
   adressable).
2. **Référentiel.** Maquette **servie** (`python3 -m http.server 8766
   --bind 127.0.0.1 --directory docs/product/maquette`), pas le fichier
   dans l’éditeur. Viewports **1440×900** puis **1024×768**. Comparer la
   **structure** (rail, chat, tray, secondaire, ☰), pas les fixtures
   simulées (`$12.40`, HEAD inventé).
3. **Surface App.** Vue session v2 uniquement. Si aucune session liée :
   le dire dans `smoke-report.md` ; contrat UI = tests 009/010 rejoués +
   captures maquette. Ne pas inventer projet / session.
4. **Liste d’écarts.** `ecarts.md` (1440 et 1024) : attendus (bandeau ☰+
   split, onglet Contexte, Browser `about:blank`, App honnête,
   `/sprint/cockpit` inchangé) vs 0.3 (nuls ou nommés). Succès = liste
   complète, pas le pixel près de Figma.
5. **Isolation A/B.** Rejouer `sprint-cockpit.test.ts`. E2E Playwright
   seulement si Chromium **déjà** installé ; sinon limite notée, pas de
   téléchargement. **Ne pas** réécrire fixtures `DA40-015-A/B`.
6. **Smoke.** Alerte courte. Maquette 8766, étapes 1–4 aux deux largeurs.
   App ports **18** (`.make.env` local ignoré `WORKTREE_CODE=18` → 4118 /
   4418) si `make config-check`. Isolation HTML = zéro fetch hors origine
   sur la maquette.
7. **Honnêteté.** Pas de faux HEAD / `$0` / preview live. Zéro écriture
   recette dans `staging` hors APEX canonique.

## Blocs

### B1 — Contrat App chrome 0.3 (tests existants)

Rejouer, **ne pas dupliquer** :

- `packages/app` :
  `src/pages/session/session-workbench-layout.test.ts`
  `src/pages/session/session-secondary.test.ts`
  `src/components/session/pack-inspector.test.ts`
- `bun typecheck` depuis `packages/app`

Preuve attendue : 1440 rail 244 / chat plein ; 1024 rail 64 et secondaire
encore adressable ; split / Files / `+` / ☰ dans le bandeau agent.
Aucun fichier produit.

Checks : les 3 tests ci-dessus + typecheck app. `git diff --check` (vide
sauf APEX).

Livrable : `blocs/B1.md`.

### B2 — Maquette servie 1440 / 1024

Servir `docs/product/maquette` sur `127.0.0.1:8766`. Ouvrir
`/cockpit.html`. Navigateur Cursor : **1440×900** puis **1024×768**.

Rejouer `maquette.md` Recette 1–4 :

1. 1440 : chat plein ; split → secondaire défaut Files (éditeur +
   explorer **droite**)
2. `+` : Browser / Git Diff / Files ; poignée chat ↔ secondaire
3. ☰ inspecteur flottant ; terminal bas
4. 1024 : rail compact 64px ; secondaire encore adressable

Isolation HTML : zéro requête hors origine (CDP / log réseau). Captures
sous `evidence/` (1440 et 1024, états clé). Ne pas traiter les fixtures
HTML comme contrat App.

Checks : captures présentes ; isolation notée (pass / fail). Pas de
typecheck supplémentaire.

Livrable : `blocs/B2.md` + `evidence/`.

### B3 — Écarts + isolation A/B

- Écrire `ecarts.md` : tableau attendus (déjà figés) vs 0.3 pour 1440 et
  1024. Un trou 0.3 = grille manquante sur la vue session alors que
  009/010 l’avaient promise. Sinon « nuls ».
- Isolation A/B : depuis `packages/app`,
  `bun test src/pages/sprint-cockpit.test.ts`. E2E
  `e2e/sprint-cockpit.spec.ts` **seulement** si Chromium déjà là.
- Ne pas toucher `sprint-cockpit-input.ts` / fixtures A/B.

Si B1 ou B2 démontre un trou 0.3 : C1 App **minimal** dans ce bloc
(pathset nommé), puis rejouer les tests B1. Sinon aucun fichier App.

Checks : `sprint-cockpit.test.ts` vert ; e2e ou limite notée ;
`ecarts.md` complet ; typecheck app si C1. `git diff --check` pathset.

Livrable : `blocs/B3.md` + `ecarts.md`.

## Pathset

- `.project/tasks/DA40-018-recette-maquette/**` (`plan.md`, `blocs/`,
  `ecarts.md`, `evidence/`, `STATE.md`, `smoke-report.md`, `verify.md`)
  — canonique Daidalon **et** copie worktree

C1 seulement si trou 0.3 démontré : alors ajouter le fichier App
**minimal** au pathset et le nommer dans `blocs/B3.md`.

Hors pathset : fixtures `DA40-015-A/B`, `sprint-cockpit-input.ts`,
chrome 009/010 sauf C1, preview `make dev` (DA40-019), `$` DA30-014,
conducteur DA10-011, Core / Protocol / generated, `.make.env`,
`bun.lock`, staging hors APEX, `TaskExecution`.

## Smoke (après B3, même chaîne)

Alerte courte puis : maquette 8766 étapes 1–4 aux deux largeurs ;
isolation HTML. App `make config-check` / `dev` ports 18 **si** session
liée visible ; sinon limite déjà écrite (B3 / `smoke-report.md`). Pas
d’attente de collage.

## Verify + commit

`verify.md` : HEAD, pathset, typecheck app, tests B1 + A/B, smoke,
`ecarts.md`, SHA. Commit local
`docs: recette visuelle maquette 1440/1024` (ajuster `fix(app):` si C1).
Pas de push/merge. Remise au sprint. MT non `done` ici.

## Arrêts

Trou 0.3 non corrigeable dans le pathset / checks encore rouges /
secrets ou `bun.lock` sale dans le diff / tentation d’écrire sur
`staging` / tentation de télécharger Chromium ou d’inventer une session.
