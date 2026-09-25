# Parcours runtime qualifié

Verdict : route locale **V1 identifiée**, fondations V2 qualifiées séparément. Faisabilité du contexte en lecture seule : oui. Garde écrivain Sprint 2 : conditionnelle ; protection universelle du shell par ces seuls contrôles : non faisable.

## Niveau de preuve
Manifest : racine auditée 30-agent-runtime, HEAD 702bf7dcd7468638c17fd95b110deb38bd253e9a. Instance observée dans 40-tooling : UI4440 (Node27516), backend4140 (Bun27514). GET health et UI = 200 ; cwd/listeners mesurés. Les 31 sources du parcours ont des SHA256 identiques entre les deux worktrees. Cela justifie la comparaison statique, pas une candidate intégrée ni un prompt live réussi. Les tests de route capturent des requêtes avec un fetch de fixture. Aucun fournisseur n’a été appelé ; aucun adaptateur n’a été observé pendant un tour modèle.

## Route pilote actuelle
1. Client : packages/app/src/components/prompt-input/submit.ts:168,620 utilise api.session.prompt. Le SDK directory est construit dans context/server-sdk.tsx:413-434.
2. Choix explicite : utils/server-protocol.ts:28 donne priorité au GET /global/health healthy:true. Cette réponse a été mesurée sur API4140. createCompatibleApi (server-compat.ts:86-91) choisit donc createV1Api ; si serveur V2 détecté, il choisirait current. Aucun choix déduit du layout ou du nom sdk/v2.
3. Conversion : server-compat.ts:200 appelle legacy.session.promptAsync ; sdk/js/src/v2/gen/sdk.gen.ts:4139 vise POST /session/{sessionID}/prompt_async. Le résultat compatible contient admittedSeq:0 fabriqué côté client (server-compat.ts:234), donc ce champ ne prouve pas une admission durable V2. delivery n’est pas transféré au prompt V1 comme la sémantique inbox V2.
4. Placement local : middleware/workspace-routing.ts:218-233 relit la session quand la route en possède une ; planRequest :182 privilégie session.directory, puis query directory/header x-opencode-directory, puis cwd. Un workspace explicite peut router vers une autre cible ; cela sort de la route locale retenue. instance-context.ts:29 charge le directory décodé dans InstanceStore. Le directory demandé par la UI n’est donc pas une preuve suffisante du placement d’une session existante.
5. Handler : handlers/session.ts:311-328 vérifie l’existence puis lance SessionPrompt.prompt dans une fiber du scope serveur et renvoie NoContent. Ce retour n’est pas une preuve d’achèvement métier ni d’arrêt des outils.
6. Moteur : packages/opencode/src/session/prompt.ts construit/persiste le message utilisateur, choisit agent/modèle et passe par sa boucle et SessionRunState (loop :1343-1346). Cette chaîne ne passe pas par SessionV2.prompt.
7. Adaptateur : session/llm.ts:224-280 : AI SDK par défaut, branche native seulement si experimentalNativeLlm, fallback AI SDK si unsupported. L’allowlist du lanceur DA40 ne configure pas OPENCODE_EXPERIMENTAL_NATIVE_LLM (runtime-flags.ts:54). Conclusion limitée : AI SDK attendu pour cette configuration ; adaptateur effectif par appel reste non mesuré. Exiger le log llm.runtime/provider/model avant toute campagne ultérieure.
8. Effets : outils historiques write/edit/apply_patch demandent edit/external_directory ; shell.ts:263-305,612-636 analyse puis autorise et lance un processus. Le terminal UI utilise aussi Core Pty via le handler historique handlers/pty.ts:5,69 ; le nom de route V1 ne signifie pas que chaque service sous-jacent est V1.

## Chaîne V2, distincte
POST /api/session/:sessionID/prompt est défini dans packages/protocol/src/groups/session.ts:205. SessionLocationMiddleware (server/middleware/session-location.ts) charge directory/workspace depuis SessionTable et fournit LocationServiceMap. handlers/session.ts:140 appelle SessionV2.prompt ; handlers/message.ts sert la lecture des messages.

core/session.ts:360-383 admet durablement SessionInput, réconcilie l’ID et la delivery exacts, puis wake sauf resume:false. Un retry exact peut réveiller une admission déjà commise ; il n’est pas une garantie exactly-once des effets externes. execution/local.ts:16-24 relit la session au début du drain et choisit locations.get(session.location). Le coordinateur est process-local et par Session ID ; deux sessions différentes peuvent tourner simultanément dans une même racine.

runner/llm.ts:179-181 interrompt si directory/workspace divergent, puis choisit agent/modèle, construit contexte, appelle llm.stream (:239), et règle les outils locaux ; providerExecuted est exclu du règlement local (:253). Les permissions restent dans les feuilles. Le guard de placement ne lie pas tâche, branche/HEAD, génération de lease ou exclusion interprocessus.

## Impact DA20/DA10
Présenter séparément directory demandé, directory canonique observé, directory persisté de session, disponibilité, branche/detached, HEAD et base Git connue/inconnue. Refuser de déclarer concordant si ces observations divergent. Ne pas transformer Project.ID ou un label de layout en identité de checkout. L’ouverture explicite du projet et la lecture de contexte peuvent avancer ; aucun lease ni contrôle universel d’écriture n’est livré par cette qualification.
