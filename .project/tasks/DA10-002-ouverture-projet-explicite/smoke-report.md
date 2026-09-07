# Smoke technique et plan visuel — DA10-002 review

## Candidate et préconditions
Candidate unique /Users/leanbot/Documents/40_Daidalon/features/10-product-ui, branche 10-product-ui, HEAD 702bf7dcd7468638c17fd95b110deb38bd253e9a + 15 chemins DA20 staged autorisés + UI unstaged. Source DA20 2d973aeaf6a289ba1f343663a758d7c70b1bcc11. manifest.json, candidate-files/sha256 et preservation identifient l'état exact.
UI http://127.0.0.1:4450 ; API http://127.0.0.1:4150 ; PID backend58716/client listener58718/lanceur58717. Instances 4140/4440 intactes. Allowlist/fixtures isolées sous evidence/runtime, aucun fournisseur payé.

## Preuves acquises
Typecheck final vert ; 41 tests ciblés/parité verts (1087 assertions). Suite globale précédente 735/2 avec parité ensuite corrigée et baseline pa-PK conservée. API réelle api-smoke.json : requested/canonical racine, branche/HEAD concordants Git, base HEAD résolue, absent et .git absent dans fixture vide.
Parent 01a076a4-b458-72a3-8e2b-bf975091a840 rapporte PASS visuel FR : « Ajouter un projet », ouverture runtime/home, bandeau actif, détails requested/canonical/checkout/branche/HEAD, base HEAD résolue. Cette réception précède les derniers ajustements confirmation/bundle commun.
Automatisation navigateur non déclarée PASS : erreurs de locators locale/strictness puis bouton disabled dans browser-smoke.log, corrigé ensuite pour confirmer selon DA20. Aucun smoke supplémentaire exécuté après instruction parent. Les défaillances 401/réseau/recovery du script ne sont donc pas une preuve live acquise ; leurs tests transport unitaires passent.

## Pass B parent / corrections à recevoir
1. Relever URLs, cwd/PID, HEAD/index/empreintes ; utiliser data-action home-add-project-row pour éviter icône/ligne ambiguës ; locale FR affiche « Ajouter un projet », champ « Rechercher des dossiers » et « Sélectionner le dossier ».
2. Saisir fixture evidence/runtime/empty puis Entrée ; contexte indique available et chemin exact ; confirmation autorisée par DA20 indépendamment du chargement de l'arbre. Éditer vers empty/missing invalide l'ancien choix ; après Entrée, diagnostic absent et confirmation interdite. Annuler/Escape ne change pas sélection.
3. Confirmer vide puis vérifier .git absent avant/après, bandeau API4150/chemin actif correct, chat/panneaux conservés. Détails canonical, session, branch/detached, HEAD. Saisir HEAD explicitement et actualiser -> OID correct ; référence inexistante -> unresolved, effacer -> not_requested. Aucun clean implicite.
4. Changer dossier/serveur/session pendant réponse lente : ancien contexte ne réapparaît pas. Sessions existantes matching/mismatch : demandé et persisté distincts, aucun déplacement. Récent absent : historique conservé/diagnostic. Fixtures non-Git/detached/inaccessible à identifier explicitement ; ne pas appeler non-Git une fixture sous l'ancêtre Git 10.
5. Auth/network indisponibles : message typé, anciennes données effacées ; restauration + actualiser -> contexte frais. /provider 500 est limite séparée, ne pas envoyer de prompt modèle.
6. Vérifier rendu compact et accès aux détails/base, file picker, home/layout ancien/nouveau selon plateforme réellement servie. Source anglaise des nouveaux textes hérité par locale FR, traduction non livrée. Parent seul jugement visuel/final/done/archive.

Reprise correction : nouveau B06 borné après retour parent, relire STATE/plan/manifest, conserver index DA20 et serveurs ; checks affectés seulement. Aucun restart, commit enfant ni intégration implicite.
