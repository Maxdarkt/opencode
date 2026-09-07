# C3 — Parité de contrat indépendante de la mutabilité des tableaux

## Résultat et périmètre

La vérification type-level bidirectionnelle entre `LocalContext.Info` et `LocalContextInfo` reste
stricte sur la forme, les clés, les propriétés requises, l'optionalité et les unions nulles. Elle
normalise désormais uniquement les tableaux mutables/readonly avec le type récursif
`NormalizeArrayMutability<T>`.

Le mapped type conserve les modificateurs de propriétés par défaut et distribue les unions. Les
deux assignations sont normalisées symétriquement; une divergence de clé, d'optionalité ou de
nullabilité reste donc rejetée dans au moins une direction. Un commentaire dans le test documente
la limite contrôlée entre Effect Schema et le générateur OpenAPI.

## Fichiers et diff

- `packages/opencode/test/server/httpapi-public-openapi.test.ts` : utilitaire type-level et deux
  signatures de parité adaptées, 12 insertions/4 suppressions.
- `packages/schema/src/local-context.ts` : diff C1 inchangé, 2 insertions/2 suppressions.
- Aucun fichier Client/SDK généré ou générateur modifié; aucun artefact temporaire.

Une première signature asymétrique faisait passer le test runtime mais échouait lors de sa
composition au typecheck. La normalisation symétrique finale corrige uniquement ce point, sans
affaiblir les dimensions contractuelles exigées.

## Vérifications

- Test OpenAPI ciblé : PASS — 19 tests, 207 assertions.
- Typecheck OpenCode : PASS.
- Schema `contract-hygiene` : PASS — 5 tests, 10 assertions.
- Core `local-context` : PASS — 7 tests, 31 assertions.
- HTTP ciblé : PASS — 7 tests, 27 assertions.
- App ciblée : PASS — 13 tests, 46 assertions.
- Typechecks Schema, Core, App et SDK : PASS.
- Oxlint ciblé : PASS, 0 avertissement/erreur.
- Prettier ciblé et `git diff --check` : PASS.

## Reprise

C3 est terminé sans commit sur HEAD `9d0decb2be8abd1d7e7a31b28117572b0d873606`. Rejouer B4 en
entier avec les deux diffs C1/C3 présents, puis seulement ouvrir B5 si tous les contrôles passent
hors des deux échecs `event-manifest` hérités.
