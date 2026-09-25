# Contrat d’entrée binding / lease / reprise — proposition

Ce contrat est une entrée de cadrage Sprint 2, pas une capacité implémentée. MT porte le métier, Git les faits, APEX les preuves ; un cache est reconstructible.

## Identité requise
Capturer task display_id/external_ref, sprint_id, session_id et parent éventuel, version de session, client/route/API, adaptateur effectif par appel (unknown avant appel), directory demandé ET realpath observé, directory persisté de session, workspace_id optionnel, Project.ID comme regroupement seulement, identité de checkout/worktree, branche ou detached, HEAD et base Git avec origine de preuve. Ajouter host/process instance identifiée par PID ET date/nonce de démarrage, binding_id, génération monotone, owner, périmètre d’écriture/capacités et request/attempt id. Ne pas encoder un chemin absent en placement confirmé.

## Capacités MT mesurées
Les outils exposés permettent lecture des cartes/sprints, update de statut, affectation et métadonnées dont external_ref/branche/worktree. Aucune primitive de lease écrivain, CAS de génération ou quiescence n’est exposée dans ces schémas ; ce constat est borné à l’interface disponible, sans hypothèse sur la base interne. Le statut in_progress est un statut métier, pas un verrou.

mt_get_leanbot_target(project=DA), 2026-09-06, requête 0ed41bee-3365-4178-ad80-bae9049053bd : allowed=false, LOCAL_MAPPING_MISSING. Toute voie Leanbot reste refusée tant que mapping/capacité n’est pas résolu puis relu. Ne pas réutiliser une commande de promotion ou un statut pour simuler le lease.

## Garde de lancement proposée
1. Relire carte/sprint et mandat ; task active et dépendances acceptées. Résoudre le checkout réel et vérifier disponibilité/identités ; mismatch ou preuve manquante ⇒ refus explicite.
2. Résoudre et figer la route V1/V2 réellement sélectionnée. Session existante : comparer placement persisté avec cible voulue ; changement de query directory seul ne rebind pas la session. Interdire l’admission ambiguë.
3. Obtenir atomiquement une génération écrivain exclusive pour le checkout, avec propriétaires et capacités identifiés. Cette primitive doit être conçue et testée ; MT update_task ne suffit pas.
4. Avant prompt, resume/wake, shell direct, spawn/PTY et toute entrée écrivain : revalider génération et identité. Vérifier encore aux effets coopérants. Une garde au seul click UI est insuffisante ; les appels backend et outils applicatifs doivent participer.
5. Autoriser seulement les familles dont le contrôle est prouvé. Sans confinement OS qualifié, ne pas promettre d’empêcher toute écriture hors racine. Toute capacité incontrôlée est refusée dans le périmètre écrivain géré.
6. Persister décision admit/refuse avec raisons, observations et génération, puis distinguer admission durable, exécution et résultat. Ne pas rejouer aveuglément un effet externe après crash.

## Reprise et transfert
Fermer d’abord l’admission de nouveaux effets pour la génération sortante ; révoquer ses entrées et demander interruption. Attendre la fin vérifiable des drains, outils, PTY et descendants sous contrôle, puis réconcilier fichiers/HEAD et effets externes. Un coordinateur idle ou un PID parent disparu ne prouve pas seul cette fin.

Expiration de bail, heartbeat absent, réponse MT stale/missing, shutdown interrompu, descendant échappé ou état externe inconnu ⇒ état recovery_required, aucun nouvel écrivain. La génération suivante n’est émise qu’après preuve de quiescence ou procédure explicite de récupération/confinement validée. Fencing seul ne révoque pas les droits OS d’un vieux processus qui n’en tient pas compte.

## Scénarios exigés au futur plan
Deux processus / deux sessions visant le même checkout ; retry exact d’admission ; query directory divergent d’une session ; HEAD/branche modifié entre observation et effet ; expiration pendant shell et PTY ; interruption pendant cleanup ; descendant détaché ; client V1 face au backend offrant aussi V2 ; mapping MT absent ; panne entre effet et accusé de réception. Attendu en cas d’incertitude : refus traçable, jamais reprise automatique par TTL seul.

## Consommateurs
DA20-002 : contrat de contexte en lecture seule, distinguer demandé/observé/persisté ; absent/non-Git/detached/base inconnue. DA10-002 : afficher ces faits et la route pertinente, ne pas présenter in_progress comme réservation exclusive. Parent : décider la route pilote de Sprint 2 et cadrer les capacités refusées avant implémentation.
