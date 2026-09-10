# Handoff de lancement Sprint 1

Mandat utilisateur du 2026-09-06 : lancer Sprint 1, un chat par tâche dans le bon worktree ; scoper et créer la mémoire durable au backlog. Sprint actif a3fac11a-49ed-455f-9d7c-dcd213467b6a. DA40-005 créée hors sprint et réconciliée.

Chat parent : 01a076cd-6258-7052-9a4d-d094c793477e. Cwd parent /Users/leanbot/Documents/40_Daidalon. Chats du projet conteneur non-Git ; les enfants doivent imposer leur workdir dédié à CHAQUE commande, ne jamais confondre leur cwd initial conteneur et leur racine d’exécution. Ne créer aucun worktree ni chat doublon.

| Carte | Chat | Worktree |
|---|---|---|
| DA40-003 | 01a076cc-de9e-7682-9d68-77ba9d0b57d7 | /Users/leanbot/Documents/40_Daidalon/features/40-tooling |
| DA30-003 | 01a076cc-ef32-77a1-b908-d2b147982618 | /Users/leanbot/Documents/40_Daidalon/features/30-agent-runtime |
| DA20-002 | 01a076cd-06bc-73f2-9c81-637d148a4d47 | /Users/leanbot/Documents/40_Daidalon/features/20-workspace-git |
| DA10-002 | 01a076cd-3843-7ea1-88ac-f3d48982d356 | /Users/leanbot/Documents/40_Daidalon/features/10-product-ui |
| DA40-004 | 01a076cd-6258-7052-9a4d-d094c793477e | /Users/leanbot/Documents/40_Daidalon/Daidalon |

Les quatre enfants ont reçu seulement un préflight lecture seule et doivent rester todo jusqu’au mandat Analyze. Parent : vérifier confirmations, puis démarrer DA40-003 ; superviser jusqu’à réception, puis DA30-003, DA20-002, DA10-002 selon dépendances. Ne pas s’arrêter au dispatch. Appliquer sprint-orchestrator et maintenir MT/APEX/plan/sprint.md/cache, rapports et archivages de fin de sprint selon suivi-sprints.md.

Un seul parent écrivain des projections globales après ce handoff. Le parent sortant n’effectuera plus de mutations concurrentes. Protéger les docs dirty M0/Sprint1 et DA40-005. Aucun code staging ; pas de push/merge/rebase/promotion/retrait. Enfant sans commit ; commits locaux de chemins validés par le parent selon contrat. Pas de campagne API payante. Installation des dépendances du socle selon scope, aucune relance des serveurs existants. Rendre explicite la recette interbranches avant tout acte Git distinct.

Ne pas mettre blocked pour l’attente de dépendances. Si un enfant signale un risque/accès/scope réel, réconcilier et demander seulement la décision nécessaire ; gates Analyze/Plan autonomes dans mandat. Le parent prend en charge la suite et les smokes visuels, pas les enfants.
