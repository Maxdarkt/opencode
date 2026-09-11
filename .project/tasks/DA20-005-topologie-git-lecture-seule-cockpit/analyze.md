# Analyze — DA20-005 — Topologie Git en lecture seule pour le cockpit Sprint

## Objectif, autorité et périmètre

Cette analyse prépare une projection Schema/Core **lecture seule** du dépôt source, de ses refs
configurées et de ses worktrees, consommable par DA10-005 (`Repository topology`) sans importer
`Git.Service` mutatif. Le mandat utilisateur couvre **Analyze seulement** : aucun Plan, Build, test
exécuté, smoke, commit, push, merge, fetch, checkout, rebase, ni écriture hors dossier APEX.

Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA20-005-topologie-git`, branche
`task/DA20-005-topologie-git`, HEAD `7df15b2cd` (`feat(core): add read-only task ownership
projection`). Créé par `git worktree add -b … 7df15b2cd` (autorité utilisateur explicite). Pas de
`features/20-workspace-git`. MT DA20-005 relu `in_progress` après mise à jour.

Hors périmètre : UI App, HTTP, SDK generate, métriques DA30-010, actions Git, inférence d'une
branche globale (`main`/`master`/`staging`/`dev`/`defaultBranch`).

## Snapshot Git mesuré (cette carte, lecture seule)

Commandes : `status --porcelain=v1 --branch`, `rev-parse`, `symbolic-ref`, `worktree list
--porcelain`, `rev-list --left-right --count`, `diff --numstat --shortstat`. Aucune commande
mutative.

| Fait | Valeur | Provenance |
| --- | --- | --- |
| Dépôt commun | `/Users/leanbot/Documents/40_Daidalon/Daidalon/.git` | `rev-parse --git-common-dir` |
| Worktree | chemin ci-dessus | `rev-parse --show-toplevel` |
| Branche | `task/DA20-005-topologie-git` | `symbolic-ref --short HEAD` |
| HEAD | `7df15b2cd2f61cbc6d28fd7ed54a4401fe85a2df` | `rev-parse HEAD` |
| Upstream | `unknown` | `@{upstream}` : aucune |
| Propreté | `clean` | porcelain vide |
| Cible de merge produit | `unknown` | **aucune config dépôt** ; ne pas inférer |
| Worktrees listés | 24 (dont 2 `prunable` tmp) | `worktree list --porcelain` |
| vs `staging` (illustration seulement) | behind 33 / ahead 2 ; `25 files, +1904 / -5` | `rev-list` / `diff` `staging...HEAD` |
| vs `origin/dev` (illustration seulement) | behind 0 / ahead 25 | `rev-list origin/dev...HEAD` |
| `origin/HEAD` | `unknown` | pas un symbolic-ref |
| `origin/staging` | `unknown` | revision absente |

Les deux comptes vs `staging` et `origin/dev` divergent. Une cible implicite fausserait le cockpit.
`Git.history.defaultRemoteBranch` / `init.defaultBranch=main` sont **interdits** comme merge target.

Worktrees utiles à la recette A/B (chemins, pas d'attribution sans ownership) :

- DA20-004 : `…/DA20-004-cockpit-ownership` · `cockpit-ownership` · `7df15b2cd`
- DA20-005 : ce checkout · `task/DA20-005-topologie-git` · `7df15b2cd`
- DA30-010 : `…/DA30-010-metriques-sprint` · même HEAD (carte parallèle, autre worktree)

Les worktrees `prunable` restent **lisibles** (`inaccessible` / `unknown`), sans `worktree prune`.

## Liaison DA20-004 (fail-closed)

`TaskOwnership.Entry.identity.checkout` porte déjà `{ repository, branch, worktree, head }`.
`TaskOwnership.read` ne lance pas Git. DA20-005 **vérifie** ces champs contre la mesure ; il n'attribue
pas un worktree à une tâche par similarité de chemin.

Règles :

1. Entrée ownership `available` + chemin résolu égal au worktree porcelain + branche/HEAD identiques →
   `task` `available` avec `mtTaskID` de **cette** entrée.
2. Chemin égal mais branche ou HEAD différents → `divergent` ; le worktree reste listé.
3. Ownership `absent` / `blocked` / `invalid` / `unknown`, ou identité omise → le worktree est listé
   **sans** `mtTaskID` (`task` `absent` ou `unknown`). Jamais d'inférence depuis le nom de dossier.
4. Token A (worktree/HEAD/session de A) fourni pour B → refus / `invalid` comme DA20-004 ; pas de
   copie A→B.
5. Cible de merge absente ou ref introuvable → `mergeTarget` / ahead / behind / `integrationDiff` en
   `unknown` (ou `invalid` si champ requis vide). **Aucun** `rev-list` de substitution.

`Git.Service` Core (`@opencode/GitV2`) expose `clone`, `fetch`, `checkout`, `resetHard`,
`worktree.create|remove`, `change.apply|discard`. `Git.worktree.list` ne rend que `{ directory, kind }`,
sans branche/HEAD/porcelain. La topologie **n'appelle pas** cette interface mutative. Allowlist dédiée.

Le Git opencode (`packages/opencode/src/git`) a `applyPatch` et `run` ouvert : hors pathset.

## Contrat recommandé au Plan

Nom : `RepositoryTopology` (onglet cockpit). Schema sérialisable, mêmes `State` / `Provenance` /
`Freshness` / faits `available|…|unknown` que `TaskOwnership`.

**Entrée**

- `ownership: TaskOwnership.Snapshot` (ou `entries` d'identité déjà projetées)
- `repositories[]` : `root` (chemin dépôt) + `sourceRefs[]` (noms de branches **fournis**, jamais
  inventés) + `mergeTarget` **obligatoire par dépôt** (ref exacte, ex. `staging` si l'appelant le
  décide)

**Sortie**

- `Snapshot` : état global, provenance `repo_config` + `git_worktree_list`, liste dépôts
- `Repository` : `sourceRepo`, `branches[]` (présent / `absent` / `unknown` **parmi les refs
  configurées seulement**), `worktrees[]`
- `Worktree` : path, `branch` fact, `head` fact, `mergeTarget` fact, `cleanliness` (`clean` |
  `modified` | `unknown`), `ahead`/`behind` facts, `workingTreeDiff` (`additions`, `deletions`,
  `modifiedFiles` vs HEAD du worktree), `integrationDiff` (même forme vs `mergeTarget...HEAD`),
  `task` fact (identité ownership ou unavailable), `prunable` lisible sans action

Séparer working tree et plage d'intégration : un worktree propre peut être ahead avec `+/-`
d'intégration non nuls ; un worktree sale avec ahead 0 a un `workingTreeDiff` non nul. Mélanger les
deux comme la fixture DA10-006 fausserait la provenance.

**Allowlist Git (échec → fact `inaccessible`/`unknown`, jamais mutation)**

- `worktree list --porcelain`
- `rev-parse --show-toplevel|--git-common-dir|--verify HEAD`
- `symbolic-ref --quiet --short HEAD`
- `status --porcelain=v1 --untracked-files=all --no-renames`
- `rev-list --left-right --count <mergeTarget>...HEAD` seulement si `mergeTarget` configuré **et**
  `rev-parse --verify` réussit
- `diff --no-ext-diff --no-renames --numstat` vs HEAD (working tree) et vs mergeTarget...HEAD
  (intégration)
- `for-each-ref` / `show-ref --verify` pour l'existence des `sourceRefs`

Interdit dans ce module : `run` générique, `fetch`, `checkout`, `merge`, `rebase`, `reset`, `apply`,
`commit`, `push`, `worktree add|remove|prune|repair`.

DA10-005 n'importe que `@opencode-ai/schema/…` (ou le Snapshot). Pas de `packages/core/src/git.ts`.

## Pathset candidat

- `packages/schema/src/repository-topology.ts` + export `packages/schema/src/index.ts`
- `packages/core/src/repository-topology.ts` (allowlist + `TaskOwnership` en lecture)
- `packages/core/test/repository-topology.test.ts` (deux worktrees tmp + refus identité/merge target)

Dépendances lues, non cibles : `task-ownership.ts` Schema/Core, `task-binding.ts`, fixtures
`packages/core/test/fixture/git.ts` / `tmpdir`. Ne pas étendre `Git.Interface` mutatif.

Hors pathset : App/UI, HttpApi, SDK, `packages/opencode/src/git`, `packages/opencode/src/worktree`.

## Protections de régression

1. Deux worktrees A/B : chacun son path/branche/HEAD/mergeTarget ; A n'emprunte rien à B.
2. Identité absente : worktree listé, `task` `absent`/`unknown`, pas d'`mtTaskID`.
3. `mergeTarget` manquant ou ref morte : ahead/behind/`integrationDiff` `unknown` ; pas de
   `defaultBranch`.
4. Worktree dirty + prunable : lisibles, zéro commande mutative (espionner l'argv du runner).
5. Checkout ownership ≠ mesure Git : `divergent`.
6. Régression `task-ownership` + typecheck Schema/Core.

Checks prévus au Plan, non exécutés ici : `bun test test/repository-topology.test.ts
test/task-ownership.test.ts` depuis `packages/core` ; `bun typecheck` Schema et Core ;
`git diff --check`. Smoke : repos tmp à deux worktrees, pas le dépôt Daidalon réel.

## Risques

- `Git.defaultBranch` et la fixture DA10-006 (nombres toujours présents) poussent à inventer `0` :
  le contrat réel doit porter des facts, pas des `number` silencieux.
- `diff staging...HEAD` est un delta de commits du graphe entier, pas « les fichiers de ce dossier
  worktree ».
- 24 worktrees dont 2 prunables : le snapshot doit rester borné et non bloquant.
- `TaskOwnership` actuel n'a pas de source `git_*` : étendre `Provenance.Source` seulement dans le
  nouveau module, pas casser DA20-004.

## Décision ouverte

Aucune : le scope impose lecture seule, refs configurables, fail-closed, liaison ownership. Le Plan
fixera les identifiants Schema et le découpage `workingTreeDiff` / `integrationDiff`.

## Actions manuelles / suite

Plan après `go` utilisateur. Pas de Build. PLAN-GENERAL canonique (staging) dit encore `todo` :
projection plan `stale` ; ce chat n'écrit pas staging. MT DA20-005 `in_progress` relu.
