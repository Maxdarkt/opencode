# Sprint 1 — Projet et environnement fiables

Statut : completed le 2026-09-06 ; 7 cartes done puis archived, 26 SP acceptés, 0 inachevée. ID MT : a3fac11a-49ed-455f-9d7c-dcd213467b6a.
Référence : da-release-0.1-sprint-1. [Release 0.1](../releases/0.1.md).
Briefing utilisateur validé le 2026-09-06 ; lancement autorisé. Les quatre premières tâches enfants sont acceptées et done. Le sprint est étendu le même jour avec DA40-007 (architecture) et DA40-006 (façade Make/ports), séquencées dans `40-tooling`. Les deux extensions sont acceptées : architecture au commit `50019f223`, façade Make au commit `b7111b6e9`. DA10-002 assemble le contexte DA20 et l’UI sur `10-product-ui` au commit local `e22d723895e3a8537f9bf21d5d6e4561ff630de1`. DA40-004 termine la clôture et la rotation.

## Objectif et cartes

Démonstration : lancer une version locale identifiée, ouvrir explicitement le bon dossier sans initGit implicite, afficher chemin, disponibilité, branche, HEAD et base Git. Qualifier le runtime, standardiser les commandes et ports par worktree, puis rendre l'architecture actuelle et ses critères d'évolution compréhensibles. Aucun lease prétendu livré ici.

| Carte    | Titre                                                                    | Domaine | SP initiaux | Dépendances de lancement                         | APEX                                                                                                                                    |
| -------- | ------------------------------------------------------------------------ | ------- | ----------: | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| DA40-003 | Établir un environnement local reproductible et les checks de référence  | 40      |           3 | Aucune                                           | [scope](/Users/leanbot/Documents/40_Daidalon/features/40-tooling/.project/tasks/DA40-003-socle-local-reproductible/scope.md)            |
| DA30-003 | Qualifier le parcours runtime et les points de contrôle du placement     | 30      |           3 | DA40-003                                         | [scope](/Users/leanbot/Documents/40_Daidalon/features/30-agent-runtime/.project/tasks/DA30-003-qualification-parcours-runtime/scope.md) |
| DA20-002 | Exposer un contexte local et Git vérifiable en lecture seule             | 20      |           5 | DA40-003, DA30-003                               | [scope](/Users/leanbot/Documents/40_Daidalon/features/20-workspace-git/.project/tasks/DA20-002-contexte-local-verifiable/scope.md)      |
| DA10-002 | Ouvrir explicitement le bon projet et afficher son contexte réel         | 10      |           5 | DA40-003, DA20-002                               | [scope](/Users/leanbot/Documents/40_Daidalon/features/10-product-ui/.project/tasks/DA10-002-ouverture-projet-explicite/scope.md)        |
| DA40-007 | Documenter l’architecture actuelle et les évolutions backend/BDD         | 40      |           5 | DA20-001, DA30-003, DA40-003 ; worktree 40 libre | [scope](/Users/leanbot/Documents/40_Daidalon/features/40-tooling/.project/tasks/DA40-007-audit-architecture-application/scope.md)       |
| DA40-006 | Standardiser les commandes projet et les ports par worktree              | 40      |           3 | DA40-003 ; DA40-007 libère le worktree 40        | [scope](/Users/leanbot/Documents/40_Daidalon/features/40-tooling/.project/tasks/DA40-006-facade-make-ports-worktrees/scope.md)          |
| DA40-004 | Orchestrer et réceptionner le Sprint 1 — Projet et environnement fiables | 40      |           2 | Aucune                                           | [scope](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/tasks/DA40-004-orchestration-sprint-1/scope.md)                          |

18 SP initiaux, portés à 26 SP après extension explicite ; aucune vélocité disponible. Dates non fixées. Deux semaines constituent une cadence proposée, pas un engagement de livrer 26 SP.
DA40-004 commence au lancement et termine après les quatre validations enfants : dépendances de sortie distinctes de celles d’entrée.

## Contrats et ordre

DA40-003 → DA30-003 → DA20-002 → DA10-002, puis DA40-007 → DA40-006 ; supervision DA40-004.
Socle remet manifest/baseline/procédure ; runtime remet route qualifiée et limites ; Git remet contrat de contexte ; UI le consomme ; parent reçoit le parcours.
Un NO-GO technique déclenche replanification, jamais élargissement silencieux.
Dépendances enregistrées dans descriptions MT/scopes ; aucune API de dépendances structurées présumée disponible. Relire statuts et preuves avant chaque lancement.

## Topologie et héritage

Parent dans /Users/leanbot/Documents/40_Daidalon ; preuves d’orchestration dans Daidalon sur staging, sans développement produit.
Enfants dans les worktrees métier fixes ; DA40-003 possède 40-tooling pendant sa tâche.
Avant Build : mesurer HEAD/index/dirty et empreintes des livrables M0 non commités. Préserver dossiers et lignes de plan hérités ; aucun nettoyage pour obtenir un arbre propre.

## Environnement et recette entre branches

