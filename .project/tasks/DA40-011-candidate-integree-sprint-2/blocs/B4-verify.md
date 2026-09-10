# B4 — Vérification intégrée interrompue

## Résultat

B4 est arrêté au premier écart nouveau, sans correction. Le HEAD vérifié reste
`9d0decb2be8abd1d7e7a31b28117572b0d873606` (tree
`0b927e585cc947b682e053918d282d4f02ace6a4`). La suite Schema compte trois échecs : les deux
`event-manifest` hérités et un échec supplémentaire d'hygiène de contrat.

Échec nouveau exact :

- `contract hygiene > current source avoids Any and mutable contract wrappers` ;
- motif interdit : `Schema.mutable` ;
- occurrence unique : `packages/schema/src/local-context.ts:25` ;
- introduction : commit candidat DA10 `07d9680277a4d45a29e2af5deacb34329136a91e`
  (`feat(app): show active task context`, source `bafde2951518309d176809fc460dddd7386da3a5`).

## Contrôles exécutés

- Core ciblé : PASS — 44 tests, 176 assertions.
- Core complet : PASS — 1123 tests, 3143 assertions, 147 fichiers.
- Core typecheck : PASS.
- Migration Core `--check` : PASS.
- Schema typecheck : PASS.
- Schema complet : FAIL — 12 tests passent, 3 échouent, 42 assertions.
- Schema `event-manifest` isolé : FAIL attendu — exactement 2 tests, 16 assertions.
- Schema `contract-hygiene` isolé : FAIL nouveau — 4 passent, 1 échoue, 10 assertions.
- HTTP ciblé : PASS — 7 tests, 27 assertions.
- App ciblé : PASS — 13 tests, 46 assertions.
- Typechecks OpenCode et App : PASS.
- `git diff --check` : PASS ; index vide ; aucun dirty sous `packages/`.

## Contrôles non exécutés et reprise

Conformément au stop condition du plan, la génération Client, le build SDK, le lint/format ciblé et
le smoke B5 n'ont pas été lancés. Aucun fichier produit n'a été modifié et aucune correction n'a été
absorbée.

Le parent a ensuite autorisé C1; le retrait borné de `Schema.mutable` et ses checks ciblés sont
documentés dans `C1-contract-hygiene.md`.

## Recheck après C1 — nouvel arrêt

Le rejeu complet a été repris sur le même HEAD avec C1 présent. Les premiers contrôles donnent :

- Core ciblé : PASS — 44 tests, 176 assertions.
- Schema et Core typechecks : PASS.
- Migration Core `--check` : PASS.
- HTTP ciblé : PASS — 7 tests, 27 assertions.
- App ciblée : PASS — 13 tests, 46 assertions.
- App typecheck : PASS.
- OpenCode typecheck : FAIL dans `httpapi-public-openapi.test.ts:380`.

Le contrat Schema expose maintenant `task.execution.effects` en tableau `readonly`, tandis que
`LocalContextInfo` dans `packages/sdk/js/src/v2/gen/types.gen.ts:3088` l'expose comme `Array<...>`
mutable. L'assignation bidirectionnelle de parité Schema/SDK refuse donc `LocalContext.Info` vers
`LocalContextInfo`. Cet écart est nouveau et distinct de `event-manifest`.

La stop condition a de nouveau été appliquée : suites complètes Core/Schema, génération Client,
build SDK et lint/format non lancés sur ce rejeu. Aucun autre code n'a été modifié. Reprise : le
parent doit borner un éventuel C2; B4 reste incomplet et B5 fermé.

## Recheck final après C1/C3 — arrêt lint/format

Le rejeu final atteint les résultats suivants :

- Core ciblé : PASS — 44 tests, 176 assertions.
- Core complet : PASS — 1123 tests, 3143 assertions, 147 fichiers.
- Schema typecheck : PASS.
- Schema complet : 13 tests passent, exactement 2 échouent, 42 assertions; les deux échecs sont
  exclusivement `public event manifest`, dette héritée suivie par DA30-005.
- Core typecheck et migration `--check` : PASS.
- HTTP ciblé : PASS — 7 tests, 27 assertions.
- OpenAPI/parité ciblé : PASS — 19 tests, 207 assertions.
- App ciblée : PASS — 13 tests, 46 assertions.
- Typechecks OpenCode et App : PASS.
- Client `bun run generate` : PASS, aucun delta.
- SDK `bun run build` et `bun typecheck` : PASS, aucun delta ni temporaire résiduel.
- `git diff --check` : PASS.
- Oxlint ciblé sur 27 sources intégrées : FAIL — 43 avertissements, 0 erreur, dans cinq fichiers
  App (`session.tsx`, `project-context-view.tsx`, `prompt-input/submit.ts`,
  `active-task-write-guard.test.ts`, `prompt-input/submit.test.ts`).
- Prettier ciblé : FAIL — `active-task-write-guard.ts` et
  `active-task-write-guard.test.ts` ne sont pas au format attendu.

Le contrôle étant exécuté avec `--deny-warnings` et seules les deux dettes `event-manifest` étant
tolérées, B4 reste incomplet. Aucun formatage ou correctif lint n'a été absorbé. Le pathset produit
reste strictement C1/C3 (deux fichiers, 14 insertions et 6 suppressions); aucun généré n'est dirty.
B5 reste fermé.
