# Contrat consommateur DA10 — contexte local

API réelle ajoutée au backend V1 qualifié : GET /global/context. RootHttpApi applique Authorization et SchemaErrorMiddleware ; aucun InstanceContextMiddleware ni WorkspaceRoutingMiddleware sur cet endpoint. /path et /vcs historiques restent disponibles. SDK legacy régénéré : `client.global.context({ directory, base_ref, session_id })` depuis @opencode-ai/sdk/v2. Ne pas présumer cette méthode sur `api` compatible V2 de server-compat ; DA10 choisit explicitement le client legacy du backend V1 qualifié. Le contrat de données canonique est @opencode-ai/schema/local-context.

`directory` est obligatoire ; query explicitement encodée, chemin absolu requis. Le SDK peut avoir un autre directory par défaut : celui de cette requête prime, test de transport dédié. Pas de fallback cwd, Project.ID ou staging. `base_ref` optionnelle doit provenir d’une configuration/décision explicite du consommateur ; HEAD est seulement utilisé dans les fixtures. `session_id` optionnel doit être un ID existant à comparer, jamais une identité inventée.

- requested_directory : texte demandé, conservé.
- canonical_directory : realpath effectivement observé ou null. availability : available / absent / inaccessible / not_directory / invalid.
- session_directory : valeur persistée lue par Session.Service.get ; session_canonical_directory : realpath observable correspondant ou null.
- session_status : not_requested / found / missing / unavailable / workspace. Une session portant un workspace reste hors qualification locale, sans routage réseau.
- concordance : not_applicable sans session, matches ou mismatch seulement pour une session locale et deux chemins observables ; unknown sinon. Ne pas confondre une égalité textuelle avec une preuve canonique.
- git null si dossier indisponible. Sinon status available / non_git / unavailable ; top_level, git_directory, common_directory identifient le checkout effectivement lu.
- branch/head nullable ; head_status branch / detached / unborn / unknown. Detached porte branch=null et conserve HEAD.
- base_ref conservée, base_oid seulement après résolution en commit ; base_status not_requested / resolved / unresolved. Aucun fallback silencieux.
- dirty et conflicts nullable si statut incomplet. review clean seulement avec base résolue, HEAD et commandes fiables, working tree propre et diff base vide ; changed sinon ; conflicts si index non fusionné ; incomplete si preuve manquante. Base absente ne signifie jamais clean.

Erreurs de domaine décrites dans la réponse 200 ; requête manquante/invalide 400 et auth manquante 401 selon middleware. Erreur DB de session => unavailable ; ID absent => missing. L’observation concerne le directory demandé, même si session_directory diffère ; aucune réaffectation de session n’est effectuée.

Cette lecture ne crée ni projet, .git, branche, worktree ou réservation. Elle ne constitue pas un snapshot transactionnel, un lease, une admission V2, une garantie de quiescence ni une autorisation d’écriture. Elle reste susceptible de changer après réponse. API locale : aucun routage distant ni réparation de placement livré.

B05 : les champs nullables décrits ci-dessus sont toujours requis dans JSON et dans LocalContextInfo généré. La projection OpenAPI conserve le composant canonique ; les 13 unions null et l’assignabilité bidirectionnelle Schema/SDK sont contrôlées par test/typecheck.