Installer les dépendances du lockfile dans le worktree dédié, sans upgrade général ni appel fournisseur payant implicite. Respecter AGENTS, dont aucun redémarrage des app/serveurs existants. Identifier ports, processus, client et révisions servies ; le proxy distant opencode dev web ne valide pas la UI locale.
DA40-003 et DA40-004 documentent le dispositif de recette entre branches. L’interdiction actuelle de push/merge/rebase/promotion/retrait reste en vigueur. Si l’assemblage nécessite une opération Git distincte, préparer cible/effet pour décision avant exécution. Ne pas déclarer un parcours intégré validé à partir de tests séparés.

## Critères de sortie

1. Manifest et baseline reproductibles.
2. Route/admission qualifiées sans confusion V1/V2/layout.
3. Contexte concordant sur fixtures normales, absentes, non-Git, detached et base inconnue.
4. Ouverture/navigation/annulation sans initGit ; confirmation précise ; erreurs et contexte visibles.
5. Checks ciblés et smokes parents sur la candidate exacte ; limites conservées.
6. Façade Make reproductible et ports locaux sans collision, liés au code de chaque worktree.
7. Architecture actuelle documentée avec schéma et matrice de décision backend/BDD.
8. Bilan charge/risques/usage et proposition de scope Sprint 2.

Enfant : todo → in_progress au début réel d’Analyze puis review avec preuves ; parent : revue, corrections et validation. Code : commits locaux des seuls chemins validés selon contrat sprint-orchestrator, aucune intégration/publication implicite.

## Clôture et rotation

DA40-004 a été close par la requête `b40a9b29-1e64-408f-bda2-6a2eeb68dfe6`. Le sprint a été clôturé par `f23f1ff2-d0c6-4e38-b231-7b594993cf12` avec 0 tâche inachevée, 0 transfert et 0 retour backlog. Les 7 cartes ont ensuite été archivées, leurs dossiers APEX et leurs liens étant conservés. Le [plan sortant](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/archives/sprint-1/plan-sortant.md) garde le roster et les 26 SP avant que l'API de sprint masque les cartes archivées.

DA40-005, DA40-008 et DA40-009 ont ensuite été reçues hors sprint et archivées. DA40-010 a assemblé hors sprint la candidate commune dans `features/50-integration` : DA10 porte l'unique copie des 15 blobs produit DA20 identiques, les preuves DA20 restent traçables et la chaîne DA40 est conservée dans son ordre. La prochaine action est la recette parent de cette candidate ; aucun Sprint 2 n'est encore créé ou lancé.

## Résultats acceptés

| Carte    | Résultat                                                | Preuve principale                                                                                                          |
| -------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| DA40-003 | Environnement local reproductible et baseline de checks | commit `1b327889841111256dfbc88f9cb063f848cc661b`                                                                          |
| DA30-003 | Parcours runtime et placement qualifiés                 | dossier APEX, tâche non-code                                                                                               |
| DA20-002 | Contexte local/Git vérifiable en lecture seule          | commit `2d973aeaf6a289ba1f343663a758d7c70b1bcc11`                                                                          |
| DA10-002 | Ouverture explicite du projet et contexte réel visible  | commit `e22d723895e3a8537f9bf21d5d6e4561ff630de1`                                                                          |
| DA40-007 | Architecture actuelle, Mermaid et matrice backend/BDD   | commit `50019f223`                                                                                                         |
| DA40-006 | Makefile et ports déterministes par worktree            | commit `b7111b6e9` ; smoke parent 4140/4440                                                                                |
| DA40-004 | Orchestration, réception, routage modèles et rotation   | [bilan final](/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/tasks/DA40-004-orchestration-sprint-1/bilan-final.md) |

Les deux extensions portent le sprint de 18 à 26 SP. Tous les résultats ont été relus avant clôture ; les commits restent locaux dans leurs worktrees, sans push, merge, rebase ni promotion.

## Assemblage commun post-sprint

DA40-010 a produit une candidate non committée sur `baseline-integration`, base `702bf7dcd`. Les générations et checks ciblés sont verts, l'exerciseur HTTP couvre 209 routes sans manque dans chacun des modes coverage/auth/effect, et le smoke headless ouvre la racine d'intégration en affichant branche, HEAD et base sans `initGit`. Le [manifeste de provenance](../../../.project/tasks/DA40-010-assembler-baseline-commune/integration-manifest.md) et le [smoke report](../../../.project/tasks/DA40-010-assembler-baseline-commune/smoke-report.md) portent les preuves. Le parent reste propriétaire du Pass B, du commit local éventuel, de `done` et de la synchronisation canonique.

## Continuité après M0

M0 clôturé et archivé : [bilan](m0.md). [Index sprints](/Users/leanbot/Documents/40_Daidalon/Daidalon/sprint.md). À chaque transition et clôture, appliquer la [routine permanente](/Users/leanbot/Documents/40_Daidalon/Daidalon/docs/workflow/suivi-sprints.md). Les cartes et preuves M0 restent accessibles dans leurs dossiers effectifs.
