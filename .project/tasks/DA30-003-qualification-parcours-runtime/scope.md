# DA30-003 — Qualifier le parcours runtime et les points de contrôle du placement

## Objectif et mandat
Prouver le parcours client/serveur/session effectif et borner les futurs contrôles d'admission du Sprint 2.

Briefing validé par l’utilisateur le 2026-09-06 (« ok parfait ! on continue. »). Cadrage seulement à ce checkpoint : Analyze/Build non commencés.
Release 0.1 ; Sprint 1 a3fac11a-49ed-455f-9d7c-dcd213467b6a, référence da-release-0.1-sprint-1.
Autorités : MT métier ; ce dossier APEX phases/preuves ; Git checkout/branche/HEAD ; cache reconstructible uniquement.
Type : non-code. Estimation initiale : 3 SP relatifs, révisables ; aucune conversion en jours.

## Contexte mesuré
DA30-001 : V1/V2, layout et transport sont indépendants ; coordinateur process-local et usage auxiliaire incomplet.
Base source : 702bf7dcd7468638c17fd95b110deb38bd253e9a. Les livrables M0 non commités restent une baseline protégée dans chaque worktree.
Sources : [décision M0](/Users/leanbot/Documents/40_Daidalon/features/40-tooling/.project/tasks/DA40-001-gap-analysis-m0/decision-m0.md), [release 0.1](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/releases/0.1.md), [mandat Sprint 1](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/sprints/sprint-1.md).

## Dans le périmètre
- Tracer une route pilote locale précise, de la requête au placement Session/Location et aux outils.
- Cartographier admissions, écritures fichiers, shell/PTY et processus descendants ; distinguer points couverts et trous de couverture.
- Évaluer les capacités MT nécessaires et produire le contrat d'entrée pour binding/lease/reprise, sans implémenter le registre.

## Hors périmètre
Implémentation du lease ou ledger, modification du moteur, benchmark économique, campagne API payante.

## Critères d’acceptation
1. Manifest et preuves identifient client, route, version session et adaptateur sans inférence depuis le layout.
2. Chaque famille d'écriture a un point de contrôle démontré ou une limitation explicite ; verdict faisable/conditionnel/non faisable motivé.
3. Garde de lancement écrivain proposée pour Sprint 2 ; incertitude de quiescence traitée par refus, pas par expiration seule.

## Surfaces probables
- `packages/server/src/handlers/message.ts`
- `packages/core/src/session.ts`
- `packages/core/src/session/execution/local.ts`
- `packages/core/src/session/runner/llm.ts`
- `packages/core/src/location-mutation.ts`
Ces chemins orientent Analyze ; le plan fixe les fichiers exacts après lecture de leurs AGENTS. Toute modification publique respecte la génération client prescrite. Tests/typecheck depuis les paquets concernés, jamais les tests racine.

## Allocation, dépendances et frères
- Racine d’exécution : /Users/leanbot/Documents/40_Daidalon/features/30-agent-runtime
- Branche : 30-agent-runtime
- Domaine MT : 30
- Dépendances de lancement : DA40-003.
- Réception sous responsabilité DA40-004 ; transmettre toute découverte de contrat aux tâches impactées.
- Un seul propriétaire écrivain actif par worktree métier fixe ; aucun nouveau worktree par carte.
- Les artefacts M0 préexistants sont inventoriés et protégés avant Build ; le plan partagé se modifie par cellules attribuées.

## Risques, actions manuelles et questions
La qualification peut invalider le chemin choisi. Remettre la preuve au parent avant toute extension de scope ; aucune affirmation de protection universelle du shell.
Au lancement, confirmer disponibilité de l’environnement, chemin réellement servi et capacité du sprint. Les dates ne sont pas engagées.
Les opérations push/merge/rebase/promotion/suppression restent hors mandat. Aucun effet Git sensible caché dans l’installation ou la recette.
L’intégration des changements entre branches exige un dispositif de recette documenté et une autorisation distincte pour toute opération Git hors mandat ; ne pas lancer une chaîne de cherry-picks/merges implicitement.

## Validation et smoke
Parent confronte matrice et traces à la route locale choisie ; tests existants/fixtures sans fournisseur réel privilégiés.
L’enfant produit checks, smoke technique, dettes et plan visuel actionnable (préconditions, route, fixtures, états, régressions, preuves), puis remet review.
Le parent exécute la revue/smoke, demande les corrections bornées et décide done. Pour une tâche de code, les commits locaux de chemins validés suivent le contrat sprint-orchestrator après validation finale ; aucune publication ni intégration implicite.

## Handoff vers APEX
Dans la racine indiquée : lire AGENTS.md, .project/apex.json, ce scope et STATE, vérifier branche/HEAD/dirty et dépendances MT ; utiliser apex-workflow à Analyze uniquement lors du lancement effectif. Aucun todo→in_progress au seul cadrage.

