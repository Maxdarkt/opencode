# Plan — DA30-009 — File séquentielle et autorité multi-tâche

## Mandat et décision de conception

Le Sprint 4 validé le 2026-09-10 couvre cette évolution locale, séquentielle et fail-closed. Cette phase ne couvre ni push, intégration, MT distant, UI, métriques Sprint, ownership de worktree, parallélisme ni Build sur staging. Le parent conserve la réception, le smoke visuel et toute transition métier finale.

La clôture admissible réutilise la machine existante, sans état parallèle : une entrée est **fermée** uniquement si `mtStatus` vaut `review` ou `done` **et** `apexPhase` vaut `verify`. Une entrée est **active** uniquement si `mtStatus` vaut `in_progress` et que `TaskPilot.evaluate` retourne une action. Une entrée `todo` sans phase est éligible à `start_analyze`. Toute autre combinaison est bloquée. Ainsi, A ne peut laisser la sélection à B qu'après sa clôture observable; une A en `review|done` avec une autre phase reste invalide.

Le nouveau contrat ne fait aucune écriture. MT fournit les statuts, APEX les phases et preuves, `TaskBinding` l'identité durable, et le snapshot runtime seulement l'observation fraîche MT/APEX/Git. La validation complète combine ces autorités, sans déplacer ni recopier un champ de A vers B.

## Fichiers et contrats

### B1 — évaluateur pur de file

Fichiers autorisés :

- `packages/schema/src/task-queue.ts` — nouveau contrat public : entrée ordonnée `{ id, mtStatus, apexPhase?, context }`, résultat `selected | complete | blocked`, sélection `{ id, action }` et raisons typées de blocage;
- `packages/schema/src/index.ts` — export public `TaskQueue`;
- `packages/core/src/task-queue.ts` — évaluateur pur, qui appelle `TaskPilot.evaluate` par entrée et ne dépend ni de SQLite, ni de FS, ni de HTTP;
- `packages/core/test/task-queue.test.ts` — régressions A/B;
- `packages/core/test/task-pilot.test.ts` seulement si nécessaire pour factoriser/exporter un prédicat existant; conserver ses assertions de cycle mono-tâche intactes.

Contrat B1 :

1. Rejeter une file vide (`empty_queue`) ou des IDs dupliqués (`duplicate_task_id`). Les blocages de contexte (`context_incomplete`, `context_divergent`, `execution_resuming`, `mt_blocked`) sont conservés depuis `TaskPilot`.
2. Parcourir l'ordre source, sans tri ni déduction de dépendance. Une entrée fermée peut précéder la sélection; la première entrée non fermée doit être la seule entrée active, ou une entrée `todo` éligible.
3. Une entrée active retourne sa propre action `TaskPilot`; une entrée `todo` retourne `start_analyze`. Les entrées après la sélection doivent rester `todo` (sans phase). Une seconde active (`multiple_active`), une entrée ultérieure déjà fermée/active (`out_of_order`), une phase sur `todo`, ou une combinaison MT/APEX invalide (`invalid_status_phase`) bloque la file. Une entrée non fermée avant une sélection ultérieure retourne `predecessor_not_closed`.
4. Si toutes les entrées sont fermées, retourner `complete`; aucun dernier élément fermé n'est réactivé.
5. Le résultat ne contient que l'ID et l'action de l'entrée sélectionnée, jamais session, worktree, owner, effet, métrique ou action issue d'une autre entrée.

Tests B1 obligatoires : A active/B todo; A `review|verify` puis B todo; A `done|verify` puis B todo; A/B toutes fermées; reprise identique; file vide; ID dupliqué; deux actives; A non fermée avant B active; `todo` avec phase; statut/phase invalides. Vérifier explicitement que B n'est pas sélectionnée tant que A n'est pas fermée.

### B2 — projection d'autorité de file

Fichiers autorisés :

