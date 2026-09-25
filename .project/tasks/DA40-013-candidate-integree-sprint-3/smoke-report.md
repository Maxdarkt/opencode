# Smoke technique — DA40-013

## Résultats autonomes

| Parcours | Commande | Résultat observé |
| --- | --- | --- |
| Décision CLI sans effet | `packages/opencode: bun run ./src/index.ts task pilot --mt-status in_progress --apex-phase analyze --context concordant` | PASS — `{"kind":"next","action":"write_plan"}` |
| HTTP TaskMetrics isolé | `packages/opencode: bun test test/server/httpapi-global.test.ts test/server/httpapi-control-plane.test.ts` | PASS — 8/8; tâche non liée conservée, coût inconnu, payload invalide refusé |
| Core TaskPilot/TaskMetrics | `packages/core: bun test test/task-pilot.test.ts test/task-metrics.test.ts` | PASS — 5/5 |
| État UI | `packages/app: bun x bun@1.3.14 test --conditions=solid --only-failures --preload ./happydom.ts ./src/components/task-pilot-state.test.ts` | PASS — 4/4 |

## Limite observable pour le parent

`ProjectContextView` rend `TaskPilotView` avec la tâche mais ne lui fournit pas
d’`observation` MT/APEX. Dans la candidate actuelle, le panneau réel est donc
intentionnellement fail-closed : statut/phase « unobserved », block
`context_incomplete`, next action « none ». Le bouton reste disponible quand
la liaison expose session + worktree. Le calcul de l’action « write plan » est
couvert séparément par CLI et test d’état; aucune lecture MT live n’est
introduite par ce changement.

## Pass B parent

Le jugement d’affichage, largeur et navigation reste au parent. Aucun serveur,
navigateur persistant ou smoke visuel n’a été lancé ici.
