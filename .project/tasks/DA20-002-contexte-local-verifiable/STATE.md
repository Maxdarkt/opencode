# STATE — DA20-002
Phase : terminée après Verify, correction B05 et Pass B parent.
Projet DA ; Sprint 1 actif a3fac11a-49ed-455f-9d7c-dcd213467b6a ; type code, 5 SP initiaux.
Racine /Users/leanbot/Documents/40_Daidalon/features/20-workspace-git ; branche 20-workspace-git ; HEAD 702bf7dcd7468638c17fd95b110deb38bd253e9a.
Parent 01a076a4-b458-72a3-8e2b-bf975091a840 ; enfant 01a076cd-06bc-73f2-9c81-637d148a4d47.
Dépendances DA40-003/DA30-003 relues done avant Analyze. Mandat effectif parent reçu ; gates Analyze/Plan autonomes validées, B01-B05 terminés (voir blocs).

## Résultat
GET /global/context authentifié, directory explicite ; séparation demandé/canonique/session persistée, état Git/base/revue fiable ou explicitement incomplet ; aucune initialisation de projet. Contrat DA10 : contrat-contexte.md. Patch exact de 15 chemins produit et SHA256 : evidence/candidate.patch, candidate-files.json, candidate-sha256.json.

## Checks et smoke
39 tests distincts passent (Core 11, HTTP/OpenAPI 26, SDK 2) ; Schema/Core/opencode/SDK typecheck exit0 ; lint 0 warning/error ; format/whitespace pass. Générations SDK legacy et client exit0 ; client courant inchangé. Smokes HTTP effect/auth pass, 189 routes, 0 missing/extra. Service sur checkout réel conforme. Commandes/cwd/exits/logs : evidence/checks.json. Aucun fournisseur appelé.

## Préservation et limites
31 fichiers hérités inventoriés : seuls STATE propre et plan changés, aucun inattendu ; index vide, HEAD/lockfile inchangés. Dirty M0 conservé. Aucun commit enfant, push, merge, rebase, promotion, suppression, restart ou instance live supplémentaire. Les serveurs éphémères des tests sont gérés par leurs fixtures. Pas de lease, snapshot atomique, réparation de session ni intégration UI revendiquée. D1 qualification autres hôtes dans debts.md.

## Prochaine action et reprise
Statut : done dans MT après clôture parent `632a9571-98f7-4d4b-b3b4-9d34e8dd4894` ; commit local borné créé sur `20-workspace-git`. Parent synchronise les projections et déclenche DA10. Pass B visuel et branchement réel ultérieurs avec DA10 ; aucune instance live DA20 à lancer (instruction parent).
Enfant attend la revue ; si correction demandée, ouvrir B06 borné, modifier seulement les chemins convenus, rejouer checks affectés et remettre review. Ne pas reprendre Analyze/Build sans correction parent.
Synchronisation locale : cellule DA20 du plan en review ; synchronisation canonique PLAN-GENERAL/sprint.md/docs/projections sous responsabilité parent, non revendiquée ici.

B05 terminé : projection OpenAPI préserve LocalContext.Info et les 13 champs requis nullables. SDK généré officiellement. Tests rouges avant correction conservés ; B05 tests HTTP/OpenAPI21 + SDK2, typechecks opencode/SDK, lint/format/whitespace passent. Ancienne candidate conservée sous evidence/b04-candidate*. Prochaine action : réception parent ; correction future B06 seulement sur mandat. Aucun commit/serveur live.
