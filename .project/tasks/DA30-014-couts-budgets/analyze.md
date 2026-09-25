# Analyze — DA30-014 Coûts et budgets honnêtes

## Objectif, mandat et limites

Livrer E1 et E2 dans le worktree
`/Users/leanbot/Documents/40_Daidalon/features/tasks/DA30-014-couts-budgets`,
branche `task/DA30-014-couts-budgets`, base/HEAD `8db56f535`. Sprint 8
`da-release-0.1-sprint-8`. Tokens, cache, coût, modèle et fournisseur
par tâche et par sprint. Budgets et alertes (contexte, retries, course
à vide). Jamais un faux zéro, jamais un restant inventé.

Hors périmètre : adaptateurs d’abonnement (DA30-015), CPU/RAM
(DA40-020), ledger de paiement, réécriture des bornes d’arrêt
DA30-012, détecteur d’appels outil identiques, `TaskExecution.resume`,
push/merge, Build sur `staging`.

## Évidence et point de départ

- **Tokens / modèle** — `TaskMetrics.task` agrège les messages
  assistant liés par `task_binding`. Complet = `measured` (tokens
  input/output/reasoning/cache, modèle). Incomplet = `partial`.
  Absent = `unknown`. Test `packages/core/test/task-metrics.test.ts`.
- **Coût métriques** — le même service force `unknownCost` sur chaque
  tâche, même si `assistant.cost` vaut `0`. Le sprint combine ces
  inconnus : coût sprint `unknown`, sans `value`. Le test DA30-007
  interdit de transformer ce `0` en montant mesuré.
- **Faux zéro durable** — `packages/core/src/session/runner/llm.ts`
  publie `session.next.step.ended` avec `cost: 0`.
  `message-updater` copie ce nombre sur l’assistant. Le schéma
  (`packages/schema/src/session-event.ts`) rend `cost` obligatoire
  (`Schema.Finite`). `SessionTable.cost` est `NOT NULL DEFAULT 0`.
- **Tarif** — `ConfigV2.Model.cost` porte input/output/cache, optionnel.
  Aucun calcul ne le relie aux tokens du step.
- **UI** — l’inspecteur (`formatCost`) affiche `unknown` si l’état est
  `unknown` ou si la valeur est `0`. Le cockpit affiche l’état
  TaskMetrics, donc `unknown (metrics)`. D’autres chemins UI posent
  encore `cost: 0` (`packages/app/src/utils/session-message.ts`).
- **Bornes** — DA30-012 arrête le drain (tours, tokens brûlés, 30 min)
  et publie la raison. Ce n’est pas un budget $ ni une alerte sprint.
  Pas de plafond sprint, pas d’alerte contexte/retries/course à vide.

## Contrat retenu

1. **Step** — ne plus écrire un `0` comme coût. Sans tarif et sans
   montant fournisseur prouvé : omettre le coût (ou état `unknown`,
   sans nombre). Tarif modèle présent : `estimated` = tokens × tarif,
   provenance tarif + message. Montant fournisseur distinct et prouvé :
   `measured`. Un `0` sans cette provenance reste non mesuré.
2. **TaskMetrics** — lire cet état. Ne plus forcer `unknown` quand un
   coût estimé ou mesuré existe. Conserver le test : `cost: 0` sans
   tarif ≠ `measured`. Sprint = `combineNumeric` actuel (unknown /
   partial / measured), sans inventer un total.
3. **Affichage** — inspecteur et cockpit montrent état + provenance.
   Interdit d’afficher `0` ou `$0.00` sans mesure. Un tarif qui calcule
   exactement 0 reste `unknown` à l’écran, comme `formatCost` aujourd’hui.
4. **Budget tâche** — les plafonds DA30-012 restent le moteur d’arrêt.
   Cette carte ajoute l’alerte (raison `steps | budget | timeout` +
   provenance). Pas un second mécanisme d’arrêt.
5. **Budget sprint** — plafond déclaré comparé à l’agrégat tokens ou
   coût. Dépassement affiché seulement si l’agrégat n’est pas
   `unknown`. Pas de « restant » si la base est inconnue.
6. **Alertes** — contexte : tokens du pack vs fenêtre, `unknown` si
   l’un manque. Retries : compteur réel ou `unknown`, pas un zéro
   fabriqué. Course à vide : la raison d’arrêt des bornes, pas un
   nouveau détecteur.

## Régressions à protéger

- `cost: 0` copié sur un assistant sans tarif → coût tâche `unknown`,
  sans `value` ;
- tokens et modèle mesurés inchangés quand le tour est complet ;
- agrégat sprint `unknown` si chaque tâche est `unknown` ;
- `formatCost` ne rend pas `0` ni `$0.00` ;
- bornes tours / tokens / durée DA30-012 inchangées ;
- pack et `promptCacheKey` DA30-013 inchangés.

## Risques et décisions

- Rendre `cost` optionnel sur `session.next.step.ended` touche le
  schéma d’événement. Le Plan dit si `bun run generate` est requis.
- Ne pas migrer `SessionTable.cost` pour « corriger » le défaut 0.
  La source honnête est le message + le tarif, pas la colonne.
- Ne pas étendre le chantier aux tests V1 `packages/opencode` qui
  sèment `cost: 0` comme fixture.
- Checks prévus : `bun typecheck` et tests `packages/core`
  (`task-metrics`, runner step) plus le test inspecteur
  `packages/app`. Jamais depuis la racine du dépôt.

## Entrée Plan

Blocs : (1) coût de step sans faux zéro, tarif → estimé ; (2)
TaskMetrics tâche/sprint lit cet état ; (3) alerte budget tâche +
sprint et alertes contexte/retries/course à vide, provenance visible.
Pathset centré `packages/schema`, `packages/core`, `packages/app`.
