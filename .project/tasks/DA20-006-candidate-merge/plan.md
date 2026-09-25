# Plan — DA20-006 — Candidate Sprint 7 + procédure + garde-fous

## Mandat

Analyze validé (6 décisions). Build **local** sur `candidate-merge` dans
`/Users/leanbot/Documents/40_Daidalon/features/tasks/DA20-006`.
`runtime_profile: none` jusqu’au Smoke.

**Interdit pendant Build / Smoke / Verify :** merge vers `staging`,
`git push`, `git worktree remove`, rebase des autres arbres, `--force`,
prod `master`, push `dev`/`develop`/`main`. Promotion réelle = mandat
user **après** Verify+commit (ex. « promeus maintenant »), pas ici.

Succès : un SHA candidate unique qui contient DA40-019 `d2fb5ea0f` **et**
DA10-011 `da8c68597` (y compris commits `docs: record … verify SHA`) ;
docs de procédure S7 ; copy cockpit fail-closed ; checks verts ; smoke
App de **cet** arbre ; commit local APEX+pathset.

## Décisions figées

1. Candidate = **ce** worktree. Merge `ort` local, `--no-ff`. Ordre :
   `preview-make-dev` (`d2fb5ea0f`) puis `conducteur-sprint` (`da8c68597`).
   Stop au premier conflit non trivial. Pas de cherry-pick des seuls feats.
2. Aucune porte Git externe. Commit post-Verify = preuves APEX + delta
   docs/copy **sur `candidate-merge` seulement**.
3. Procédure **documentaire** (pas de script mutatif) : `suivi-sprints.md`
   + journal APEX. Séquence post-clôture MT : staging propre → merge
   **uniquement** la candidate → `git push origin staging` seulement →
   `worktree remove` seulement `features/tasks/DA10-011`, `DA40-019`,
   `DA20-006` **s’ils sont propres**. Branches locales conservées.
   Métier / `s2` / `s3` intouchés. Preview `develop` / prod `master` :
   facultatif, **non fait** ici.
4. Cockpit Merge / Commit / Production restent `{ type: "simulated" }`.
   Copy : cible promotion = `staging` ; refus explicite force-push et
   `master`/`develop`. Pas de wiring `Git.worktree.remove` ni `git merge`.
   `packInspectorMergeAction` inchangé (`simulated`).
   `sprint-cockpit-input.mergeTarget` reste `"dev"` (fait topologie Sprint 4,
   **pas** la cible de promotion).
5. Mandat destructif différé : après Verify+commit, **stop** + remise sprint.
6. Ports Smoke : `.make.env` **ignoré** `WORKTREE_CODE=06` → `4106` /
   `4406`. Jamais commité. Vérifier `appPorts.range` au Smoke ; hors
   plage → stop.

## Blocs

### B1 — Assemblage local

Depuis ce worktree, `ort --no-ff` :

1. `git merge d2fb5ea0f` (DA40-019, HttpApi / make-dev d’abord).
2. `git merge da8c68597` (DA10-011, conducteur ensuite).

Relire les auto-merges : `session-pack-inspector.tsx` (onglets **Copier
le prompt** DA10-011 **et** **Serveurs** DA40-019, n’écraser ni l’un
ni l’autre) + locales i18n chevauchantes. Marqueurs `<<<<<<<` → stop.

Consigner le SHA merge et les fichiers relus dans `blocs/B1.md`.

Checks B1 : `git merge-base --is-ancestor d2fb5ea0f HEAD` et idem
`da8c68597` ; `git diff --check` ; zéro marqueur conflit.

### B2 — Procédure durable

- `docs/workflow/suivi-sprints.md` § Fin de sprint : remplacer l’exemple
  `545718268` / DA40-015 par Sprint 7 (`candidate-merge` / SHA Verify
  **placeholder** `VERIFY_SHA`, rempli au Verify). Rappeler : jamais
  force-push, jamais `master`/`develop`/`main`/`dev` pour cette porte ;
  remove seulement les trois arbres `features/tasks/` listés, propres.
- `docs/product/worktrees.md` : nommer la porte S7 (candidate unique,
  `origin staging` only, métier conservés).
- Journal APEX `procedure-promotion.md` : checklist opératoire (staging
  sale → d’abord docs clôture **sur staging**, hors ce Build ; merge
  candidate ; push ; remove). Aucune commande exécutée ici.

Checks B2 : `git diff --check` pathset B2. Pas de serveur.

