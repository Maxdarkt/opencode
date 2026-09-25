# Analyze — DA30-008

## Objectif et mandat

Le mandat Sprint 3 autorise dans le seul worktree `s3-30-mt-apex-authority` une projection locale en lecture seule de l’observation MT/APEX, ses tests, smoke technique, vérification et commit local après les checks. Le parent garde le smoke visuel, la clôture et les écritures MT/canoniques.

## Faits relus

- `LocalContext.Info.task` expose le binding vérifié et `TaskExecution`, mais aucune valeur `mtStatus` ou `apexPhase`; DA10-004 rend donc `Not observed`.
- DA30-006 est l’évaluateur pur : le couple MT/APEX doit lui être fourni explicitement; il interdit toute déduction depuis l’autre valeur.
- Le snapshot local de Sprint existant porte `authority.business = mt-tasks`, `authority.phasesAndEvidence = apex-task-folders`, chaque `tasks[].mtStatus`, `tasks[].apex.phase`, `observedAt` et `expiresAt`. Il est explicitement un cache de coordination, donc ne devient utilisable qu’avec provenance exposée et fraîcheur valide.
- Binding/execution, Git ou le texte `STATE.md` ne sont pas une source MT et ne seront pas interprétés comme tels.

## Contrat retenu

Le serveur lira exclusivement un snapshot local explicitement configuré pour l’instance. Il sélectionne la tâche par `mtTaskID`, exige une observation non expirée, un statut et une phase admis par DA30-006, et la concordance du worktree/HEAD si le snapshot les porte. La réponse contient les valeurs, la provenance `runtime_snapshot`, l’horodatage observé et l’expiration. Source absente/inaccessible/malformée/expirée, tâche absente ou identité divergente: valeurs omises et état non-concordant, donc DA10-004 reste bloqué.

## Protections de régression

- pas de lecture MT distante, d’écriture, ni de mise à jour de cache;
- une observation identique produit la même projection;
- un cache expiré ou une phase hors contrat n’est jamais présenté comme courant;
- l’UI reçoit la provenance/fraîcheur et utilise l’observation uniquement quand elle est concordante.

## Risques et actions manuelles

La configuration du chemin de snapshot est une précondition locale du parent. Le smoke visuel parent devra fournir un snapshot frais et un binding identique, puis vérifier 1440×900 et 1024×768. Aucun point ne nécessite une décision métier supplémentaire.
