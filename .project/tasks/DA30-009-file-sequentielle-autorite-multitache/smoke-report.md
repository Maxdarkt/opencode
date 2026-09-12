# Smoke report — DA30-009

## Résultat

Smoke visuel enfant `reconciliation_incomplete` : le shell web local démarre et reste stable aux deux tailles demandées, mais la vue Sprint A/B n'est pas encore intégrée dans cette candidate. Le parcours métier Sprint doit être rejoué par le parent après DA10-005/DA40-015.

## Environnement et actions

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA30-009-file-sequentielle-autorite-multitache`, HEAD `57da5e0d156c1b6f73c2c4528b502d6b764d9891`.
- Serveur UI : `bun run dev -- --host 127.0.0.1 --port 4451` depuis `packages/app`; démarré puis arrêté proprement, sans modification de code.
- Navigation locale : `http://127.0.0.1:4451/` dans le navigateur intégré; aucune donnée externe ni action d'écriture.
- Viewport `1440×900` : shell OpenCode visible, projet `50-integration`, recherche de sessions et bouton Nouvelle session; pas de vue Sprint A/B.
- Viewport `1024×768` : même shell lisible, pas de débordement visible; pas de vue Sprint A/B.
- Le backend par défaut `127.0.0.1:4096` n'était pas lancé : l'interface a affiché `Échec du chargement des sessions … Transport` et aucune session ne pouvait être ouverte.

## Preuves et diagnostic

- L'accessibilité et les captures des deux tailles montrent le shell sans erreur de rendu bloquante.
- La source actuelle de `packages/app/src/components/project-context-view.tsx` rend la ligne Sprint avec `project.context.task.sprintUnavailable`, donc le contrat Sprint deux-tâches n'est pas exposé dans ce worktree.
- Une tentative Playwright headless a échoué avant navigation car le binaire Chromium n'est pas installé; le navigateur intégré a fourni la vérification visuelle équivalente du shell.

## Attendus non vérifiables ici

La sélection A active → B, conservation de A, refus d'identité divergente, session réelle et action suivante ne peuvent pas être observés dans cette candidate sans le lot UI DA10-005 et l'intégration DA40-015, ni un backend Sprint/MT. Ce n'est pas une régression B1/B2 : les scénarios d'autorité et SQLite synthétiques passent dans les preuves B1/B2.

## Suite parent

Après intégration de DA10-005/DA40-015, relancer le backend de candidate avec fixtures A/B, ouvrir la vue Sprint, puis vérifier à `1440×900` et `1024×768` : A active, passage à B, A conservée, aucune duplication de chat, refus fail-closed et action suivante explicitement liée à B. Conserver les captures et traces parent; ne pas déclarer la réception visuelle depuis ce smoke partiel.
