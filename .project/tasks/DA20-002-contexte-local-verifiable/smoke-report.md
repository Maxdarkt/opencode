# Smoke technique et Pass B — DA20-002

## Pass A terminé
Candidate : branche 20-workspace-git, HEAD 702bf7dcd7468638c17fd95b110deb38bd253e9a et 15 chemins produit dirty dans evidence/candidate-files.json ; empreintes et patch associés. Les sources non suivies sont incluses dans le patch. Aucun commit enfant.

39 tests distincts passent : 11 Core (7 nouveaux + 4 régressions Git), 26 HTTP/OpenAPI (3 nouveaux + 23 régressions), 2 SDK (transport et histoire). Core/Schema/opencode/SDK typecheck exit0 ; lint 0 warning/error. SDK généré par script officiel exit0 ; client generate exit0, sans diff des clients courants. Chaque commande, cwd, durée, exit et log est dans evidence/checks.json et fichiers homonymes.

Smokes route effect et auth : GET /global/context PASS, 189 routes inventoriées, missing=0 extra=0 ; une seule route exécutée par mode. Exerciser et tests HTTP utilisent des serveurs de test éphémères gérés par les fixtures, aucune instance live supplémentaire. Aucun prompt fournisseur.

Smoke service sur le worktree réel : evidence/checkout-smoke.log. Canonique/top-level 20-workspace-git, branche conforme, HEAD/base HEAD conformes, dirty=true, conflicts=false, review=changed ; git_directory est celui du worktree lié, common_directory celui du dépôt source. Ces chemins sont lus seulement.

## Preuves de non-initialisation
Le test HTTP exige auth et directory explicite, inspecte un dossier non-Git puis un enfant absent et compare son contenu avant/après. Le contrat réellement enregistré contient Authorization, et exclut InstanceContextMiddleware et WorkspaceRoutingMiddleware (assertions de régression). RootHttpApi/global.context → LocalContext.inspect ; aucun InstanceStore, Project.fromDirectory ou initGit dans ce chemin. Session.get ne fait qu’une sélection SessionTable, sans InstanceState. La fixture session de test est créée explicitement par POST /session avant l’inspection, jamais par l’inspection elle-même.

Le service Core ne dépend que FSUtil/AppProcess. Ses commandes sont rev-parse, symbolic-ref, show-ref, status et diff --quiet ; aucun init/add/checkout/write-tree. optional-locks désactivés, fsmonitor désactivé, GIT_* hérités exclus, timeout 5s/commande, stdout borné 1MiB. Fixtures vérifient index/HEAD/refs avant/après pour contexte normal et conflit. Ne pas étendre cette preuve aux écritures normales du backend dans ses propres données globales au démarrage.

## Matrice validée
Absent → availability absent, git null ; relatif → invalid ; fichier → not_directory ; permission → inaccessible ; non-Git → git.status non_git, review incomplete et aucun .git créé ; .git endommagé → unavailable ; symlink → requested conservé/canonique réel ; clones même origine → top-level distincts ; worktree lié → git/common distincts ; detached → HEAD présent/branch null ; unborn → HEAD null ; base omise/introuvable/option malveillante → incomplete ; base HEAD propre → clean ; changement committé depuis HEAD~1 → changed même sans dirty ; untracked → changed ; conflit → conflicts avec index inchangé ; session autre dossier → mismatch, non substituée ; session absente/workspace → unknown.

## Reproduction parent
Depuis /Users/leanbot/Documents/40_Daidalon/features/20-workspace-git, lancer `python3 .project/tasks/DA20-002-contexte-local-verifiable/evidence/run-check.py <nom> <paquet> <commande...>` ; environnement allowlist enregistré dans check-environment.json, Bun 1.3.14 exact DA40. Exemple : `... parent-http packages/opencode bun test test/server/httpapi-local-context.test.ts --timeout 30000`. Les commandes intégrales déjà utilisées sont dans checks.json ; chaque check exécute depuis le paquet, jamais tests racine. Aucune nouvelle installation nécessaire ; lockfile inchangé.

## Pass B parent
Mandat parent confirmé : réception DA20 sur preuves techniques, aucun démarrage live. L’instance UI4440/API4140 de 40-tooling ne contient pas cette candidate et ne doit pas être utilisée pour revendiquer ce contrat. Le parent relit le patch et les SHA, vérifie la matrice et reçoit le contrat ; jugement final, commit local borné et done lui appartiennent.

Pour DA10 après acceptation DA20 : intégrer les chemins autorisés dans son worktree selon décision parent, identifier backend réellement servi et SDK, puis faire le branchement visuel. Préconditions : serveur/candidate/ports explicitement identifiés ; base choisie explicitement ; dossiers de recette normal, non-Git, absent, detached, session mismatch. Actions : ouvrir/sélectionner chaque cible puis annuler/changer rapidement ; attendre la réponse correspondant à la dernière cible ; afficher chemins demandé/canonique/session, disponibilité, HEAD/branche/base et erreurs. Attendu : aucune substitution par Project.ID, aucun initGit à ouverture ou annulation, aucun état clean pour base inconnue, mismatch visible et aucune promesse de lease. Régression : navigation/rechargement, symlink, deux clones, réponse obsolète, erreur réseau/auth, workspace non qualifié. Preuves parent : captures de chaque état, requête et réponse correspondantes, manifest servi et mesures Git/filesystem avant/après. Ces actions visuelles restent à exécuter par le parent/DA10, elles ne sont pas déclarées pass ici.

Correction : STATE → B05 borné après retour parent, checks affectés puis nouveau handoff ; aucun commit/done/archive enfant.

## B05 — nullabilité du contrat corrigée
La candidate actuelle inclut la correction de projection OpenAPI demandée par le parent. Les 13 propriétés NullOr restent requises et nullables dans le SDK officiellement généré. Nouveau test de contrat : échec runtime OpenAPI + échec typecheck avant correction ; 21 tests HTTP/OpenAPI, 2 SDK, typechecks opencode/SDK et lint/format passent après. Les deux logs b05-red-* sont des échecs diagnostiques attendus conservés. La matrice runtime/Pass B précédente reste applicable ; aucun runtime modifié.

## Verdict Pass B parent — 2026-09-06
Le parent `01a076a4-b458-72a3-8e2b-bf975091a840` a reçu la candidate technique sans lancer de serveur supplémentaire.

- Les 15 fichiers de `candidate-files.json` correspondent tous aux SHA256 publiés ; index vide et `git diff --check` vert.
- Le parent a rejoué les tests Core du contexte local (7), les tests HTTP de la route (2) et le test SDK de transport (1), tous verts avec Bun 1.3.14.
- La revue a détecté une perte de nullabilité dans la projection OpenAPI legacy. B05 a reproduit le défaut avec deux preuves rouges, corrigé la projection canonique sans modifier le schéma ni rendre les propriétés facultatives, puis régénéré officiellement le SDK.
- Après B05, le parent a rejoué `httpapi-public-openapi.test.ts` : 19 tests et 207 assertions passent, dont la conservation des 13 champs requis et nullables. Le typecheck OpenCode passe et verrouille l’assignabilité bidirectionnelle Schema/SDK.
- Les garanties d’absence d’`InstanceStore`, d’initialisation Git et de substitution du placement de session restent démontrées par le contrat, les tests et les snapshots filesystem/Git.

Verdict : **accepté après B05**. La qualification visuelle du branchement et des états UI est transmise à DA10-002 ; aucun état intégré n’est revendiqué dans DA20.
