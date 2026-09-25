# Handoff review — DA30-003

Parent : 01a076a4-b458-72a3-8e2b-bf975091a840. Enfant : 01a076cc-ef32-77a1-b908-d2b147982618.

Qualification non-code livrée ; MT review et cellule locale DA30-003 réconciliés. Aucun comportement produit changé. Fichiers : dossier DA30-003 (Analyze/Plan, B01-B03, manifest, diagnostic-runtime, controles-placement, contrat-sprint-2, runbook, debts, smoke-report, preuves, STATE, handoff, .gitignore), et cellule DA30-003 de PLAN-GENERAL local. Aucune autre cellule métier modifiée ; parent conserve la synchronisation canonique et les projections de sprint.

## Résultat à recevoir
Le client UI4440 détecte V1 sur API4140 via /global/health healthy:true ; route pilote POST /session/{sessionID}/prompt_async. Les imports sdk/v2 ne sont pas preuve de moteur V2. La chaîne V2 /api/session/:sessionID/prompt possède admission durable et coordinator local mais ne protège pas automatiquement la route V1. La compatibilité renvoie un admittedSeq:0 fabriqué côté client, pas une preuve d’inbox V2.

Le placement d’une session existante prime sur le directory de requête : DA20/DA10 doivent comparer demandé/observé/persisté. Le terminal historique appelle Core Pty ; l’inventaire doit suivre les services, pas seulement les noms V1/V2. Shell/PTY/outils tiers et descendants ne sont pas universellement couverts. Contrat de lancement proposé : identité explicite, génération exclusive atomique à concevoir, vérification aux entrées/effets, refus de transfert si quiescence inconnue même après expiration.

## Vérification et limites
112 tests passent : 11 client, 41 admission/coordinator/location, 60 mutations ; Core typecheck exit0. Commandes/exits dans evidence/checks.json. GET health/UI = 200/200 ; cwd/listeners API27514/UI27516 dans 40-tooling mesurés. SHA256 de 31 sources identiques 30/40. Aucun prompt live, modèle ou descendant OS exercé ; tests Bash utilisent AppProcess injecté. Adaptateur AI SDK attendu de la configuration, pas observé par appel. Aucun parcours intégré de bout en bout revendiqué.

MT Leanbot : allowed=false, LOCAL_MAPPING_MISSING, requête 0ed41bee-3365-4178-ad80-bae9049053bd ; refus avant lancement sur cette voie. Dettes D1-D5 dans debts.md, transmises sans nouvelle carte implicite.

## Git et préservation
Branche 30-agent-runtime ; HEAD 702bf7dcd7468638c17fd95b110deb38bd253e9a ; dirty M0/Sprint1 conservé. Sur 43 fichiers hérités : seuls STATE propre et plan modifiés, zéro inattendu ; index vide ; product_diff vide ; lockfile identique HEAD. Aucun commit enfant.

## Pass B et suite
Plan parent complet dans smoke-report.md : UI4440/API4140, préconditions/provenance, capture de disponibilité et serveur, vérification probe/route via preuves, matrice et cas limites. Aucun prompt fournisseur nécessaire. Parent seul juge le visuel, done/archived et synchronise PLAN-GENERAL canonique, sprint.md et docs Sprint1/projections. Ne pas annoncer la synchronisation canonique à partir de mon unique cellule locale.

Correction : STATE → plan → B04 après mandat, checks affectés seulement. Aucun restart serveur/app ; conserver l’environnement existant. Les serveurs appartiennent à la recette DA40, pas à cet enfant.
