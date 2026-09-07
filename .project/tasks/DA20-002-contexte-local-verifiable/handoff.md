# Handoff review — DA20-002

Implémentation achevée, proposée à la réception parent 01a076a4-b458-72a3-8e2b-bf975091a840. Enfant 01a076cd-06bc-73f2-9c81-637d148a4d47. Aucun commit/done/archive enfant.

## Comportement livré
Endpoint authentifié GET /global/context?directory=...&base_ref=...&session_id=... ; SDK legacy client.global.context. Lecture explicite hors initialisation InstanceStore. Chemins demandé/canonique/session persistée distincts ; disponibilité, identité checkout, HEAD/branche/detached/unborn, base demandée/résolue/inconnue et revue complète/incomplète. Clones même origin distincts ; session mismatch exposé sans substitution ; aucun initGit ni création de branche/worktree. Contrat complet et limites : contrat-contexte.md.

## Diff exact
15 chemins produit. evidence/candidate.patch inclut les fichiers nouveaux ; candidate-sha256.json identifie la candidate corrigée B05. Candidate antérieure conservée dans evidence/b04-candidate*. B05 ne change que public.ts, le test public OpenAPI et types.gen.ts généré. APEX et cellule DA20 locale restent séparés du patch produit.

- packages/core/src/local-context.ts
- packages/core/test/local-context.test.ts
- packages/opencode/src/server/routes/instance/httpapi/groups/global.ts
- packages/opencode/src/server/routes/instance/httpapi/handlers/global.ts
- packages/opencode/src/server/routes/instance/httpapi/public.ts
- packages/opencode/src/server/routes/instance/httpapi/server.ts
- packages/opencode/test/server/httpapi-control-plane.test.ts
- packages/opencode/test/server/httpapi-exercise/index.ts
- packages/opencode/test/server/httpapi-global.test.ts
- packages/opencode/test/server/httpapi-local-context.test.ts
- packages/opencode/test/server/httpapi-public-openapi.test.ts
- packages/schema/src/local-context.ts
- packages/sdk/js/src/v2/gen/sdk.gen.ts
- packages/sdk/js/src/v2/gen/types.gen.ts
- packages/sdk/js/test/local-context.test.ts

## Validation
39 tests pass : Core 11, HTTP/OpenAPI 26, SDK 2 (cumul initial et B05). Schema/Core/opencode/SDK typecheck pass. Lint 0 warning/error, formatter et whitespace pass. SDK legacy généré officiellement avec seulement 2 artefacts diff ; client generate pass sans diff. HTTP exerciser effect/auth : PASS global.context, missing=0 extra=0 sur inventaire 189 routes. Smoke sur checkout réel conforme à Git. Toutes commandes reproductibles, cwd et sorties dans evidence/checks.json et logs homonymes ; wrapper run-check.py utilise une allowlist sans credentials fournisseurs.

Non-initialisation : middleware contractuel exclut InstanceContext/WorkspaceRouting, assertions tests ; état filesystem cible inchangé non-Git/absent ; index/HEAD/refs inchangés normal et conflit. Session persistée créée explicitement par fixture avant lecture. Ne pas étendre la preuve aux écritures globales ordinaires au démarrage du backend.

## Git et dette
Branche 20-workspace-git, HEAD 702bf7dcd7468638c17fd95b110deb38bd253e9a ; dirty voulu, index vide, lockfile inchangé. 31 fichiers baseline, seuls STATE propre et plan changés, aucun inattendu (evidence/preservation.json). Aucun serveur existant touché et aucune nouvelle instance live ; aucun appel modèle.
D1 faible : hôtes Windows/Linux non qualifiés, propriétaire parent/DA20 lors d’une extension de plateforme ; réouverture avant revendication de support testé. Aucun correctif en scope restant. Aucun lease ou snapshot atomique ; workspace de session non qualifié => unknown.

## Réception et prochaine étape
Parent reçoit sur preuves techniques, conformément au mandat. Pass B complet dans smoke-report.md ; branchement réel/visuel avec DA10 après acceptation, dans sa candidate et son environnement identifiés. Ne pas présenter UI4440/API4140 de 40-tooling comme contenant ce patch. Parent seul commit local borné, done/archive et synchronisation canonique/projections du sprint. Correction : B06 après retour parent, contrôles affectés puis nouveau handoff review.

## Correction B05 réceptionnée techniquement
La projection OpenAPI legacy retirait les null du schéma canonique. LocalContext.Info est préservé, le SDK officiellement régénéré conserve les 13 champs requis nullables. Nouvelle régression OpenAPI + assignabilité TypeScript bidirectionnelle : rouge avant correction, verte après. Logs b05-red-* conservés comme échecs attendus de démonstration ; contrôles finaux b05-* exit0. Voir blocs/B05.md. Aucun changement runtime, de route ou de comportement filesystem dans ce bloc.
