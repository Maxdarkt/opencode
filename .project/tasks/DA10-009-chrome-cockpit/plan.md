# Plan — DA10-009 — Chrome cockpit : rail, chat, terminal, inspecteur

Analyze accepté. Worktree `features/tasks/DA10-009`, branche
`chrome-cockpit`, HEAD `4bc70e689`. Vue session layout v2 seulement.
Pas de staging, pas de rewrite `/sprint/cockpit`, pas de secondaire
(DA10-010), pas de `make dev`, pas de `TaskExecution.resume`, pas de
push/merge. App n’importe jamais Core.

## Décisions (Analyze)

1. Chrome 0.3 sur `/{b64}/session/{id}`, layout v2.
2. Rail gauche 244px (≥1440) via `loadSprintCockpit` ; compact 64px
   ≤1024 ; Pilote → `/sprint/cockpit` ; carte avec `sessionHref` →
   cette session, sinon cockpit ; pastilles observées seulement.
3. Chat = colonne work restante. Side panel OpenCode fermé par défaut ;
   code conservé.
4. Tray terminal sous la colonne work (pas sous le rail). Split réel :
   2 panes, 2 PTY, cwd = `sdk.directory`. Create KO → 2ᵉ pane `unknown`,
   pas un faux shell. Humain ≠ trace agent.
5. Inspecteur `position:fixed`, toggle ☰ (plus le bouton texte). Onglets
   Tâche · Git · Contexte · Coût · Serveurs · Permissions. Git lecture
   `LocalContext` déjà public. Merge = toast simulation, no-effect.
   Serveurs/Permissions : visible, contenu `unknown`.
6. Aucun chemin, branche, HEAD ou coût inventé.
7. Recette 1440 sans secondaire. Typecheck app. Tests rail/tray/split/
   inspecteur. Smoke session liée.

## B1 — Shell + rail

Layout session v2 : `[rail | work]`, work = `[chat (+ side panel si
ouvert)]` en colonne puis **tray** en bas du work (plus le terminal en
colonne droite quand seul le terminal est ouvert).

- `packages/app/src/pages/session.tsx` — composer le chrome 0.3
- `packages/app/src/pages/session/session-workbench-layout.ts` (+ test)
  — rail 244 / 64, tray sous work, chat = largeur restante
- `packages/app/src/pages/session/session-sprint-rail.ts` (+ test) —
  cartes, navigation, pastilles observées
- `packages/app/src/pages/session/session-sprint-rail.tsx`
- Réemploi `sprint-cockpit-load.ts` / mapper (pas de duplication métier)
- `packages/app/src/i18n/en.ts` — libellés rail / Pilote
- `packages/app/src/pages/session/session-panel-layout.ts` — seulement
  si le placement tray l’exige ; ne pas casser le stacked review+term
  existant (code DA10-010 conservé, fermé)

Tests : 1440 rail 244 + chat + tray, pas de secondaire ; 1024 rail 64 ;
clic `sessionHref` vs cockpit ; pastille seulement si fait observé.
Check : `bun typecheck` dans `packages/app`.

## B2 — Tray terminal split

Bandeau tray (Terminal · Split · « humain · pas la trace agent »).
Split = deux panes côte-à-côte. PTY via `terminal.new()` déjà
location-scoped (`sdk.directory`).

- `packages/app/src/pages/session/terminal-split.ts` (+ test) —
  2 ids PTY ou pane `unknown` si create échoue
- `packages/app/src/pages/session/terminal-panel-v2.tsx` — mode split
  (conserver onglets quand split off)
- `packages/app/src/pages/session.tsx` — tray dans work, plus sibling
  droit « terminal only »
- `packages/app/src/i18n/en.ts`

Ne pas simuler un shell. Ne pas changer Protocol/HttpApi (PTY public).
Check : typecheck app + tests split.

## B3 — Inspecteur flottant

Sortir l’inspecteur du bandeau (`absolute` collé) → `fixed` (maquette
~320px, z-30). Toggle ☰ dans le bandeau/header session.

- `packages/app/src/components/session/pack-inspector.ts` (+ test) —
  vues Tâche / Git / Serveurs / Permissions ; Git depuis
  `LocalContext.git` ; coût inchangé (`unknown` ≠ `$0`)
- `packages/app/src/components/session/session-pack-inspector.tsx`
- `packages/app/src/components/session/session-agent-banner.tsx` —
  ☰ à la place du bouton texte
- Réemploi `readProjectContext` (`global.context`) ; Tâche = binding
  cockpit de la session courante, sinon `unknown`
- Merge Git : toast simulation, aucun appel mutatif
- `packages/app/src/i18n/en.ts`

Check : typecheck app + tests inspecteur (onglets, unknown, merge
no-effect).

## Pathset

App session shell (`session.tsx`, workbench-layout, sprint-rail*) ;
terminal-split + `terminal-panel-v2.tsx` ; pack-inspector* +
agent-banner ; `en.ts` ; tests associés. Réemploi load/mapper cockpit,
`readProjectContext`, PTY context.

Hors pathset : Protocol/HttpApi ; Core ; `/sprint/cockpit` dashboard ;
side panel v2 (Files/Review/Browser) ; `make` ; staging ; generated.

## Verify / Smoke

`bun typecheck` dans `packages/app`. Tests B1–B3. `git diff --check`.
Smoke session liée à 1440 : rail + chat + tray, pas de secondaire,
Split → 2 panes, ☰ float, pas de faux `$0` / faux HEAD.

Après « Lance le build » : B1→B3 puis Smoke puis Verify. Commit local
après Verify vert seulement (pas de push/merge).
