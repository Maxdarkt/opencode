# B2 — Reprise et refus ciblés

## Résultat

`packages/core/test/task-binding.test.ts` couvre cinq parcours et 53 assertions :

- validation des identifiants stables non vides ;
- création d'une ligne, adoption exacte idempotente sans mutation de timestamp, lecture par MT,
  external_ref et session, puis reprise exacte ;
- refus sans écriture d'une session absente et d'un binding absent ;
- refus avant écriture d'un projet ou d'une location persistée divergents ;
- refus par `adopt` et `resume` de chaque divergence MT, external_ref, session, dépôt, branche,
  worktree et HEAD, avec ligne persistée inchangée.

## Correction bornée

Le premier lancement a échoué avant le service car deux fixtures `Workspace.ID` n'utilisaient pas le
préfixe canonique `wrk_`. Les fixtures ont été corrigées ; aucun changement de contrat n'a été requis.

## Checks

- `bun typecheck` dans `packages/core` : PASS.
- `bun test test/task-binding.test.ts` : PASS, 5 tests / 53 assertions.
- `bun test test/task-binding.test.ts test/local-context.test.ts test/database-migration.test.ts` :
  PASS, 29 tests / 106 assertions avant l'ajout des trois assertions de validation non vide ; le test
  ciblé final reste vert après cet ajout.

## Déviation / reste

Aucune. Le smoke technique doit maintenant rejouer le parcours avec les checks finaux et consigner
la frontière parent/consommateurs.
