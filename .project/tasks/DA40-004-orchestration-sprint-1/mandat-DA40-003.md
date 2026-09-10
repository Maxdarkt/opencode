# Mandat DA40-003 — prêt, NON TRANSMIS

Destinataire exclusif : chat 01a076cc-de9e-7682-9d68-77ba9d0b57d7.
Parent DA40-004 : 01a076cd-6258-7052-9a4d-d094c793477e.

Démarre Analyze de DA40-003, projet MT DA, Sprint 1 actif a3fac11a-49ed-455f-9d7c-dcd213467b6a, puis Plan → Build → checks → smoke technique selon apex-workflow et son references/sprint-child-handoff.md, à lire intégralement. Valide Analyze/Plan autonomement dans le périmètre déjà déterminé ; arrête-toi seulement pour un vrai changement de scope/risque/accès/conflit dangereux/décision métier.

Chaque commande doit imposer workdir /Users/leanbot/Documents/40_Daidalon/features/40-tooling, branche 40-tooling, HEAD de préflight 702bf7dcd7468638c17fd95b110deb38bd253e9a. Relis AGENTS.md, .project/apex.json, .project/tasks/DA40-003-socle-local-reproductible/scope.md et STATE.md ; mandat canonique /Users/leanbot/Documents/40_Daidalon/Daidalon/docs/product/sprints/sprint-1.md, topologie docs/product/worktrees.md du dépôt source. Aucune dépendance de lancement.

Passe MT todo → in_progress au début réel d’Analyze, conserve ce statut jusqu’à review. Tu es l’unique écrivain de code de 40-tooling. Inventorie et empreinte les artefacts M0/Sprint1/DA40-005 avant Build et préserve-les. DA40-005 reste au backlog : ne la lance pas. Le parent tient toutes les projections globales PLAN-GENERAL.md/sprint.md/docs sprint/cache : ne les édite pas ; signale chaque transition au parent. Tiens ton dossier APEX et MT concordants.

Livre dépendances du lockfile sans upgrade général, manifest OS/Bun/HEAD/lockfile/client/ports/processus/source réellement servie, procédure locale reproductible, baseline ciblée réellement exécutée. Lis les AGENTS des paquets. Tests et bun typecheck depuis les paquets, jamais tests racine ni tsc direct. Aucune relance des app/serveurs existants : instance isolée seulement après contrôle de ports/processus. Aucun appel fournisseur payant, déploiement, code métier ni modification de lockfile sans justification dans le scope.

Prépare la recette entre branches (cible, contenu exact, provenance, effets, récupération et limites), sans opération Git d’intégration implicite. Une recette distante/proxy ne prouve pas le client local. Signale immédiatement toute découverte affectant runtime/Git/UI avec preuve et impact.

Après Build/checks/smoke technique verts ou échecs préexistants dûment distingués : écris smoke-report.md, dettes et plan de smoke parent actionnable (environnement, URL/route, préconditions, fixtures, actions, états attendus, régressions, preuves, processus propriétaire). Passe à review et remets fichiers, commandes/résultats, branche/HEAD/dirty, limites et point de reprise. Aucun smoke visuel parent, done, archived, commit, push, merge, rebase, promotion ou suppression de worktree.
