# Plan — DA40-013 — Candidate intégrée Sprint 3

## Mandat et limites

Mandat utilisateur Sprint 3, matérialisé par
[OP-DA40-013-integration](../../../../../../Daidalon/.project/journals/OP-DA40-013-integration.md),
sur le worktree local `s3-integration` et son HEAD
`442a1311f06d970ccbb1bc77bc9eda78f81c42d9`. Le travail couvre uniquement
validation, smoke technique et handoff; aucune mutation du produit n’est
prévue. Une correction ne serait permise que si elle demeure dans les 24
chemins intégrés, mais tout conflit fonctionnel ou check rouge suspendrait le
parcours et remonterait au parent.

## B1 — Validation de la candidate

1. Relever branche, HEAD, propreté, ancêtre et pathset cumulé des quatre
   commits; exécuter `git diff --check`.
2. Exécuter les typechecks et tests des paquets touchés : Schema, Core,
   OpenCode et App; conserver les commandes et résultats exacts.
3. Exécuter `bun run generate` dans `packages/client`, vérifier qu’il ne
   change pas le généré, puis typechecker le SDK JavaScript.
4. Contrôler format/diff et confirmer que ni sources hors pathset, ni
   projections APEX, ni fichiers d’environnement ne sont entrés dans la
   candidate.

## B2 — Smoke technique et handoff

1. Exercer la CLI `task pilot` avec MT `in_progress`, phase `analyze` et
   contexte `concordant`; le résultat attendu est `write_plan` sans mutation.
2. Réutiliser le test HTTP isolé de `TaskMetrics` (SQLite mémoire) et les
   tests d’état UI; vérifier les cas coût `unknown`, tâche non liée et
   observations bloquées.
3. Écrire `smoke-report.md`, `verify.md` et `handoff.md`; conserver la carte
   MT à `in_progress` jusqu’au handoff complet, puis la passer à `review` et
   relire. Le parent réalise seul le smoke visuel et la clôture.

## Vérifications et arrêt

Les suites exigées sont les commandes ciblées puis complètes des quatre
paquets touchés, génération client, typecheck SDK, diff-check et smokes B2.
Arrêt immédiat si le HEAD bouge de façon inattendue, si la génération produit
un delta non déterministe, si une suite requise est rouge, ou si la recette
nécessite un choix métier.
