# Handoff correction — fixture disponible concordante

## Précondition impérative

Le parent rafraîchit le runtime canonique
`/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/runtime/sprints/415b28cf-2d9c-4162-9be7-f6502a453b8e/CURRENT.json`
après le HEAD candidat `57da5e0d156c1b6f73c2c4528b502d6b764d9891`.
La tâche DA40-013 doit y conserver ses faits MT/APEX réels et ce même worktree/
HEAD, avec `observedAt < expiresAt` encore frais. Le helper refuse toute valeur
stale/divergente : ne pas éditer une copie pour le Pass B.

## Création de la fixture locale

Depuis `/Users/leanbot/Documents/40_Daidalon/features/s3-integration` :

```sh
fixture_dir=$(mktemp -d)
bun run --cwd packages/opencode script/create-task-pilot-fixture.ts \
  "$fixture_dir/task-pilot.db" \
  /Users/leanbot/Documents/40_Daidalon/Daidalon/.project/runtime/sprints/415b28cf-2d9c-4162-9be7-f6502a453b8e/CURRENT.json \
  "$PWD"
export OPENCODE_DB="$fixture_dir/task-pilot.db"
export OPENCODE_TASK_AUTHORITY_SNAPSHOT=/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/runtime/sprints/415b28cf-2d9c-4162-9be7-f6502a453b8e/CURRENT.json
```

La sortie doit contenir `taskID: DA40-013`,
`sessionID: ses_task_pilot_fixture`, `observation.state: available` et la
décision correspondant aux faits actuels (au checkpoint vérifié :
`in_progress/analyze → write_plan`). Ces exports concernent uniquement cette
base temporaire et ne modifient pas MT.

## Pass B parent

Démarrer backend et App séparément, avec les exports ci-dessus, hors staging;
ouvrir la session `ses_task_pilot_fixture` dans l’App locale puis le bandeau
Project Context.

| Taille | Attendus |
| --- | --- |
| 1440×900 | Task `DA40-013`; MT status `in_progress`; APEX phase `analyze`; Execution context `concordant`; Block `none`; Next action `write plan`; bouton Open task actif et navigation vers la même session/worktree. |
| 1024×768 | Même état sans débordement horizontal : identifiants et worktree longs se replient, panneau et bouton restent visibles dans le bandeau scrollable. |

Après le cas available, vérifier également avec snapshot expiré puis divergent :
les deux restent fail-closed, sans action disponible. Le parent détient seul la
recette visuelle, le passage éventuel de DA40-013 en review/done et la clôture.
