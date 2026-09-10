# Raccordement autorisé et reçu

Source : 20-workspace-git commit 2d973aeaf6a289ba1f343663a758d7c70b1bcc11. Cible : /Users/leanbot/Documents/40_Daidalon/features/10-product-ui, branche 10-product-ui, HEAD 702bf7dcd7468638c17fd95b110deb38bd253e9a. Préserver dirty inventorié. Les 15 chemins ont été transférés par parent avec git restore après « oui go » utilisateur et sont staged ; empreintes/index revérifiés b05-preservation.json.

15 chemins produit source :

- `packages/core/src/local-context.ts`
- `packages/core/test/local-context.test.ts`
- `packages/opencode/src/server/routes/instance/httpapi/groups/global.ts`
- `packages/opencode/src/server/routes/instance/httpapi/handlers/global.ts`
- `packages/opencode/src/server/routes/instance/httpapi/public.ts`
- `packages/opencode/src/server/routes/instance/httpapi/server.ts`
- `packages/opencode/test/server/httpapi-control-plane.test.ts`
- `packages/opencode/test/server/httpapi-exercise/index.ts`
- `packages/opencode/test/server/httpapi-global.test.ts`
- `packages/opencode/test/server/httpapi-local-context.test.ts`
- `packages/opencode/test/server/httpapi-public-openapi.test.ts`
- `packages/schema/src/local-context.ts`
- `packages/sdk/js/src/v2/gen/sdk.gen.ts`
- `packages/sdk/js/src/v2/gen/types.gen.ts`
- `packages/sdk/js/test/local-context.test.ts`

Raccord : global.ensureServerCtx(conn).sdk.client.global.context({ directory, session_id, base_ref }) ; sdk.protocol doit être v1. Ne pas utiliser api compatible V2, ni générer localement un faux contrat. La requête doit inclure directory demandé et vérifier que la réponse appartient encore à la même sélection. Base fournie seulement si explicitement configurée.

Recette requise : candidate UI10 et backend contenant DA20, racines/HEAD/empreintes/ports identifiés. Une recette croisée UI10/API20 doit être nommée croisée ; aucun assemblage intégré prétendu. Nouvelle paire de ports à attribuer par parent, aucun redémarrage des instances 40. Le parent décide de toute opération Git distincte ; le SDK DA20 doit être disponible avant B03 compilable.

Candidate unique opérationnelle : 10-product-ui, UI4450/API4150 ; manifest.json fait autorité de recette. Aucun restart ni opération Git enfant.
