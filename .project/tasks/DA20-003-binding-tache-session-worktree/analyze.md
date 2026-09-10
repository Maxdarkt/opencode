# Analyze — DA20-003

## Objectif et autorité

Le mandat du Sprint 2 autorise un contrat local durable et borné reliant `DA20-003`, son
`external_ref` APEX, une session courante, sa `Location.Ref`, le projet/dépôt Git, la branche, le
worktree et le HEAD attendu. L'enfant peut poursuivre Analyze, Plan, Build, checks, smoke technique,
commit local borné et passage MT en `review`. Staging et toute opération Git distante, d'intégration,
de réalignement ou destructive restent exclus.

## Point de départ observé

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/s2-20-binding`.
- Branche/base/HEAD initial : `task-session-binding` / `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2`.
- Dirty antérieur au Build : projections Sprint modifiées (`PLAN-GENERAL.md`,
  `docs/product/releases/0.1.md`, `sprint.md`) et nouveaux documents Sprint/APEX. Ces projections
  sont conservées et ne sont pas des cibles métier de DA20-003.
- MT : `DA20-003` relue `in_progress` après le démarrage réel d'Analyze.
- Session enfant : `01a07b7a-fde8-76f0-ae19-64a99c75fd32`; routage parent attesté
  `gpt-5.6-sol/high`, sans signal de substitution dans l'API de création.

## Autorités et patterns pertinents

- `@opencode-ai/schema` porte les contrats sérialisables browser-safe ; un nouveau contrat public
  doit y être défini avec identifiants stables, champs readonly et chemins `AbsolutePath`.
- SQLite/Drizzle dans `@opencode-ai/core` porte déjà `project`, `workspace` et `session`. La table
  `session` contient `project_id`, `workspace_id` et `directory`, mais aucun identifiant MT/APEX ni
  identité Git durable (`docs/product/architecture.md`).
- `SessionStore.get` fournit l'autorité persistée pour `sessionID`, `projectID` et `Location.Ref`.
- `LocalContext.inspect` mesure sans mutation le répertoire canonique, le dépôt (`top_level`,
  `common_directory`), la branche et le HEAD. DA20-003 doit persister des valeurs validées, pas
  réimplémenter cette observation ni gérer l'ownership réservé à DA30-004.
- Les migrations sont générées depuis les tables `*.sql.ts` par
  `bun run script/migration.ts --name <nom>` dans `packages/core`; la vérification canonique est
  `bun run script/migration.ts --check`.
- Les services Core globaux emploient `Context.Service`, une couche Effect et `makeGlobalNode` ; les
  tests d'intégration utilisent une base SQLite isolée et `testEffect`.

## Contrat recommandé

Créer un domaine `TaskBinding` :

1. contrat Schema versionné contenant MT task ID, external_ref APEX, session, projet, location,
   dépôt Git canonique, branche, worktree canonique et HEAD ;
2. table Core dédiée avec unicité indépendante de `mt_task_id`, `apex_external_ref` et `session_id`,
   plus FK vers projet/session ;
3. `adopt(identity)` crée le binding s'il est absent ou retourne l'existant s'il est exactement
   identique ;
4. `resume(identity)` ne crée rien et refuse absence ou toute divergence ;
5. validation de la session persistée avant toute écriture, puis comparaison de tous les candidats
   touchés par les clés uniques avant insertion ; les erreurs exposent les champs divergents et les
   identités attendue/observée.

Ce contrat sépare le binding immuable de l'ownership/lease futur. Le HEAD est le checkpoint attendu :
un changement n'est jamais adopté implicitement et doit être réconcilié explicitement par un futur
appelant au lieu de masquer une divergence.

## Régressions protégées

- création initiale et relecture durable après reconstruction du service ;
- rejeu exact idempotent sans seconde ligne ni mise à jour de timestamps ;
- refus explicite si session inexistante ou si son projet/location persistés divergent ;
- refus avant écriture pour collision de carte MT, external_ref ou session ;
- refus ciblé de chaque fait Git : dépôt, branche, worktree et HEAD ;
- migration générée et schéma complet synchronisés ; typecheck du package Core.

## Risques et limites

- L'existence réelle du checkout est observée en amont par `LocalContext`; ce service persiste et
  compare l'identité fournie, sans lancer Git.
- Aucun lease, lock, TTL, arbitrage d'écrivain ou réparation du checkout : DA30-004.
- Aucun endpoint/UI dans cette carte. DA10-003 pourra consommer le contrat Schema ; DA30-004 pourra
  dépendre du service Core.
- Aucun changement automatique du HEAD attendu n'est introduit : une divergence reste fail-closed.

## Décisions ouvertes

Aucune. Le scope et le mandat Sprint déterminent le comportement fail-closed et les limites.
