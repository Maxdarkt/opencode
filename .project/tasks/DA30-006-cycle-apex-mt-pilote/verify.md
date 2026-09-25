# Verify — DA30-006

## Critères d'acceptation

| Critère | Preuve | Résultat |
| --- | --- | --- |
| Cycle durable | Analyze, Plan, B1/B2, Smoke et ce Verify dans l'unique dossier APEX stable | PASS enfant |
| Statuts distincts | MT `in_progress` conservé pendant les phases; contrat sépare phase/statut et réserve `review → done` au parent | PASS enfant |
| Reprise idempotente | évaluateur pur, même entrée/même sortie, aucune I/O; test dédié | PASS |
| Commande pilote | `opencode task pilot` produit JSON pour huit parcours et trois refus | PASS |
| Couples incohérents | contexte divergent/pending et statut/phase invalide sont fail-closed | PASS |
| Contrat DA10-004 | `phase-contract.md` v1 publié avant Build UI | PASS |

## Vérifications finales

- `bun typecheck` depuis `packages/schema` : PASS.
- `bun test test/task-pilot.test.ts` puis `bun typecheck` depuis `packages/core` : PASS, 3 tests / 15 assertions.
- `bun typecheck` depuis `packages/opencode` : PASS.
- `bunx oxlint --deny-warnings` sur les cinq fichiers fonctionnels : PASS, 0 erreur/warning.
- `bunx prettier --check` sur les six fichiers modifiés : PASS.
- `git diff --check` : PASS.
- Smoke CLI : huit actions admises et trois refus conformes : PASS.

## Dette et limite

Aucune dette actionnable en périmètre. La découverte DA30-007 est une limite documentée : la
composition Sprint doit venir des IDs MT autoritatifs et le coût sans provenance doit rester
`unknown`; DA30-006 n'a créé ni faux cache ni calcul. Aucun scope supplémentaire ni carte MT n'est
créé.

## Limite parent

Le smoke visuel, l'intégration inter-worktrees et la clôture `review → done` restent explicitement
au parent. Une correction UI ou une source live MT/APEX est une reprise/extension à traiter dans le
chat propriétaire après sa relecture.