Livrable : `blocs/B2.md`.

### B3 — Garde-fous cockpit

Renforcer le copy (clés `sprint.cockpit.contextNote`,
`confirmationDescription`, et si besoin une clé merge dédiée) : Merge /
Commit / Production = simulation ; promotion Git = `staging` seulement ;
refus force-push et `master`/`develop`. `en.ts` + locales déjà touchées
par le merge (même clé). `confirmCockpitAction` inchangé pour
`commit`/`merge`/`production`. Tests `sprint-cockpit.test.ts` : les trois
restent `{ type: "simulated" }` ; copy / bandeau mentionnent staging +
refus. Ne pas changer `mergeTarget: "dev"` dans l’input.

Checks B3 : `bun typecheck` et `bun test src/pages/sprint-cockpit.test.ts`
depuis `packages/app` ; `git diff --check`.

Livrable : `blocs/B3.md`.

### B4 — Checks candidate

Depuis les **package dirs** (jamais la racine) :

| Package | Commande |
|---|---|
| `packages/schema` | `bun typecheck` |
| `packages/core` | `bun typecheck` |
| `packages/opencode` | `bun typecheck` |
| `packages/app` | `bun typecheck` |
| `packages/app` | `bun test` ciblé cockpit + inspecteur (fichiers amenés par le merge, typ. `sprint-cockpit.test.ts`, `session-pack-inspector` / pack-inspector) |
| racine worktree | `make config-check` (pas `make dev`) ; `git diff --check` |

Protocol : typecheck via le package qui l’exporte (`opencode` / client
selon l’arbre après merge). Rouge nouveau non isolable → stop.

Livrable : `blocs/B4.md`.

## Pathset

- Résultat des deux merges (inspecteur, i18n, HttpApi/make-dev, conducteur)
- `docs/workflow/suivi-sprints.md`
- `docs/product/worktrees.md`
- `packages/app/src/i18n/en.ts` (+ locales de la même clé)
- `packages/app/src/pages/sprint-cockpit.test.ts` (asserts copy si besoin)
- `.project/tasks/DA20-006-candidate-merge/**` (plan, blocs, procedure,
  smoke, verify, STATE)

Hors pathset : Core `Git.worktree.remove` produit ; `layout.tsx` delete
workspace ; `.make.env` ; `PLAN-GENERAL.md` / `sprint.md` du checkout
staging ; worktrees métier ; wiring mutatif cockpit ; generated sauf si
le merge les amène déjà (DA40-019).

## Smoke (après B4, même chaîne)

`runtime_profile: web-api` le temps du smoke, puis sleep **avant**
`smoke-report.md`.

1. Provision : symlink `node_modules` (+ env ignorés) depuis le checkout
   source si lockfile identique ; créer `.make.env` local `06`/`4106`/`4406`.
2. `make config-check` / `preflight-ports` / `dev` **dans cet arbre**.
   Listener = ce worktree. Autre checkout sur le port → stop.
3. Alerte courte : regarder le panneau navigateur **Cursor**.
4. `browser_navigate` **seul** d’abord : host **Tailscale / MagicDNS du
   Mini** + `UI_PORT` + chemin. `newTab: true`, `position: "active"`.
   **Jamais** `browser_tabs`. Pas de Chrome/Safari sur le Mini.
   Chemin 1 : `/sprint/cockpit` — éligible, copie staging/refus, Merge
   → dialogue simulation, zéro Git.
   Chemin 2 : session inspecteur **Serveurs** (contrat DA40-019) —
   start/stop borné, directory ≠ ROOT App.
5. Sleep Smoke : `make -C <00_cursor-config> dev-stop WT=<ce worktree>`
   dry-run puis `APPLY=1` seulement si PIDs OWNED de cette carte.
   Reset `runtime_profile: none` avant d’écrire `smoke-report.md`.

## Verify + commit

`verify.md` : HEAD candidate, ancêtres des deux lots, pathset, checks,
smoke PASS, SHA commit. Remplir `VERIFY_SHA` dans `suivi-sprints.md` +
journal. Commit local `chore(git): assemble sprint 7 candidate` (APEX +
docs + copy). Pas de push/merge. Remise sprint. MT non `done` ici.

## Arrêt immédiat

Conflit merge non trivial ; inspecteur amputé d’un onglet ; checks
rouges après corrections épuisées ; tentation de merger `staging` /
push / `worktree remove` ; secrets dans le diff ; port hors plage.
