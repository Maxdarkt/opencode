# Plan — DA10-010 — Panneau secondaire : Browser, Diff, Files

Analyze accepté (10 décisions). Worktree `features/tasks/DA10-010`,
branche `panneau-secondaire`, HEAD `58eb94ecc`. Vue session layout v2
seulement. Pas de staging, cockpit rewrite, HttpApi, Core, `make dev`
réel, push/merge.

## Décisions

1. Vue `/{b64}/session/{id}`, chrome DA10-009.
2. Icône split **à droite du ☰** (bandeau agent). Fermé par défaut.
   1er open sans onglet → Files. Re-clic ferme. ☰ reste dans le bandeau.
3. Slot v2 : secondaire **remplace** `SessionSidePanel` (fichiers
   conservés, non montés). `fileTree.toggle` → ouvrir/focus Files.
4. Barre collée : onglets ouverts + `+` + menu (Browser, Git Diff,
   Files). `×` ferme ; dernier `×` ferme le panneau. Menu
   `overflow:visible`.
5. `ResizeHandle` entre chat (`flex-1`) et secondaire. Largeur
   persistée **dédiée** (`layout.secondary`), min 280. Ne pas recycler
   `layout.session.width` ni `layout.fileTree`.
6. Files : crumb observé ; `file.read` / `file.load` ; arbre
   FileTreeV2 **à droite** ; worktree session (`sdk.directory`).
   Manquant / hors arbre → `unknown` / omitted.
7. Git Diff : `turnDiffs()` (ce chat), `+n/−n`. Clic = `patch` entier
   du résumé, sinon `unknown`. Vide = empty honnête.
8. Browser : URL `about:blank` + message inspecteur Serveurs.
   `+ onglet` = toast simulation. Pas d’iframe `make dev`.
9. App n’importe jamais Core. Pas de nouvel HttpApi.
10. Tests layout 1440/1024 + typecheck `packages/app`. Smoke session liée.

## B1 — État, icône, slot, poignée

- `packages/app/src/context/layout.tsx` : `secondary` `{ opened: false,
  width }` persisté, API open/close/toggle/resize. Défaut fermé, min 280.
- `packages/app/src/components/session/session-pack-inspector.tsx` :
  bouton split `data-testid="session-secondary-toggle"` immédiatement
  à droite du ☰.
- `packages/app/src/pages/session.tsx` : v2 desktop n’ouvre plus
  `SessionSidePanel`. `showSecondary` = `layout.secondary.opened`.
  Chat `flex-1` ; secondaire largeur persistée + `ResizeHandle`.
- `packages/app/src/pages/session/session-workbench-layout.ts` (+ test) :
  1440 fermé = pas de secondaire ; ouvert = `showSecondary`. 1024 :
  rail 64, icône encore adressable.
- `packages/app/src/pages/session/use-session-commands.tsx` : v2
  `fileTree.toggle` ouvre/focus Files du secondaire.

Tests : fermé par défaut ; toggle ouvre ; largeur clamp ≥ 280 ;
`layout.session` inchangé. Typecheck app.

## B2 — Onglets + menu `+`

- `packages/app/src/pages/session/session-secondary.ts` (+ test) :
  modèle pur (kinds `files` | `diff` | `browser`, ids, active, add,
  close). 1er open sans onglet → Files. Dernier close → `opened: false`.
  Ajout déjà ouvert → focus, pas de doublon.
- `packages/app/src/pages/session/session-secondary-panel.tsx` : barre
  collée onglets + `+` + menu visible (`overflow:visible`).
- i18n `session.secondary.*` dans `en.ts` **et** locales (parity).

Tests : add/focus/close/dernier close. Typecheck app.

## B3 — Files, Git Diff, Browser

- Files : crumb du chemin observé ; contenu via `file.load` déjà public ;
  FileTreeV2 colonne **droite** ; arbre = `sdk.directory`.
- Git Diff : liste `turnDiffs()` `+n/−n` ; clic = `<pre>` patch entier
  (`SnapshotFileDiff.patch`) ou `unknown` ; empty si aucun diff chat.
  Pas de `vcs.diff`.
- Browser : barre `about:blank` + copie inspecteur Serveurs ;
  `+ onglet` toast simulation (même pattern que Merge inspecteur).
- Brancher les 3 panes dans le shell B1/B2. `data-testid` :
  `session-secondary`, `session-secondary-files-tree`,
  `session-secondary-diff`, `session-secondary-browser`.

Tests : tree à droite du fichier ; empty diff ; stub browser sans
iframe. Typecheck app.

## Pathset

App : `layout.tsx` (+ test) ; `session-pack-inspector.tsx` ;
`session.tsx` ; `session-workbench-layout.ts` + test ;
`session-secondary.ts` + test + `session-secondary-panel.tsx` ;
`use-session-commands.tsx` ; `en.ts` + locales.

Réemploi : FileTreeV2, `file.load`, `turnDiffs`, `ResizeHandle`,
chrome DA10-009.

Hors pathset : Protocol/HttpApi/generated ; Core ; `session-side-panel*`
(sauf démontage v2) ; `/sprint/cockpit` ; PTY ; `vcs.diff` / ReviewTab.

## Verify / Smoke

Typecheck `packages/app`. Tests layout + secondary model + Files/Diff
stub. `git diff --check`.

Smoke session liée (pas cockpit) : split ouvre Files, arbre à droite,
`+` menu visible, poignée, Git Diff = diffs chat (ou empty), Browser
stub `about:blank`, 1024 icône encore là, ☰ inchangé.

Après « Lance le build » : B1→B3 puis Smoke puis Verify. Commit après
Verify vert seulement.
