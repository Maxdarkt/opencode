# DA10-006 — Maquette cliquable du cockpit Sprint

## Objectif

Faire valider par l'utilisateur une maquette interactive du cockpit Sprint avant tout Build du tableau de bord réel. Le cockpit remplace le chat Sprint comme surface principale de suivi : le chat pilote conserve les questions globales, décisions et opérations de réception ; chaque tâche conserve son propre espace d'exécution isolé.

## Contexte et preuves

La conception de référence prévoit déjà navigation des tâches, zone de travail et panneau de contexte ([conception produit](../../../../../Daidalon/docs/product/conception.md)). Le Sprint 4 a rendu DA30-009 vérifiable côté code, mais la vue actuelle ne présente pas le Sprint A/B. L'utilisateur a validé le 2026-09-11 l'ordre : tableau Sprint réel et ouverture du chat existant d'abord, confirmation pour actions d'exécution/Git, maquette cliquable avant le cockpit réel.

## Dans le périmètre

- Un prototype local et interactif, sans connexion aux autorités réelles, montrant : objectif Sprint, décisions/dettes, pile chronologique des tâches, dépendances, état, checks, commit/worktree et prochaine action.
- Sélection d'une tâche avec aperçu de son chat, terminal, Git/diff et navigateur comme surfaces liées, sans les exécuter ni les embarquer réellement.
- Parcours cliquables : choisir une tâche, revenir au cockpit, ouvrir un chat existant simulé, consulter une décision de réception et constater qu'une action sensible demande confirmation.
- États vides, blocked/review/done et lecture de plusieurs tâches simultanée.
- Capture ou chemin de démonstration reproductible pour validation utilisateur à 1440×900 et 1024×768.

## Hors périmètre

- Modification des contrats MT/APEX/Git/session, création de chat réel, commandes de terminal, navigateur persistant, exécution d'agent, commit/merge/rebase/push ou mutation MT.
- Parallélisme d'écrivains, synchronisation live et remplacement du shell applicatif complet.
- Extension silencieuse de DA10-005, qui reste le futur lot de données UI réelles après validation de cette maquette.

## Critères d'acceptation

1. La différence entre chat pilote Sprint et chats de tâches est compréhensible sans documentation supplémentaire.
2. Chaque tâche affiche son état, son worktree, son dernier check/commit et son action suivante; les dépendances et dettes sont visibles.
3. Les actions de lancement, commit, merge et production sont distinctes et présentées comme nécessitant confirmation, sans effet réel.
4. Les deux tailles cibles restent lisibles et le parcours de démonstration couvre consultation, focalisation d'une tâche et retour au cockpit.
5. La validation utilisateur débouche sur une décision explicite : conserver, corriger ou écarter le modèle avant le Build du cockpit réel.

## Dépendances, risques et relation aux lots

- Aucune dépendance de code : des fixtures locales sont admises afin de tester l'UX avant les intégrations DA20-004, DA10-005 et DA40-015.
- DA30-009 demeure une fondation technique distincte, à recevoir selon ses preuves existantes ; elle n'est ni intégrée ni modifiée ici.
- DA10-005 consommera la décision UX mais ne devient pas automatiquement le prototype; DA20-004 reste nécessaire avant toute action réelle de reprise/lancement.
- Risque : faire croire que les boutons ont un effet réel. Le prototype doit afficher clairement les limites et ne contenir aucune mutation.

## Validation et smoke

- Tests UI ciblés pour les parcours du prototype et typecheck App.
- Smoke visuel local aux deux tailles, avec captures ou traces accessibles.
- Démonstration utilisateur avant tout passage du prototype vers le tableau réel.

## Suivi

- MT : `DA10-006`, Sprint `da-release-0.1-sprint-4`, 3 SP; external_ref stable imposée par le connecteur : `.project/tasks/sprint-cockpit-clickable-prototype`.
- Worktree domaine : `10-product-ui`; un worktree task-owned sera alloué avant le Build.
- Relation parent : DA40-016 orchestre et reçoit; la maquette ne change aucun statut des autres tâches.
