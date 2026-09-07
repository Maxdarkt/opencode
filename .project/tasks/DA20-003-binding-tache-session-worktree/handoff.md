# Handoff enfant — DA20-003

## Résultat

Le binding local durable version 1 est implémenté dans Schema/Core/SQLite. `adopt` crée ou rejoue
exactement une identité ; `resume` exige une identité existante et exacte. Toute divergence de carte,
external_ref, session, projet/location, dépôt, branche, worktree ou HEAD est refusée avant écriture et
retourne les champs divergents.

## Consommateurs

- DA30-004 : composer `TaskBinding.Service` avec son ownership/lease ; appeler `resume` avant toute
  acquisition/exécution et traiter `ConflictError` comme fail-closed.
- DA10-003 : consommer `@opencode-ai/schema/task-binding` pour afficher l'identité complète et les
  champs de divergence ; aucun statut UI n'est inventé par ce contrat.
- DA40-011 : intégrer le commit local indiqué dans le STATE/handoff final, puis rejouer migration,
  typechecks et tests ciblés.

## Preuves

- `verify.md` : critères d'acceptation et checks.
- `smoke-report.md` : smoke technique et plan visuel parent complet.
- `problems.md` : rouge Schema global préexistant, hors périmètre et reproduit sur baseline.
- Commit : à renseigner après la création locale immédiatement suivante ; le STATE final et le message
  parent portent le hash autoritatif.

## Reprise

Si le parent refuse le smoke visuel ou découvre une divergence d'intégration, remettre MT en
`in_progress`, relire `STATE.md` et rouvrir un bloc de correction borné dans
`packages/core/src/task-binding.ts` / `packages/core/test/task-binding.test.ts`. Aucun push, merge,
rebase, promotion ou nettoyage de worktree n'a été exécuté.
