# Smoke technique et Pass B parent

## Pass A effectué
- Client : 11 tests server-compat/server-protocol, 0 fail. Requêtes de fixture pour les variantes V1/V2 ; aucun envoi live de prompt.
- Admission/placement : 41 tests session-prompt, session-run-coordinator, location, 0 fail. Retry exact/conflict, resume:false, steers/queues, coordination/interruptions locales. SessionExecution est injecté dans les tests d’admission ; aucune preuve de fournisseur ou exécution OS.
- Mutation : 60 tests location-mutation, file-mutation, tool-write/edit/apply-patch/bash, 0 fail. Résolution, refus, autorisations et ordre des effets. Les tests Bash injectent AppProcess ; descendants OS non exercés.
- Typecheck Core : exit0 ; aucun code produit modifié, pas de génération client requise.
- GET health4140/UI4440 : 200/200 ; cwd des PID27514/27516 et listeners concordent avec DA40. Aucun serveur créé/redémarré. Source parity sur les 31 fichiers audités 30/40 : vraie.

Commandes/cwd/exits : evidence/checks.json ; sorties intégrales evidence/*-route.log, admission-placement.log, mutation-controls.log, core-typecheck.log ; environnement dans evidence/run-checks.py. Installation frozen sans scripts : evidence/install.log. La preuve distingue code lu, fetch de fixture et GET live. Aucun parcours modèle/outils live de bout en bout revendiqué.

## Pass B à exécuter par le parent
Préconditions : instance DA40 toujours attribuée, sources/HEAD du manifest concordants, UI http://127.0.0.1:4440, backend http://127.0.0.1:4140. Relever les PID actuels et cwd ; aucune réinitialisation d’instance, aucun fournisseur ni prompt réel.

1. Ouvrir la UI existante et vérifier sa disponibilité et le serveur sélectionné 4140. Conserver capture écran et URL ; seule cette étape appelle le jugement visuel parent.
2. Examiner evidence/http-observation.json et source server-protocol.ts : GET /global/health healthy:true ⇒ protocole V1. Confronter les 11 tests et la conversion server-compat.ts à la route POST /session/{sessionID}/prompt_async ; ne pas émettre cette requête live. Attendu : aucun label de layout ou sdk/v2 utilisé comme preuve de session V2.
3. Confronter session.directory prioritaire et explicit directory au futur contrat DA20. Cas de régression à revoir dans les preuves/fixtures : serveur V2 seul, healthy absent/erreur, session existante visant autre directory, aucun directory, checkout absent/non-Git/detached/base inconnue. Les quatre derniers cas restent responsabilité DA20, pas une recette UI intégrée réussie ici.
4. Inspecter matrice et contrat : chaque famille possède contrôle ou limite ; PTY et shell/descendants ne sont pas dits confinés ; mapping MT manquant bloque Leanbot ; expiration seule ne libère pas le droit écrivain.
5. Vérifier preservation.json, Git HEAD/index, checks et dettes. Déposer verdict et preuves de réception dans ce dossier via la procédure parent, puis parent seul décide done et synchronise les projections canoniques.

Acceptation : qualification documentaire cohérente avec preuves bornées et garde fail-closed proposée. Si le parent exige un tour modèle live ou confinement OS, cela nécessite un cadrage de recette distinct ; aucune preuve simulée ne remplace ce test.

## Correction / retour
Entrée : STATE → plan → nouveau bloc B04 ; garder serveurs/héritage et demander correction bornée à cet enfant. Aucun restart applicatif nécessaire pour les livrables non-code.

## Verdict Pass B parent — 2026-09-06
Réception exécutée par le parent `01a076a4-b458-72a3-8e2b-bf975091a840`.

- L’instance DA40 déjà réceptionnée reste disponible : UI `4440` et health API `4140` répondent HTTP 200 ; l’interface affiche toujours le serveur `127.0.0.1:4140` et se rend sans erreur visuelle.
- La preuve `healthy:true` et `server-protocol.ts` établissent le choix V1 pour cette instance. La route `prompt_async`, la valeur compatible `admittedSeq:0` et la chaîne V2 sont décrites séparément sans extrapolation.
- La matrice couvre admission, placement, mutations fichiers, shell, PTY, descendants et effets distants, avec refus explicite lorsque quiescence, mapping MT ou interception ne sont pas prouvés.
- Les 112 tests ciblés et le typecheck Core sont consignés avec commandes et sorties ; le parent a relu les exits, le health live, l’index vide, le lockfile et la préservation des 43 fichiers hérités.
- Le contrat Sprint 2 exige une identité complète, une génération écrivain atomique à concevoir, une revalidation aux entrées et effets, et `recovery_required` si la quiescence reste inconnue.

Verdict : **accepté**. Aucune correction B04 requise. Les dettes D1–D5 et les limites sur prompt live, adaptateur effectif, PTY/OS, Leanbot et assemblage interbranches restent ouvertes pour le cadrage concerné.
