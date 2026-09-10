# C1 — Correction contract-hygiene

## Cause et décision

Le contrat `LocalContext.Info` ajouté par DA10 enveloppait `effects` avec `Schema.mutable`, alors que
les contrats Schema courants interdisent explicitement ce wrapper et que le contrat canonique
`TaskExecution.Snapshot` utilise directement `Schema.Array(EffectInfo)`. La suite B4 avait donc un
troisième échec Schema, distinct des deux échecs `event-manifest` hérités.

La correction bornée retire uniquement `Schema.mutable` dans
`packages/schema/src/local-context.ts`. Les champs, valeurs acceptées et consommateurs restent
inchangés. Aucun test n'est ajouté : `contract-hygiene.test.ts` couvre déjà exactement l'interdit,
et les parcours local-context/HTTP/App couvrent le comportement affecté.

## Diff et impact

- Fichier fonctionnel modifié : `packages/schema/src/local-context.ts`.
- Diff : 2 insertions, 2 suppressions; `effects` reste un `Schema.Array` des mêmes objets
  `{ effectID, state }`.
- Aucune autre occurrence `Schema.mutable` dans `packages/schema/src`.
- Aucun fichier généré, migration ou manifeste d'événements modifié.
- La dette `event-manifest` n'est ni corrigée ni requalifiée par C1.

## Vérifications

- Schema `contract-hygiene` ciblé : PASS — 5 tests, 10 assertions.
- Schema `bun typecheck` : PASS.
- Core `local-context` : PASS — 7 tests, 31 assertions.
- HTTP ciblé (`control-plane`, `global`, `local-context`) : PASS — 7 tests, 27 assertions.
- App ciblée (`active-task-context-state`, `active-task-write-guard`, `prompt-input/submit`) : PASS —
  13 tests, 46 assertions.
- `git diff --check` : PASS; index vide.

## Reprise

C1 est terminé sans commit, sur HEAD `9d0decb2be8abd1d7e7a31b28117572b0d873606`. Reprendre B4 en
entier sur ce HEAD avec le diff C1 présent, en isolant toujours les deux échecs `event-manifest`, et
ne commencer B5 qu'après réussite de tous les contrôles B4 restants.
