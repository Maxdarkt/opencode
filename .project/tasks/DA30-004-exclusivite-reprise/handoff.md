# Handoff enfant — DA30-004

## Résultat

`TaskExecution.Service` compose le binding durable DA20-003 avec une propriété SQLite unique par
tâche, session et worktree. Le propriétaire actif porte une génération monotone; toute ancienne
génération est fenced. Les effets sont admis `pending` avant mutation et ne sont rejoués qu'après
observation explicite `absent`; `confirmed` est conservé et `uncertain` bloque la reprise.

## Contrat consommable

- Schema : `@opencode-ai/schema/task-execution` ou namespace racine `TaskExecution`.
- Core : `@opencode-ai/core/task-execution` avec `TaskExecution.Service`.
- Lecture UI : `get(mtTaskID)` retourne le jeton actif (`mtTaskID`, `sessionID`, `worktree`,
  `ownerID`, `generation`) et la liste ordonnée des effets `pending|confirmed`.
- Admission : `acquire(identity, ownerID)` doit recevoir l'identité complète DA20-003; un conflit
  expose `fields`, `expected` et `observed`.
- Frontière métier : appeler `begin(token, effectID)`; exécuter seulement sur `execute`, ne rien
  refaire sur `confirmed`, puis appeler `confirm` après preuve de l'effet.
- Reprise : fournir l'ancien jeton exact, le nouveau `ownerID` et une résolution pour chaque effet
  pending. `UncertainEffectsError` est fail-closed; `InvalidReconciliationError` signale des preuves
  dupliquées ou superflues; `ConflictError` signale ownership/fencing divergent.

## Contrat DA10-003

Afficher l'identité de binding et le snapshot ownership sans transformer `pending` en échec ou en
absence. L'UI doit distinguer conflit d'identité, conflit de propriétaire/jeton, effet incertain et
preuve invalide. Elle ne doit proposer ni vol implicite, ni TTL, ni réparation Git automatique. Les
actions de reprise doivent conserver l'observation utilisateur/système explicite et afficher la
nouvelle génération seulement après succès.

## Preuves et reprise

- Build : `blocs/B1-contract-ownership.md`, `blocs/B2-effect-recovery.md`.
- Checks et critères : `verify.md`.
- Smoke technique et plan parent : `smoke-report.md`.
- Dette héritée : `problems.md`.

En cas de correction parent, remettre la carte en `in_progress` et reprendre depuis le snapshot
fautif dans `packages/core/src/task-execution.ts` / `packages/core/test/task-execution.test.ts`.
Aucun push, merge, rebase, staging, reset, nettoyage ou suppression de worktree n'a été exécuté.
