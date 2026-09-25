# Verify — DA30-008

## Checks

- SDK v2 régénéré : `bun packages/sdk/js/script/build.ts` — PASS.
- Typechecks Schema, Core, OpenCode, App et SDK : PASS.
- Tests ciblés Core, HTTP LocalContext/OpenAPI et pilote App : PASS.
- Prettier ciblé, `git diff --check` : PASS.
- Oxlint ciblé : 0 erreur; 1 warning préexistant dans `packages/opencode/test/server/httpapi-global.test.ts:171` (`no-unsafe-type-assertion`), non créé par ce changement.

## Dette

Pas de dette dans le périmètre. Le test global App (`bun run test:unit`) reste rouge sur `desktop-native.test.ts` pour `pa-PK` attendu `pa` / reçu `en`, hors pathset; le test ciblé du pilote est vert. À conserver comme anomalie préexistante, sans masquer le résultat.
