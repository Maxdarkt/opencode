# DA10-002 — Ouvrir explicitement le bon projet et afficher son contexte réel

## Objectif et mandat
Permettre de parcourir puis confirmer un dossier précis et de comprendre le contexte actif sans mutation Git implicite.

Briefing validé par l’utilisateur le 2026-09-06 (« ok parfait ! on continue. »). Cadrage seulement à ce checkpoint : Analyze/Build non commencés.
Release 0.1 ; Sprint 1 a3fac11a-49ed-455f-9d7c-dcd213467b6a, référence da-release-0.1-sprint-1.
Autorités : MT métier ; ce dossier APEX phases/preuves ; Git checkout/branche/HEAD ; cache reconstructible uniquement.
Type : code. Estimation initiale : 5 SP relatifs, révisables ; aucune conversion en jours.

## Contexte mesuré
DA10/20 : sélection web ambiguë, projet déplacé persistant, erreur fichiers générique ; home-controller add appelle initGit si file.list vide.
Base source : 702bf7dcd7468638c17fd95b110deb38bd253e9a. Les livrables M0 non commités restent une baseline protégée dans chaque worktree.
Sources : [décision M0](/Users/leanbot/Documents/40_Daidalon/features/40-tooling/.project/tasks/DA40-001-gap-analysis-m0/decision-m0.md), [release 0.1](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/releases/0.1.md), [mandat Sprint 1](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/sprints/sprint-1.md).

## Dans le périmètre
- Séparer navigation, saisie absolue, aperçu et confirmation sur la route web pilote retenue.
- Retirer l'initGit implicite du parcours d'ouverture couvert ; afficher erreur et résultat réel avant annoncer succès.
- Afficher chemin canonique, disponibilité, branche/HEAD et base, en consommant le contrat 20 ; dossier manquant conserve l'historique consultable avec diagnostic.
- Réutiliser composants/design system/i18n existants ; conserver le chat et les panneaux.

## Hors périmètre
Redesign global, favori avancé, parité Electron/multi-OS, migration historique, binding/lease ou orchestration parallèle.

## Critères d’acceptation
1. Annuler, naviguer et ouvrir un dossier vide n'initialisent pas Git ; fermeture d'un dialogue ne vaut pas succès.
2. Chemin collé, dossier inaccessible et récent déplacé donnent un état explicite ; aucune réparation historique implicite.
3. Bandeau et sélection concordent avec le checkout actif ; aucune confusion entre clones ou sessions.
4. Tests des parcours affectés et smoke parent sur le client local réellement servi ; périmètre web/OS clairement indiqué.

## Surfaces probables
- `packages/app/src/pages/home/home-controller.ts`
- `packages/app/src/components/dialog-select-directory-v2.tsx`
- `packages/app/src/components/dialog-select-directory.tsx`
- `packages/app/src/context/server.tsx`
- `packages/app/src/pages/session`
- `packages/app/src/i18n`
Ces chemins orientent Analyze ; le plan fixe les fichiers exacts après lecture de leurs AGENTS. Toute modification publique respecte la génération client prescrite. Tests/typecheck depuis les paquets concernés, jamais les tests racine.

## Allocation, dépendances et frères
- Racine d’exécution : /Users/leanbot/Documents/40_Daidalon/features/10-product-ui
- Branche : 10-product-ui
- Domaine MT : 10
- Dépendances de lancement : DA40-003, DA20-002.
- Réception sous responsabilité DA40-004 ; transmettre toute découverte de contrat aux tâches impactées.
- Un seul propriétaire écrivain actif par worktree métier fixe ; aucun nouveau worktree par carte.
- Les artefacts M0 préexistants sont inventoriés et protégés avant Build ; le plan partagé se modifie par cellules attribuées.

## Risques, actions manuelles et questions
Respecter AGENTS app pour i18n, benchmark préalable si session/timeline modifiées et aucun restart. Une route non qualifiée n'est pas déclarée supportée.
Au lancement, confirmer disponibilité de l’environnement, chemin réellement servi et capacité du sprint. Les dates ne sont pas engagées.
Les opérations push/merge/rebase/promotion/suppression restent hors mandat. Aucun effet Git sensible caché dans l’installation ou la recette.
L’intégration des changements entre branches exige un dispositif de recette documenté et une autorisation distincte pour toute opération Git hors mandat ; ne pas lancer une chaîne de cherry-picks/merges implicitement.

## Validation et smoke
Parent exerce chemin absolu, navigation/confirmation/annulation, fixture vide, chemin manquant, réouverture et contexte Git ; contrôle absence de .git avant/après.
L’enfant produit checks, smoke technique, dettes et plan visuel actionnable (préconditions, route, fixtures, états, régressions, preuves), puis remet review.
Le parent exécute la revue/smoke, demande les corrections bornées et décide done. Pour une tâche de code, les commits locaux de chemins validés suivent le contrat sprint-orchestrator après validation finale ; aucune publication ni intégration implicite.

## Handoff vers APEX
Dans la racine indiquée : lire AGENTS.md, .project/apex.json, ce scope et STATE, vérifier branche/HEAD/dirty et dépendances MT ; utiliser apex-workflow à Analyze uniquement lors du lancement effectif. Aucun todo→in_progress au seul cadrage.

