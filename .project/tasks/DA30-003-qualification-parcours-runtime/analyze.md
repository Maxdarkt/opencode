# Analyze — DA30-003
2026-09-06, HEAD 702bf7dcd7468638c17fd95b110deb38bd253e9a. MT DA40-003 done relu ; DA30-003 in_progress relu (95dd423f-ac85-44a3-ac37-0f9001f0be3e). Héritage dans evidence/initial-dirty.json.

Objectif : qualifier le parcours client local et les points de contrôle pour un futur binding/lease. Non-code : aucun registre, moteur, benchmark, fournisseur réel ni modification serveur.

Constats : submit.ts:620 → server-sdk.tsx:430 → server-compat.ts:200-201 → session.promptAsync historique. La compatibilité dépend du protocole détecté (server-compat.ts:86-91). GET /global/health sur API4140 renvoie healthy:true : detectServerProtocol choisit donc V1 (server-protocol.ts:28). Session V1 pour cette instance ; les imports sdk/v2 ne classifient pas le moteur. L’admission V2 est handlers/session.ts:140, pas handlers/message.ts. LocationMutation canonise des chemins mais n’autorise pas seule la mutation. Le Bash V2 annonce explicitement les droits de l’utilisateur hôte ; le scanner est consultatif. PTY et outils applicatifs exigent une qualification distincte.

Risques : confondre route observée et source ; croire à une protection shell universelle ; déclarer la quiescence depuis un timeout ; partager node_modules entre worktrees. Régression : aucune source produit modifiée ; empreintes avant/après. API live existante seulement en GET, sans prompt. Les tests locaux utilisent fixtures sans credentials.

Gate Analyze validée de façon autonome dans le mandat enfant : périmètre, dépendance et risque fixés. Découverte V1 transmise immédiatement au parent. Aucun élargissement produit requis.
