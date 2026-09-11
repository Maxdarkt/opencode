# Analyze — DA30-010 — Métriques Sprint par tâche et provenance

## Objectif, autorité et périmètre

Cette analyse prépare l’agrégat Sprint lecture seule des métriques **A et B**, avec
provenance, fraîcheur, états `measured | estimated | partial | unknown`, et **jamais un
faux zéro**. Mandat utilisateur : **Analyze seulement**, worktree de carte disjoint,
base `7df15b2cd`, parallèle de DA20-005. Aucun code métier, check produit, commit,
push, merge, ni écriture staging / `features/30-agent-runtime`.

Scope canonique : `features/30-agent-runtime/.project/tasks/DA30-010-metriques-sprint-par-tache/scope.md`.
Carte MT `DA30-010` relue `in_progress` (`ad37c1dc`), sprint `da-release-0.1-sprint-4`.
Titre MT et Sprint 4 incluent aussi les **signaux d’attention** : les reprendre depuis
`TaskOwnership.AttentionFact` déjà au HEAD, sans inventer d’attention.

**Dans le périmètre :** agrégat par `taskID` et file DA30-009 ; séparation A/B ;
doublons / inconnus visibles ; fraîcheur d’observation ; tests Core/HTTP et fixture
deux tâches.

**Hors périmètre :** budget bloquant, facturation, optimisation de routage, export
distant, UI (DA10-005), topologie Git (DA20-005), réconciliation `70e6bf`/`7374a3e`
(DA30-011), commit/push/merge.

