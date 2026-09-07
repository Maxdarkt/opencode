# DA40-004 — Orchestrer et réceptionner le Sprint 1 — Projet et environnement fiables

## Objectif et mandat
Coordonner les quatre tâches, contrôler leurs dépendances et réceptionner le parcours du Sprint 1 avant de cadrer Sprint 2.

Briefing validé par l’utilisateur le 2026-09-06 (« ok parfait ! on continue. »). Cadrage seulement à ce checkpoint : Analyze/Build non commencés.
Release 0.1 ; Sprint 1 a3fac11a-49ed-455f-9d7c-dcd213467b6a, référence da-release-0.1-sprint-1.
Autorités : MT métier ; ce dossier APEX phases/preuves ; Git checkout/branche/HEAD ; cache reconstructible uniquement.
Type : non-code. Estimation initiale : 2 SP relatifs, révisables ; aucune conversion en jours.

## Contexte mesuré
M0 terminé ; release 0.1 et découpage trois sprints validés par l'utilisateur. Aucun produit encore modifié.
Base source : 702bf7dcd7468638c17fd95b110deb38bd253e9a. Les livrables M0 non commités restent une baseline protégée dans chaque worktree.
Sources : [décision M0](/Users/leanbot/Documents/40_Daidalon/features/40-tooling/.project/tasks/DA40-001-gap-analysis-m0/decision-m0.md), [release 0.1](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/releases/0.1.md), [mandat Sprint 1](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/sprints/sprint-1.md).

## Dans le périmètre
- Préflight Git/chats/MT/APEX, protection des livrables hérités, allocation des worktrees et contrôle d'un écrivain par domaine.
- Faire progresser les tâches selon socle → runtime → Git → UI ; suivre les preuves et remonter les changements de contrat.
- Exécuter les smokes parents, organiser les corrections dans leurs worktrees et consolider la démonstration.
- Mesurer charge réelle et réviser le scope Sprint 2 ; tenir une proposition d'intégration/release distincte des actes Git.

## Hors périmètre
Implémentation à la place des enfants, lancement automatique Sprint 2, publication, push/merge/rebase/promotion/retrait worktree.

## Critères d’acceptation
1. Chaque tâche garde carte/dossier/chat/worktree concordants ; aucun Build produit sur staging.
2. Les quatre livraisons disposent des checks et revues parent ; seuls les résultats réellement exercés sont déclarés réussis.
3. Manifest de recette associe tous les changements utilisés et leur source ; aucune démonstration sur une version distante non identifiée.
4. Bilan Sprint 1 avec critères, dettes, résultats, charge observée et décision explicite de suite.

## Surfaces probables
- `PLAN-GENERAL.md`
- `.project/runtime`
- `docs/product/releases/0.1.md`
- `docs/product/sprints/sprint-1.md`
Ces chemins orientent Analyze ; le plan fixe les fichiers exacts après lecture de leurs AGENTS. Toute modification publique respecte la génération client prescrite. Tests/typecheck depuis les paquets concernés, jamais les tests racine.

## Allocation, dépendances et frères
- Racine d’exécution : /Users/leanbot/Documents/40_Daidalon/Daidalon
- Branche : staging
- Domaine MT : 40
- Dépendances de lancement : aucune.
- Sortie dépendante des quatre validations enfants : DA40-003, DA30-003, DA20-002 et DA10-002.
- Un seul propriétaire écrivain actif par worktree métier fixe ; aucun nouveau worktree par carte.
- Les artefacts M0 préexistants sont inventoriés et protégés avant Build ; le plan partagé se modifie par cellules attribuées.

## Risques, actions manuelles et questions
Orchestration démarre sans attendre les enfants ; sa sortie dépend de leurs quatre validations. Le partage 40-tooling concerne seulement socle, parent restant dans le conteneur local.
Au lancement, confirmer disponibilité de l’environnement, chemin réellement servi et capacité du sprint. Les dates ne sont pas engagées.
Les opérations push/merge/rebase/promotion/suppression restent hors mandat. Aucun effet Git sensible caché dans l’installation ou la recette.
L’intégration des changements entre branches exige un dispositif de recette documenté et une autorisation distincte pour toute opération Git hors mandat ; ne pas lancer une chaîne de cherry-picks/merges implicitement.

## Validation et smoke
Parent reçoit le client local, vérifie ouvrir/annuler/chemin manquant/contexte Git et relit qualification runtime ; pas de test de lease livré dans ce sprint.
L’enfant produit checks, smoke technique, dettes et plan visuel actionnable (préconditions, route, fixtures, états, régressions, preuves), puis remet review.
Le parent exécute la revue/smoke, demande les corrections bornées et décide done. Pour une tâche de code, les commits locaux de chemins validés suivent le contrat sprint-orchestrator après validation finale ; aucune publication ni intégration implicite.

## Handoff vers APEX
Dans la racine indiquée : lire AGENTS.md, .project/apex.json, ce scope et STATE, vérifier branche/HEAD/dirty et dépendances MT ; utiliser apex-workflow à Analyze uniquement lors du lancement effectif. Aucun todo→in_progress au seul cadrage.

