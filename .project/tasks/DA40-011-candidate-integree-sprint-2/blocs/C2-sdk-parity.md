# C2 — Parité SDK par génération canonique

## Résultat

C2 est interrompu : les deux générateurs canoniques réussissent, mais ne produisent aucun delta et
le typecheck OpenCode conserve exactement l'incompatibilité readonly/mutable observée en B4. Aucun
fichier généré n'a été édité manuellement.

## Commandes et pathset

- `packages/client`: `bun run generate` — PASS; aucun fichier modifié.
- `packages/sdk/js`: `bun run build` — PASS; génération OpenAPI/Hey API, format et compilation
  terminés; aucun fichier modifié.
- `packages/sdk/js`: `bun typecheck` — PASS.
- `packages/opencode`: `bun typecheck` — FAIL `TS2322` à
  `test/server/httpapi-public-openapi.test.ts:380`.
- Le fichier temporaire `packages/sdk/js/openapi.json` a été supprimé par le script; aucun artefact
  Client/SDK ne reste dirty.

Le pathset produit reste exactement celui de C1 : `packages/schema/src/local-context.ts` (2
insertions, 2 suppressions). L'index reste vide et `git diff --check` passe.

## Cause persistante et impact

Le générateur `@hey-api/openapi-ts` rend les tableaux OpenAPI comme `Array<...>` mutable dans
`LocalContextInfo`, indépendamment du caractère readonly du type décodé Effect Schema. Retirer
`Schema.mutable` satisfait l'hygiène Schema, mais la vérification bidirectionnelle directe entre
`LocalContext.Info` et `LocalContextInfo` traite alors la différence de mutabilité comme une
divergence de contrat.

Les tests ciblés supplémentaires n'ont pas été relancés après le typecheck rouge, conformément à la
condition d'arrêt. La dette `event-manifest` reste séparée et inchangée. B4 et B5 restent fermés.

## Reprise

Une correction source bornée doit exprimer la parité de forme sans exiger une mutabilité identique,
ou modifier le générateur de façon générique et justifiée. Ne pas modifier directement
`src/v2/gen`. Après correction, rejouer ses checks ciblés puis B4 en entier.
