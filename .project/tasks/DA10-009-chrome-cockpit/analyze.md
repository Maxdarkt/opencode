# Analyze — DA10-009 — Chrome cockpit : rail, chat, terminal, inspecteur

## Git, MT, autorité

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA10-009`
- Branche : `chrome-cockpit` @ `4bc70e689` (staging / Sprint 5 mergé)
- APEX : `.project/tasks/DA10-009-chrome-cockpit`
- MT `DA10-009` : `in_progress` (Sprint 6)
- Dépend de DA10-007 (fait). Bloque DA10-010, DA40-018.
- Aucun Build produit sur `staging`. Panneau secondaire = DA10-010. `make dev` = DA40-019.

## Objectif

Aligner le **shell workbench** App sur `docs/product/maquette/cockpit.html` à **1440** : rail, chat centre, terminal bas (split), inspecteur flottant. **Sans** le split éditeur.

## Surfaces observées (ce HEAD)

| Surface | État | Écart DA10-009 |
| --- | --- | --- |
| Maquette `cockpit.html` | Rail 244px, chat, tray terminal + Split côte-à-côte, ☰ float, secondaire hidden | App n’a pas ce chrome |
| `/sprint/cockpit` | Rail cartes + canvas inerte + panneau Sprint 4 | Dashboard lancement ; **pas** le workbench 0.3 |
| `/{b64}/session/{id}` | Chat + bandeau DA10-008 + inspecteur pack collé au bandeau | Pas de rail sprint ; inspecteur ≠ float ☰ |
| Layout défaut `newLayoutDesigns=true` | Titlebar + session ; **pas** de rail gauche | Colonne chat + side panel OpenCode (files/review) |
| `SessionSidePanel` | Files / review à droite | = split éditeur → **DA10-010**. À 1440 : ne pas l’ouvrir par défaut |
| `TerminalPanel` / V2 | PTY réel (`/api/pty` create/list/connect, location-scoped) | Onglets, **pas** split côte-à-côte. Tray maquette absent |
| Inspecteur | Contexte / Coût, `unknown` honnête (DA10-008) | Dans le bandeau, pas `position:fixed`. Pas d’onglet Git lecture |
| `LocalContext.git` | branch, HEAD, dirty, review | Non monté dans l’inspecteur |
| `CockpitTaskView` | id, worktreeLabel, sessionHref, pastilles | Seulement sur `/sprint/cockpit` |
| 1024 | Maquette : rail 64px | Hors recette principale ; compact si le rail existe |

## Décisions proposées (à valider pour Plan)

1. **Où.** Chrome 0.3 sur la **vue session** (`/{b64}/session/{id}`), layout v2. `/sprint/cockpit` inchangé (launch / recette données). Pas de rewrite OpenCode sidebar legacy.
2. **Rail.** Gauche 244px (≥1440) : cartes sprint via `loadSprintCockpit` (libellé worktree DA10-007). Clic carte avec `sessionHref` → cette session. Sans session → cockpit. Item **Pilote** → `/sprint/cockpit`. Compact 64px ≤1024. Pastilles observées seulement.
3. **Chat centre.** Colonne restante, plein largeur work. Side panel OpenCode **fermé** par défaut (DA10-010). Ne pas supprimer le code existant.
4. **Terminal.** Tray bas de la colonne work (pas sous le rail). Bandeau Terminal + **Split**. PTY déjà là → split **réel** : 2 panes, 2 PTY, cwd = worktree session. Create PTY KO → 2ᵉ pane simulé (`unknown`, pas un faux shell). Humain ≠ trace agent.
5. **Inspecteur.** Float `fixed` (maquette), toggle ☰ dans le bandeau/header session, plus le bouton texte du bandeau. Onglets : **Tâche** (faits cockpit / binding, sinon `unknown`) · **Git** lecture (`LocalContext.git` + vs staging si topologie observée ; merge = simulation no-effect) · **Contexte** / **Coût** (DA10-008, jamais faux `$0`). **Serveurs** / **Permissions** : onglets visibles, contenu `unknown` / hors scope — pas de Start/Stop, pas de grant.
6. **Honnêteté.** Pas de chemin, branche, HEAD ou coût inventé. App n’importe jamais Core.
7. **Tests / smoke.** Layout 1440 : rail + chat + tray, pas de secondaire. Split : 2 panes. ☰ float. Typecheck app. Tests rail/tray/split/inspecteur. Smoke session liée.

## Hors périmètre (confirmé)

Panneau secondaire Browser/Diff/Files (DA10-010). `make dev` (DA40-019). `$` honnêtes DA30-014. Rewrite cockpit Sprint 4. `TaskExecution.resume`. Push/merge/staging.

## Pathset probable

- App : shell session (rail + tray), terminal split, inspecteur float, i18n `en.ts`, tests
- Réemploi : `sprint-cockpit-load` / mapper, `agent-banner`, `pack-inspector`, `context/terminal` PTY
- APEX `blocs/` + smoke/verify
- Hors pathset : Protocol/HttpApi sauf constat PTY déjà public ; cockpit dashboard ; side panel v2

## Risques

- Session = un directory URL : le rail navigue **entre** worktrees via `sessionHref` (déjà DA10-007).
- Ne pas coller le chrome au canvas inerte du cockpit.
- PTY location = `session.directory` ; pas le cwd du process staging.
- Flag `newLayoutDesigns` déjà true : cibler ce layout, pas une 3ᵉ peau.

## Décisions ouvertes

Aucune métier. À valider : les 7 décisions ci-dessus.
