# Plan — DA10-002

Gate autonome selon mandat parent et sprint-child-handoff ; pas de commit enfant. Un seul écrivain 10.

- B01 : sélecteur web V2 explicite ; état de confirmation invalide après édition du chemin, chemin absolu à l'aperçu, annulation et réponses de navigation obsolètes. Maximum 5 chemins picker/domain/tests. Tests domaine existants + nouvelles régressions.
- B02 : remplacer initGit implicite dans home-controller par ouverture asynchrone confirmée après succès ; routine injectable pour tests sur ordre, erreurs, annulation et réponses obsolètes. Maximum 4 chemins home/helpers/tests ; clés i18n existantes.
- B03a/B03b exécutés après décision parent : consommation SDK DA20 réel ; état store de contexte (génération + abandon), prévisualisation disponible avant ouverture, diagnostics absent/inaccessible/invalid/network/auth/protocol. Imports officiels sans duplication manuelle des generated.
- B04 exécuté après B03 : bandeau contexte actif hors session/timeline si possible (sinon benchmark production préalable obligatoire). Afficher API, requested/canonical/session, availability, branche/detached/HEAD, base not_requested/resolved/unresolved, concordance. Pas de base implicite ni statut clean si incomplet. Tests réponses obsolètes/changement serveur/session.
- B05 : checks ciblés, typecheck app, lint/format chemins modifiés ; smoke technique sur UI10/API20 ou candidate intégrée nommée par parent ; plan Pass B et handoff review seulement quand complet.

## Candidate décidée et réalisée par parent
Source commit 2d973aeaf6a289ba1f343663a758d7c70b1bcc11 (20-workspace-git) ; cible 10-product-ui HEAD 702bf7dcd7468638c17fd95b110deb38bd253e9a + dirty protégé. Les 15 chemins produit sont listés dans integration.md. Transfert exact des 15 chemins effectué par parent après « oui go » ; index préservé par enfant. Aucun merge/cherry-pick/rebase. Le commit complet inclut aussi APEX DA20, à distinguer de la candidate produit.

## Pass B prévu
Parent seul : saisir chemin absolu, naviguer, annuler/Escape, confirmer, vide sans .git avant/après, chemin absent/inaccessible et récent déplacé, changement serveur/dossier pendant réponse, auth/network, normal/detached/base absente ou inconnue/mismatch session. Identifier exactement les deux racines/HEAD/dirty/PID/ports avant captures. Préserver chat/panneaux/historique ; aucune requête fournisseur ni restart.

## Découpage final et réception
B03a : transport/observation/tests ; B03b : hook/vue/bundle i18n commun ; B04 : raccord picker/home/layouts ; B05 : contrôles/candidate/manifest. Handoff review et limites finales dans STATE/handoff/smoke-report ; aucune attente SDK restante.
