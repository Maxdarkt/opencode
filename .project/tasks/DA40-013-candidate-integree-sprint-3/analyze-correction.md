# Analyze correction — DA40-013 — Fixture concordante

## Déclencheur et objectif

Le Pass B a validé le fail-closed aux deux tailles, mais utilisait la session
historique DA40-011 liée à `s2-integration`. Son binding ne concorde donc pas
avec `sprint3-integration` et l’autorité reste `divergent`. Cette correction
doit produire une fixture locale reproductible : session, binding, ownership
sans effets en attente, et snapshot `OPENCODE_TASK_AUTHORITY_SNAPSHOT` frais
ayant le même worktree et le même HEAD.

## Faits observés

- HEAD candidat : `c9bbcde78ab304a3bd37f8b74364df9fb12ade53`;
  `TaskAuthority.observe` compare exactement `task.git.worktreePath` et
  `task.git.head` au binding local avant de rendre `available`.
- La route `/global/context` ne lit pas MT : elle joint le binding et
  l’ownership locaux, puis projette seulement le snapshot d’autorité local.
- `ProjectContextView` transmet désormais cette observation au pilote. Une
  observation available et un contexte actif concordant rendent
  `in_progress/analyze → write_plan`.

## Contrat de fixture

Le helper n’accepte que des chemins de sortie explicitement passés : base SQLite
locale et snapshot JSON. Il crée une tâche de démonstration distincte de DA40-013,
une session locale liée au worktree/HEAD observés, une ownership confirmée sans
effet pending, puis un snapshot version 2 avec `observedAt` et `expiresAt`
calculés à l’exécution. Il ne contacte ni ne modifie MT, et n’écrit pas dans la
base utilisateur par défaut.

## Risques et protections

Le risque est de prétendre une action disponible avec une identité ou une
fraîcheur inventée. Le helper lit branche/HEAD du worktree demandé, refuse les
sorties existantes et imprime les variables exactes à exporter. Un smoke doit
prouver `available` puis le parent doit démarrer backend/App avec les deux
variables et vérifier le panneau aux tailles prescrites.
