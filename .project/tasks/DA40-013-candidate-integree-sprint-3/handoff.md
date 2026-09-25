# Handoff parent — DA40-013

## Candidate et état

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/s3-integration`
- Branche/HEAD : `sprint3-integration` /
  `442a1311f06d970ccbb1bc77bc9eda78f81c42d9`
- Base : `10e1234b3b08b986ef966f01d04e25bbf1185433`; arbre propre.
- Contenu : manifeste Schema, TaskPilot Core/CLI, TaskMetrics Core/HTTP/SDK,
  panneau App Task Pilot (24 chemins, `1393+ / 26-`).

## Checks et limites

Voir [B1](blocs/B1-candidate-validation.md), [smoke](smoke-report.md) et
[verify](verify.md). Tous les checks affectés sont verts. Seule la baseline
App i18n `pa-PK` hors pathset reste rouge et est déjà enregistrée dans
DA10-002; elle ne bloque pas cette candidate.

## Recette visuelle parent

Précondition : depuis ce worktree, démarrer localement le backend et l’App
selon `packages/app/AGENTS.md`, ouvrir une session avec une liaison de tâche
portant `mtTaskID`, `sessionID` et `worktree`, puis afficher le bandeau Project
Context. Ne pas réaliser la recette sur staging.

| Taille | Actions | Attendus |
| --- | --- | --- |
| 1440×900 | Ouvrir une session liée, vérifier le panneau `Task Pilot`, puis cliquer « Open task ». | Le panneau expose Task, MT status, APEX phase, dependencies, block et next action; les identifiants sont lisibles; l’ouverture cible bien le worktree/session liés. Avec le flux réel actuel, status/phase sont « unobserved », block est `context_incomplete`, next action est « none » (fail-closed documenté). |
| 1024×768 | Répéter avec un `sessionID` et un chemin de worktree longs; réduire/élargir une fois. | Aucun débordement horizontal ni texte masqué : les valeurs cassent par mot, le panneau reste dans le bandeau scrollable et le bouton respecte la largeur disponible. |

Régressions à contrôler : identité absente → bouton désactivé; identité complète →
bouton actif; état divergent/incomplet ne doit jamais présenter une action
exécutable. Le calcul « in_progress/analyze → write_plan » est déjà prouvé
techniquement, mais n’est pas alimenté par une lecture MT live dans cette vue.

## Reprise

Si le Pass B est bon, le parent clôture selon son mandat. Si le rendu diffère,
revenir au fichier `packages/app/src/components/task-pilot-view.tsx` du HEAD
ci-dessus et conserver DA40-013 en `review`; aucun nouveau commit n’est requis
par cet handoff.
