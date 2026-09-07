# DA40-003 — Établir un environnement local reproductible et les checks de référence

## Objectif et mandat
Lancer et tester le code local réellement audité, avec versions, route et état initial vérifiables.

Briefing validé par l’utilisateur le 2026-09-06 (« ok parfait ! on continue. »). Cadrage seulement à ce checkpoint : Analyze/Build non commencés.
Release 0.1 ; Sprint 1 a3fac11a-49ed-455f-9d7c-dcd213467b6a, référence da-release-0.1-sprint-1.
Autorités : MT métier ; ce dossier APEX phases/preuves ; Git checkout/branche/HEAD ; cache reconstructible uniquement.
Type : code. Estimation initiale : 3 SP relatifs, révisables ; aucune conversion en jours.

## Contexte mesuré
M0 : dépendances effect/workspace/happy-dom absentes ; tests runtime non exécutés. package.json déclare bun@1.3.14, les audits utilisaient Bun 1.3.9.
Base source : 702bf7dcd7468638c17fd95b110deb38bd253e9a. Les livrables M0 non commités restent une baseline protégée dans chaque worktree.
Sources : [décision M0](/Users/leanbot/Documents/40_Daidalon/features/40-tooling/.project/tasks/DA40-001-gap-analysis-m0/decision-m0.md), [release 0.1](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/releases/0.1.md), [mandat Sprint 1](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/sprints/sprint-1.md).

## Dans le périmètre
- Documenter et préparer les dépendances du lockfile dans le worktree 40, sans mise à niveau générale.
- Fournir une procédure locale de lancement web/backend identifiés, un manifest OS/Bun/commit/lockfile/client/ports et une baseline de checks ciblés.
- Définir le dispositif de recette multi-worktree, le propriétaire des serveurs et la façon de prouver quelle révision est servie.

## Hors périmètre
Déploiement, upgrades généraux, serveur partagé redémarré, appels fournisseurs payants, changements produit métier.

## Critères d’acceptation
1. Procédure rejouable et manifest identifiant la révision servie, distincte du proxy web distant.
2. Checks ciblés chargés et exécutés ; résultats et éventuels échecs préexistants explicités, aucun test non exécuté déclaré vert.
3. Aucune altération des livrables M0, du lockfile sans justification, ni collision de processus/ports.

## Surfaces probables
- `package.json`
- `bun.lock`
- `packages/opencode`
- `packages/app`
- `packages/core`
- `packages/llm`
Ces chemins orientent Analyze ; le plan fixe les fichiers exacts après lecture de leurs AGENTS. Toute modification publique respecte la génération client prescrite. Tests/typecheck depuis les paquets concernés, jamais les tests racine.

## Allocation, dépendances et frères
- Racine d’exécution : /Users/leanbot/Documents/40_Daidalon/features/40-tooling
- Branche : 40-tooling
- Domaine MT : 40
- Dépendances de lancement : aucune.
- Réception sous responsabilité DA40-004 ; transmettre toute découverte de contrat aux tâches impactées.
- Un seul propriétaire écrivain actif par worktree métier fixe ; aucun nouveau worktree par carte.
- Les artefacts M0 préexistants sont inventoriés et protégés avant Build ; le plan partagé se modifie par cellules attribuées.

## Risques, actions manuelles et questions
AGENTS app interdit de redémarrer app/serveur : inventorier les processus existants, utiliser une instance isolée sans les interrompre. Toute impossibilité devient un point de décision précis.
Au lancement, confirmer disponibilité de l’environnement, chemin réellement servi et capacité du sprint. Les dates ne sont pas engagées.
Les opérations push/merge/rebase/promotion/suppression restent hors mandat. Aucun effet Git sensible caché dans l’installation ou la recette.
L’intégration des changements entre branches exige un dispositif de recette documenté et une autorisation distincte pour toute opération Git hors mandat ; ne pas lancer une chaîne de cherry-picks/merges implicitement.

## Validation et smoke
Parent ouvre le client local identifié ; relie URL, source servie et manifest ; vérifie les résultats de baseline.
L’enfant produit checks, smoke technique, dettes et plan visuel actionnable (préconditions, route, fixtures, états, régressions, preuves), puis remet review.
Le parent exécute la revue/smoke, demande les corrections bornées et décide done. Pour une tâche de code, les commits locaux de chemins validés suivent le contrat sprint-orchestrator après validation finale ; aucune publication ni intégration implicite.

## Handoff vers APEX
Dans la racine indiquée : lire AGENTS.md, .project/apex.json, ce scope et STATE, vérifier branche/HEAD/dirty et dépendances MT ; utiliser apex-workflow à Analyze uniquement lors du lancement effectif. Aucun todo→in_progress au seul cadrage.