- `packages/schema/src/task-authority.ts` — contrat `QueueInput`/`QueueObservation` qui porte une liste ordonnée d'identités complètes et le résultat de file, avec génération/provenance uniques du snapshot;
- `packages/core/src/task-authority.ts` — méthode `observeQueue` : lecture et décodage uniques du snapshot, vérification de fraîcheur, validation de chaque `TaskBinding.Identity` via `TaskBinding.resume`, correspondance individuelle `mtTaskID/worktree/head`, puis délégation au contrat B1;
- `packages/core/test/task-authority.test.ts` — base SQLite/identités A et B et régressions de projection;
- `packages/core/test/task-binding.test.ts` seulement si l'adaptateur de fixture partagé le justifie;
- `packages/schema/src/index.ts` seulement si B1 ne l'a pas déjà rendu nécessaire.

Le snapshot ne contient ni `sessionID` ni `apexExternalRef`. B2 ne l'étend pas et ne les invente pas : chaque entrée reçoit une `TaskBinding.Identity` complète, que `TaskBinding.resume` vérifie localement. Le snapshot valide ensuite séparément son propre MT/APEX/worktree/HEAD pour le même `mtTaskID`. Toute absence, expiration, malformation, duplication, mismatch de binding ou divergence Git rend une observation de file typée `blocked`; aucune entrée n'est sélectionnée.

`observe(mtTaskID, worktree, head)` garde son contrat mono-tâche et ses appels HTTP existants. `observeQueue` est une nouvelle lecture sans endpoint ni mutation; son ajout de dépendance `TaskBinding.node` exige d'adapter les layers de test, mais ne change pas le cycle de session ou la base de production.

Tests B2 obligatoires : A/B bindings distincts et snapshot concordant sélectionnant A puis B après clôture A; expiration/malformation; snapshot ne contenant qu'une des entrées; worktree ou HEAD divergent pour B; session ou `apexExternalRef` divergent dans le binding B; IDs dupliqués; deux actives. Chaque refus doit prouver l'absence de sélection et conserver les deux identités inchangées.

## Checks et smoke

Après B1 : depuis `packages/core`, `bun test test/task-queue.test.ts test/task-pilot.test.ts`; depuis `packages/schema`, `bun typecheck`; depuis `packages/core`, `bun typecheck`; puis `git diff --check`.

Après B2 : depuis `packages/core`, `bun test test/task-authority.test.ts test/task-binding.test.ts test/task-execution.test.ts`; depuis `packages/schema`, `bun typecheck`; depuis `packages/core`, `bun typecheck`; puis `git diff --check`. Ajouter le lint ciblé `bunx oxlint` sur les fichiers modifiés si l'outil est disponible dans l'installation locale. Il n'y a aucune migration SQLite attendue.

Smoke technique enfant après les deux blocs : fixture SQLite temporaire, deux sessions/bindings A/B et snapshot synthétique; observer A active, fermer A, observer B sélectionnée; rejouer l'observation; injecter une divergence B et constater le refus. Le smoke visuel parent reste hors de cette tâche et couvrira la vue Sprint aux deux tailles.

## Risques, corrections et arrêt

- Ne pas étendre le résultat B1 avec des identités riches : cela recréerait un canal de fuite A → B. B2 associe toujours une sélection à l'identité de la même entrée.
- Une incompatibilité Layer/SQLite causée par la nouvelle dépendance B2 est une correction locale B2; après deux échecs bornés, suspendre B2 avec les preuves.
- Toute demande d'écriture MT/APEX, endpoint/UI, transfert de session/worktree/owner/effet, migration, parallélisme ou modification de snapshot est hors mandat et revient au parent.

## Paquet Build B1 à transmettre

> Dans `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA30-009-file-sequentielle-autorite-multitache`, exécute uniquement B1 de `.project/tasks/DA30-009-file-sequentielle-autorite-multitache/plan.md` : ajoute le contrat Schema et l'évaluateur Core purs de file A/B, leurs exports et les tests décrits. Réutilise `TaskPilot.evaluate`; aucune lecture/écriture FS/SQLite/HTTP, aucun changement à `TaskAuthority`, `TaskBinding`, `TaskExecution`, MT, APEX runtime, UI ou migration. Lance exactement les checks B1 du plan, produis `blocs/B1-task-queue.md` et actualise `STATE.md`. Pas de commit, push, MT ou B2. Modèle demandé : `gpt-5.6-luna` / `medium`; toute métadonnée observée absente ou divergente est informative et non bloquante.

Le parent doit vérifier le checkpoint B1 et ses checks avant de router B2. B2 n'est pas autorisé par ce paquet.
