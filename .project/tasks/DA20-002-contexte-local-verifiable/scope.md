# DA20-002 — Exposer un contexte local et Git vérifiable en lecture seule

## Objectif et mandat
Donner à l'interface un contrat fiable de chemin, disponibilité et état Git pour le checkout réellement consulté.

Briefing validé par l’utilisateur le 2026-09-06 (« ok parfait ! on continue. »). Cadrage seulement à ce checkpoint : Analyze/Build non commencés.
Release 0.1 ; Sprint 1 a3fac11a-49ed-455f-9d7c-dcd213467b6a, référence da-release-0.1-sprint-1.
Autorités : MT métier ; ce dossier APEX phases/preuves ; Git checkout/branche/HEAD ; cache reconstructible uniquement.
Type : code. Estimation initiale : 5 SP relatifs, révisables ; aucune conversion en jours.

## Contexte mesuré
DA20-001 : Project.ID partagé entre clones, base historique indéfinie, états detached et diff incomplet ambigus.
Base source : 702bf7dcd7468638c17fd95b110deb38bd253e9a. Les livrables M0 non commités restent une baseline protégée dans chaque worktree.
Sources : [décision M0](/Users/leanbot/Documents/40_Daidalon/features/40-tooling/.project/tasks/DA40-001-gap-analysis-m0/decision-m0.md), [release 0.1](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/releases/0.1.md), [mandat Sprint 1](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/sprints/sprint-1.md).

## Dans le périmètre
- Réutiliser les services existants pour résoudre chemin canonique, top-level, checkout et disponibilité.
- Définir/exposer branche ou detached, HEAD, base_ref/base_oid explicites et état de résolution ; staging reste une configuration DA, jamais un fallback universel silencieux.
- Fournir erreurs structurées pour dossier absent/inaccessible/non-Git et états de revue incomplets/conflits lorsque disponibles ; contrat consommable par UI.

## Hors périmètre
Création/reset/retrait worktree, changement de branche, migration d'identité native, diff UI complet, lease et réparation de Session.

## Critères d’acceptation
1. Réponses cohérentes avec Git sur fixtures existant, absent, non-Git, detached et base introuvable.
2. Deux clones de même origin ne substituent pas leur chemin malgré Project.ID partagé.
3. Lire/ouvrir ne crée ni .git ni branche/worktree ; base inconnue ne signifie pas clean.
4. Contrat public, génération et checks appropriés respectent les dépendances Schema/Core/Protocol/Server/Client.

## Surfaces probables
- `packages/core/src/git.ts`
- `packages/core/src/project.ts`
- `packages/core/src/location.ts`
- `packages/opencode/src/git/index.ts`
- `packages/opencode/src/project/vcs.ts`
- `packages/schema`
- `packages/protocol`
- `packages/server`
Ces chemins orientent Analyze ; le plan fixe les fichiers exacts après lecture de leurs AGENTS. Toute modification publique respecte la génération client prescrite. Tests/typecheck depuis les paquets concernés, jamais les tests racine.

## Allocation, dépendances et frères
- Racine d’exécution : /Users/leanbot/Documents/40_Daidalon/features/20-workspace-git
- Branche : 20-workspace-git
- Domaine MT : 20
- Dépendances de lancement : DA40-003, DA30-003.
- Réception sous responsabilité DA40-004 ; transmettre toute découverte de contrat aux tâches impactées.
- Un seul propriétaire écrivain actif par worktree métier fixe ; aucun nouveau worktree par carte.
- Les artefacts M0 préexistants sont inventoriés et protégés avant Build ; le plan partagé se modifie par cellules attribuées.

## Risques, actions manuelles et questions
Ne pas développer deux contrats métier V1/V2. Le chemin certifié par qualification gouverne le scope. API/codegen à régénérer uniquement si contrat public modifié.
Au lancement, confirmer disponibilité de l’environnement, chemin réellement servi et capacité du sprint. Les dates ne sont pas engagées.
Les opérations push/merge/rebase/promotion/suppression restent hors mandat. Aucun effet Git sensible caché dans l’installation ou la recette.
L’intégration des changements entre branches exige un dispositif de recette documenté et une autorisation distincte pour toute opération Git hors mandat ; ne pas lancer une chaîne de cherry-picks/merges implicitement.

## Validation et smoke
Parent compare l'état exposé et les mesures Git/ filesystem ; erreurs doivent être observables sans action mutatrice.
L’enfant produit checks, smoke technique, dettes et plan visuel actionnable (préconditions, route, fixtures, états, régressions, preuves), puis remet review.
Le parent exécute la revue/smoke, demande les corrections bornées et décide done. Pour une tâche de code, les commits locaux de chemins validés suivent le contrat sprint-orchestrator après validation finale ; aucune publication ni intégration implicite.

## Handoff vers APEX
Dans la racine indiquée : lire AGENTS.md, .project/apex.json, ce scope et STATE, vérifier branche/HEAD/dirty et dépendances MT ; utiliser apex-workflow à Analyze uniquement lors du lancement effectif. Aucun todo→in_progress au seul cadrage.

