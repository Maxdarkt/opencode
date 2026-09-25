# Analyze — DA20-006 — Merger la candidate et retirer les worktrees

## Git, MT, autorité

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA20-006`
- Branche : `candidate-merge` @ `03f621743` (staging Sprint 6 ; tip docs sprint-6)
- APEX : `.project/tasks/DA20-006-candidate-merge`
- MT `DA20-006` : `in_progress` (Sprint 7 `da-release-0.1-sprint-7`)
- Thème DA20 (Git). Pas un checkout `features/20-workspace-git`.
- Aucun Build produit sur `staging`.
- Git destructif (merge `staging`, push, `worktree remove`, rebase, `--force`) : **interdit pendant Build**. Mandat dédié ici (Analyze/Plan) puis confirmation explicite séparée.

## Objectif

S3 : **une** candidate locale qui contient DA10-011 + DA40-019 ; **procédure** merge → `staging` ; **retrait** des arbres de cartes du sprint ; **garde-fous** (pas de merge implicite, pas de force-push, pas de prod `master`).

## Entrées livrées (propres)

| Carte | feat | HEAD (verify SHA) | Branche | Worktree |
|---|---|---|---|---|
| DA10-011 | `9759f10bf` | `da8c68597` | `conducteur-sprint` | `features/tasks/DA10-011` |
| DA40-019 | `390de4e2c` | `d2fb5ea0f` | `preview-make-dev` | `features/tasks/DA40-019` |

Les deux arbres sont propres, base commune `03f621743`.

## Surfaces observées (ce HEAD)

| Surface | État | Écart DA20-006 |
|---|---|---|
| `candidate-merge` | = staging, sans les deux feats | Pas de candidate Sprint 7 |
| Cockpit Merge / Commit / Production | Dialogue + bandeau simulation ; `confirmCockpitAction` ≠ launch → `{ type: "simulated" }` | Déjà pas d’effet Git ; copy ne dit pas « staging only / jamais master / jamais force-push » |
| Inspecteur `packInspectorMergeAction` | `{ type: "simulated" }` (DA10-011 aussi) | Conserver |
| `sprint-cockpit-input.mergeTarget` | `"dev"` (fixture Sprint 4) | Cible réelle de promotion = `staging`, pas `dev`/`master` |
| `docs/workflow/suivi-sprints.md` § Fin de sprint | Candidate unique, push `origin staging`, remove `features/tasks/` propres | Exemple encore `545718268` / DA40-015 ; pas Sprint 7 |
| `docs/product/worktrees.md` | Portes séparées commit / merge / push / remove | OK comme contrat ; pas opérationnalisé pour S7 |
| `layout.tsx` `worktree.remove` | SDK worktree sandbox (OpenCode), pas les cartes Daidalon | Hors S3 ; ne pas l’utiliser pour retirer DA10-011/DA40-019 |
| Worktrees métier `features/10-*`…`s3-*` | Encore présents | **Conserver** (mandat séparé) |

## Assemblage (lecture seule, merge-tree)

`git merge-tree --write-tree` des HEADs `da8c68597` + `d2fb5ea0f` : **0 CONFLICT**. Auto-merge inspecteur + 60 locales (`session-pack-inspector.tsx`, `en.ts`…). Chevauchement réel = inspecteur (copie prompt DA10-011 vs Serveurs DA40-019) + i18n.

Ordre proposé : merger `preview-make-dev` puis `conducteur-sprint` (HttpApi/make-dev d’abord, conducteur ensuite). Inclure les commits `docs: record … verify SHA`, pas seulement les feats.

## Staging (observation, ne pas y écrire)

Checkout `Daidalon/` `staging` @ `03f621743`, **sale** (docs sprint 7 non commitées : `PLAN-GENERAL.md`, `sprint.md`, `docs/product/sprints/sprint-7.md`, STATE APEX, `.cursor/permissions.json`). La procédure de promotion **doit** d’abord versionner cet état canonique (ou le ranger) **sur staging**, hors Build de cette carte.

## Décisions proposées (à valider pour Plan)

1. **Candidate = ce worktree.** Après Plan, Build fusionne localement les deux HEADs sur `candidate-merge` (`ort`, stop au premier conflit non trivial). Un SHA candidate unique. Pas de cherry-pick isolé des seuls feats. Pas de merge `staging` dans ce palier.

2. **Build n’exécute aucune porte Git externe.** Pas de merge vers `staging`, pas de push, pas de `worktree remove`, pas de rebase des autres arbres, pas de `--force`. Le commit local post-Verify = preuves APEX + code de la candidate **sur `candidate-merge` seulement**.

3. **Procédure durable** (docs, pas un script mutatif) : actualiser `docs/workflow/suivi-sprints.md` + journal APEX. Séquence après clôture MT :
   1. `staging` propre (`git diff --check`) ; committer d’abord les docs de clôture s’il en reste.
   2. Merger **uniquement** la candidate (`candidate-merge` / SHA Verify).
   3. `git push origin staging` seulement (créer le remote si besoin). Jamais `dev` / `develop` / `main` / `master`. Jamais `--force`.
   4. `git worktree remove` seulement `features/tasks/DA10-011`, `DA40-019`, puis `DA20-006` **s’ils sont propres**. Branches locales conservées. Métier/`s2`/`s3` intouchés.
   5. Preview `develop` / prod `master` : facultatif, **non fait** ici.

4. **Garde-fous cockpit.** Merge / commit / production restent **simulés** après confirmation. Renforcer le copy : cible = `staging` ; refus explicite force-push et `master`/`develop`. Ne **pas** brancher `Git.worktree.remove` ni `git merge` depuis le bouton Merge. `packInspectorMergeAction` inchangé (`simulated`).

5. **Mandat destructif différé.** Après Verify+commit de cette carte, **stop** (remise sprint). Promotion réelle seulement si l’utilisateur dit explicitement (ex. « promeus maintenant ») — dans le chat sprint / ce chat, pas implicitement.

6. **Checks candidate.** Typecheck schema / core / protocol / server / app. Rejouer tests ciblés des deux lots (make-dev + conducteur/cockpit/i18n). `git diff --check`. Smoke : App de **cet** arbre (ports Make dédiés) : `/sprint/cockpit` (éligible + copie + merge simulé) **et** session inspecteur Serveurs start/stop borné (contrat DA40-019, autre directory que ROOT App).

## Hors périmètre (confirmé)

Force-push. Prod `master`. Push `develop`/`dev`/`main`. Suppression worktrees métier ou `s2`/`s3`. `TaskExecution.resume`. Nouveau HttpApi Git mutatif. Wiring réel merge/push depuis le cockpit. Build sur `staging`. Nettoyage du dirty staging pendant Build.

## Pathset probable

- Fusion locale des deux HEADs (inspecteur + i18n à relire après auto-merge)
- `docs/workflow/suivi-sprints.md` (exemple S7, garde-fous)
- `docs/product/worktrees.md` si la porte S7 n’y est pas nommée
- App cockpit : i18n merge simulé / cible staging / refus master-force (fichiers déjà dans le pathset conducteur)
- APEX `blocs/` + smoke/verify + journal de procédure
- Hors pathset : Core `Git.worktree.remove` produit ; `layout.tsx` delete workspace ; generated sauf si le merge les amène déjà (DA40-019)

## Risques

- Auto-merge inspecteur : relire Serveurs **et** Copier le prompt, ne pas écraser un onglet.
- Staging sale : un merge vers staging **maintenant** mélangerait docs sprint non validées. Mitigation : décision 2+5.
- Retirer DA10-011/DA40-019 trop tôt (avant promotion) casse la traçabilité des HEADs sources.
- `mergeTarget: "dev"` dans la fixture cockpit : ne pas le traiter comme cible réelle.

## Décisions ouvertes

Aucune autre que les 6 ci-dessus. À valider avant Plan.
