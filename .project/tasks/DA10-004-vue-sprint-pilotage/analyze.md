# Analyse — DA10-004

Date : 2026-09-07. Mandat Sprint 3 transmis par le parent `01a07d34-6e02-7a81-a3ed-0287a9ad3690` : construire, dans le worktree dédié, la vue locale de pilotage Sprint/tâche, sans opération Git sensible ni extension de périmètre.

## Constat et contrat

- Le worktree alloué est `/Users/leanbot/Documents/40_Daidalon/features/s3-10-sprint-view`, branche `sprint-view`, HEAD/base `10e1234b3b08b986ef966f01d04e25bbf1185433`, propre au démarrage.
- DA30-006 a livré le contrat stable [`phase-contract.md`](/Users/leanbot/Documents/40_Daidalon/features/30-agent-runtime/.project/tasks/DA30-006-cycle-apex-mt-pilote/phase-contract.md) au commit local `70d0b4a8b65261bde064bcd239b0df679ef4ab6d`; il n'est pas ancêtre de ce worktree. La vue consommera donc le contrat v1 sans importer ni intégrer ce commit (réconciliation inter-tâches : parent).
- `LocalContextInfo.task` expose une identité TaskBinding et l'état TaskExecution, mais pas les observations MT/APEX ni une agrégation Sprint. Le contrat interdit de déduire `mtStatus` de `apexPhase`, de créer un binding/session/worktree, ou de représenter une valeur inconnue comme mesurée.
- Le point d'intégration existant est [`project-context-view.tsx`](/Users/leanbot/Documents/40_Daidalon/features/s3-10-sprint-view/packages/app/src/components/project-context-view.tsx) ; il affiche déjà binding, worktree, session et effets. [`active-project-context.tsx`](/Users/leanbot/Documents/40_Daidalon/features/s3-10-sprint-view/packages/app/src/components/active-project-context.tsx) connaît le routeur et peut ouvrir le chat déjà lié.

## Périmètre et protections

Inclus : présentation responsive d'une observation de phase explicite, dépendances d'identité, motif de blocage, action suivante évaluée de manière pure/idempotente et ouverture du chat existant dans son worktree. Les valeurs MT/APEX non observées restent explicitement indisponibles et empêchent une action.

Exclus : source MT/APEX live, agrégation des tâches d'un Sprint, modification de binding/execution/MT, création de chat ou de worktree, passage `review → done`, intégration de la branche DA30, commits, push, merge, rebase, déploiement et smoke visuel parent.

Risques de régression : confusion phase/statut, action activée sur contexte incohérent, navigation qui crée une nouvelle session. Les protections sont une évaluation locale testée exhaustivement selon la table DA30, un bouton désactivé sans identité observée et un lien de navigation construit à partir du `sessionID`/`worktree` existants.

## Décision et suite

Le mandat parent couvre Analyse → Plan → Build/checks/smoke technique. Le statut MT doit maintenant passer de `todo` à `in_progress`; ce chat ne possède pas le connecteur MT, le parent doit effectuer et relire cette transition. Aucun blocage technique n'empêche le Plan.

## Correction après recette parent

La recette de la candidate intégrée a confirmé que `TaskPilotView` reçoit bien l'identité TaskBinding mais jamais `observation`; la vue applique donc correctement son fallback `context_incomplete`, mais ce fallback est erronément permanent.

L'endpoint `global.context` expose seulement `binding` et `execution` dans `LocalContext.Info.task`. Il n'expose aucune observation MT ni phase APEX. `getActiveTaskState` permet toutefois de produire de manière pure le `context` (`concordant`, `incomplete`, `divergent`, `resuming`). Ce contexte doit être transmis à la carte; il ne suffit pas à fabriquer un statut MT ou une phase APEX.

La correction minimale autorisée est donc une passerelle optionnelle dans le contrat du contexte local : elle transporte une observation pilote seulement quand ses deux autorités sont disponibles; l'UI combine ce `context` réellement mesuré avec la source explicite et reste fail-closed si `mtStatus` ou `apexPhase` manque. Une lecture de `STATE.md` ne peut fournir au mieux que la phase APEX et ne doit pas être présentée comme une autorité MT. Aucun statut MT ne sera inféré depuis binding, owner ou phase.