## Git mesuré

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA30-010-metriques-sprint`
- Branche : `task/DA30-010-metriques-sprint` (créée, autorisée)
- Base/HEAD : `7df15b2cd2f61cbc6d28fd7ed54a4401fe85a2df` (`feat(core): add read-only task ownership projection`)
- Index propre avant ces artefacts APEX
- Parallèle : DA20-005 sur le **même** commit, autre worktree ; `staging` et `30-agent-runtime` non utilisés
- File DA30-009 déjà dans ce HEAD : `3fa91aba1` → `task-queue` / `task-authority`
- Métriques Sprint 3 déjà dans l’ancêtre : `7374a3ea3` → `TaskMetrics` + `POST /global/metrics`

## Preuves — ce qui existe déjà

`TaskMetrics` (Schema/Core/HTTP/SDK) agrège une tâche via `task_binding` → messages
assistant V2, et un sprint via **liste d’IDs fournie par l’appelant**. États honnêtes
pour tokens/modèles/latence. Le coût est **toujours `unknown`** (pas de tarif durable) :
un `cost: 0` runner n’est pas exposé. Les IDs dupliqués sont dédupliqués et listés
(`duplicateTaskIDs`). Une carte sans binding reste dans `tasks` en `unknown`.

`TaskQueue.evaluate` refuse les IDs dupliqués et les identités partagées côté pilote.
`TaskOwnership` porte déjà `Provenance { source, reference }` et `Freshness
{ observedAt?, expiresAt?, generation? }` plus `AttentionFact` par entrée.

`task_binding.session_id` est unique en SQL : deux cartes ne peuvent pas lier la même
session si le binding est cohérent. L’agrégat actuel **ne vérifie pas** l’ordre de
file ni la fraîcheur du snapshot, et **n’attache pas** l’attention.

## Écarts à combler (entrée Plan)

1. **A/B** : l’agrégat sprint actuel n’est pas une file. Il somme les tâches sans
   conserver l’ordre A→B ni le résultat `TaskQueue`. Une fixture HTTP n’a qu’une
   tâche mesurée + une absente, pas deux tâches distinctes mesurées.
2. **Fraîcheur** : absente de `TaskMetrics.Task` / `Sprint`. Une lecture live SQLite
   n’est pas distinguée d’un snapshot expiré (`TaskAuthority.QueueObservation`).
3. **Provenance** : tableaux de chaînes (`task_binding:…`, `session_message:…`) vs
   faits structurés de `TaskOwnership`. Le Plan doit aligner sans casser le SDK
   généré sans `bun run generate` (client) + SDK JS.
4. **Unknown vs zéro** : déjà vrai pour le coût. À étendre : agrégat sprint
   `measured` seulement si **toutes** les lignes A/B le sont ; une ligne `unknown`
   rend le total `partial`/`unknown`, jamais `0`. Tokens nuls **mesurés** restent
   légitimes (tour fermé avec 0 output).
5. **Attention** : composer les faits DA20-004 par `mtTaskID` ; absence = `unknown`,
   jamais un compteur 0 ni un signal de A recopié sur B.
6. **Appartenance sprint** : le runtime ne lit toujours pas MT. L’appelant (UI/parent)
   fournit `sprintID` + IDs. Ce lot ne persiste pas l’appartenance.

## Contrat recommandé au Plan

Étendre `TaskMetrics` (pas un second domaine) :

- chaque ligne tâche : `taskID`, `sessionID?`, métriques existantes, `freshness`,
  `attention` (fait ownership ou `unknown`), provenance structurée ou chaînes
  stables plus fraîcheur ;
- agrégat sprint : `taskIDs` dans l’ordre d’entrée (file A/B), `duplicateTaskIDs`,
  `unknownTaskIDs` / états par ligne, totaux combinés **sans** promouvoir un
  inconnu en mesuré ;
- entrée sprint : IDs appelant + optionnellement le même snapshot/file que
  `TaskOwnership`/`TaskQueue` pour refuser une file bloquée plutôt que d’inventer
  des totaux ;
- HTTP : même `POST` global, contrat étendu ; régénération SDK si Schema change ;
- coût inchangé `unknown` (hors factu).

Aucune décision métier ouverte : le scope impose fail-closed et séparation A/B.
DA30-011 reste hors Sprint 4 : ne pas rebaser `s3-30-cost-metrics`.

## Régressions à protéger

- coût runner `0` sans tarif → `unknown`, pas de `value` ;
- A et B : sessions/tokens/attention distincts ; pas de fusion silencieuse ;
- doublon d’ID → signalé, une seule ligne d’agrégat ;
- tâche absente / binding manquant / snapshot expiré → `unknown`/`partial` nommé ;
- totaux sprint jamais `measured` si une membre est `unknown` ;
- tests DA30-007 existants restent verts.

## Pathset candidat

- `packages/schema/src/task-metrics.ts` (+ export index si besoin)
- `packages/core/src/task-metrics.ts`
- `packages/core/test/task-metrics.test.ts` (fixture A/B)
- `packages/opencode/src/server/routes/instance/httpapi/{groups,handlers}/global.ts`
- `packages/opencode/test/server/httpapi-global.test.ts`
- SDK générés si le contrat public change (`packages/client` `bun run generate`,
  `packages/sdk/js`)

Composer `TaskQueue` / `TaskOwnership` en lecture ; ne pas modifier leurs contrats
sauf import. Hors pathset : UI, migrations, Catalog/prix, Git topology, staging.

## Checks prévus (Plan/Build, pas maintenant)

Depuis `packages/core` : `bun test test/task-metrics.test.ts test/task-queue.test.ts`
(+ ownership si composition). Depuis `packages/opencode` : test HTTP global ciblé.
Typechecks schema/core/opencode (+ client/sdk si generate). `git diff --check`.

## Risques

- Changement Schema public = generate obligatoire ; oubli = SDK stale.
- Collision de fichiers avec DA20-005 peu probable (Git vs métriques).
- Somme sprint de tokens A+B est un **total**, pas une attribution croisée : l’UI
  DA10-005 doit afficher les lignes d’abord.
- PLAN-GENERAL / sprint.md canoniques disent encore `todo` : projection parent
  DA40-016, pas d’écriture depuis ce worktree.

## Actions manuelles

Aucune pour Analyze. Plan ensuite, après validation parent/utilisateur.

## Questions non résolues

Aucune qui bloque Analyze. Le Plan tranchera le format filaire exact
(fraîcheur + provenance structurée vs champs additionnels) sans changer le
comportement d’honnêteté.
