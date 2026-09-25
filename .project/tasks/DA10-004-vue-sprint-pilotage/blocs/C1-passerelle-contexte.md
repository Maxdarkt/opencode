# C1 — Passerelle de contexte pilote

## Correction

Le contexte d'exécution calculé par `getActiveTaskState` est maintenant transmis à `TaskPilotView`. L'observation accepte un statut MT optionnel : quand il manque, l'évaluateur reste `blocked:context_incomplete`; quand il est fourni par une future autorité, les transitions DA30-006 existantes sont inchangées. La carte expose aussi le contexte réellement observé (`concordant`, `incomplete`, `divergent`, `resuming`).

Cette passerelle ne fabrique ni statut MT ni phase APEX : `LocalContext.Info.task` ne les expose pas. Une liaison complète peut donc afficher un contexte concordant mais aucune prochaine action tant que l'autorité MT/APEX n'est pas ajoutée au protocole.

## Vérifications et Git

- PASS — tests ciblés : 8 tests, 41 assertions.
- PASS — `bun typecheck`, Prettier et `git diff --check`.
- Commit local : `2756edfc41a084bd963315ffdf748f881588e4d6` (`fix(app): pass task pilot context`), cinq fichiers, worktree propre.

## Smoke visuel parent requis

Le serveur `4096` et Vite `4444` actifs pointent sur `features/s3-integration`, non sur ce commit; cette tâche ne touche pas ce worktree. Après intégration parent de `2756edfc4`, exécuter la fixture à `1440×900` puis `1024×768` : vérifier le contexte concordant visible, l'action affichée seulement avec MT/APEX explicites, puis le blocage `context_incomplete` quand le statut MT est retiré. Conserver captures, route et HEAD dans la preuve parent.
