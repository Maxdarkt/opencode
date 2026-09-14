# Analyze — DA10-010 — Panneau secondaire : Browser, Diff, Files

## Git, MT, autorité

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA10-010`
- Branche : `panneau-secondaire` @ `58eb94ecc` (HEAD DA10-009 Verify ; produit `f6f54383c`)
- APEX canonique : `/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/tasks/DA10-010-panneau-secondaire`
- Copie worktree : `.project/tasks/DA10-010-panneau-secondaire`
- MT `DA10-010` : `in_progress` (Sprint 6)
- Dépend de DA10-009 (fait). Bloque DA40-018, DA40-019.
- Aucun Build produit sur `staging`. `make dev` réel = DA40-019.

## Objectif

Icône split, poignée, onglets Browser / Git Diff / Files comme `docs/product/maquette/cockpit.html` : `+` collé aux onglets, menu visible, resize. Arbre Files **à droite**, fil d’Ariane, patch Git **entier**.

## Surfaces observées (ce HEAD)

| Surface | État | Écart DA10-010 |
| --- | --- | --- |
| Maquette `cockpit.html` | `btn-sec` à droite de ☰ ; fermé par défaut ; 1er open = Files ; `+` menu Browser/Diff/Files ; poignée 5px min 280px ; Files = crumb + éditeur + tree **droite** ; Diff = liste `+n/−n` + patch ; Browser = URL + about:blank si pas de serveur | Absent de l’App |
| `sessionWorkbenchLayout` | `showSecondary: sidePanelOpen` déjà câblé ; test 1440 **sans** secondaire | Flag prêt, UI non |
| `AgentBanner` / `PackInspector` | ☰ float dans le bandeau, pas dans le header top maquette | Pas d’icône split à droite du ☰ |
| `SessionSidePanel` v2 | Files/review OpenCode (tree souvent à gauche, onglets Review + fichiers) | Chrome ≠ maquette ; DA10-009 l’a laissé **fermé** et **non supprimé** |
| `FileTree` / `FileTreeV2` + `file.read` | Arbre + contenu du **worktree session** (`sdk.directory`) | Réemployable ; inverser la colonne tree |
| `turnDiffs()` | `lastUserMessage()?.summary?.diffs` = fichiers de **ce chat** | Git Diff maquette ; pas le `vcs.diff` working-tree global |
| `vcs.diff` + `ReviewTab` | Diff git working/branch, patch chargeable | Trop large vs « ce chat » ; garder pour DA hors scope |
| Browser / preview | Aucune surface workbench | Stub : pas d’iframe `make dev` |
| 1024 | Rail 64px (DA10-009) | Secondaire encore adressable (icône + resize) |

## Décisions proposées (à valider pour Plan)

1. **Où.** Vue session layout v2 (`/{b64}/session/{id}`), chrome DA10-009. Pas de rewrite `/sprint/cockpit`. Pas de 3ᵉ peau.
2. **Toggle.** Icône split **immédiatement à droite du ☰** (bandeau agent, déjà le ☰). Fermé par défaut. 1er open sans onglet → Files. Re-clic ferme. Ne pas déplacer ☰ vers le header top.
3. **Slot.** Dans le workbench, le secondaire **remplace** le slot `SessionSidePanel` (plus deux panneaux droits). Fichiers `session-side-panel*` **conservés**, non montés sur ce chemin. Commande file-tree existante → ouvrir/focus onglet Files du secondaire.
4. **Onglets `+`.** Barre collée : onglets ouverts + `+` + menu (Browser, Git Diff, Files). Plusieurs onglets. `×` ferme ; dernier `×` ferme le panneau. Menu `overflow:visible` (bug maquette déjà traité dans le HTML).
5. **Poignée.** `ResizeHandle` entre chat et secondaire. Largeur persistée (réemploi clamp session / min 280). Chat reste `flex-1`.
6. **Files.** Crumb du chemin observé ; contenu via `file.read` déjà public ; explorer **à droite** du fichier ; arbre = worktree de la session, jamais `staging` inventé. Fichier manquant / hors arbre → `unknown` / omitted, pas un dump.
7. **Git Diff.** Liste = `turnDiffs()` (ce chat), `+n/−n` observés. Clic = **patch entier** du diff résumé (pas un working-tree global). Vide = état vide, pas de fixtures maquette.
8. **Browser.** Stub lecture : barre URL `about:blank` + message « démarre make dev dans l’inspecteur Serveurs ». `+ onglet` = toast simulation, aucun serveur lancé. DA40-019 branchera plus tard.
9. **Honnêteté / API.** App n’importe jamais Core. Pas de nouvel HttpApi (file + summary diffs déjà publics). Aucun HEAD, chemin, patch ou preview inventé.
10. **Tests / smoke.** Layout 1440 : split ouvre secondaire Files, tree à droite, `+` menu visible, poignée. Git Diff = diffs chat. Browser stub. 1024 : icône encore là. Typecheck `packages/app`. Smoke session liée.

## Hors périmètre (confirmé)

`make dev` réel / preview live (DA40-019). Recette visuelle 1440/1024 formelle (DA40-018). Rewrite `SessionSidePanel` legacy hors workbench. `$` honnêtes DA30-014. `TaskExecution.resume`. Push/merge/staging.

## Pathset probable

- App : secondaire workbench (shell + onglets + Files/Diff/Browser), icône bandeau, layout `showSecondary`, i18n `en.ts` (+ clés locales typées)
- Réemploi : `file.read` / FileTreeV2, `turnDiffs`, `ResizeHandle`, tray/rail DA10-009
- APEX `blocs/` + smoke/verify
- Hors pathset : Protocol/HttpApi ; Core ; `/sprint/cockpit` ; generated ; PTY

## Risques

- Ne pas réouvrir le side panel OpenCode en parallèle du secondaire.
- `turnDiffs` peut être vide en début de chat : empty honnête.
- Tree à droite = CSS/flex, pas un nouvel explorateur.
- i18n : clés nouvelles dans `en.ts` et locales (typecheck).
- Largeur persistée vs `layout.session.width` actuel (review) : état **dédié** secondaire pour ne pas recycler le review panel.

## Décisions ouvertes

Aucune métier. À valider : les 10 décisions ci-dessus.
