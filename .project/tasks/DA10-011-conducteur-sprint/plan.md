# Plan — DA10-011 — Conducteur sprint : éligibles et prompts

Analyze accepté (9 décisions). Worktree
`/Users/leanbot/Documents/40_Daidalon/features/tasks/DA10-011`,
branche `conducteur-sprint`, HEAD `03f621743`. Chrome existant seulement
(rail workbench + `/sprint/cockpit` + inspecteur Tâche). Pas de staging,
pas de 3ᵉ peau, pas de S3 merge (DA20-006), pas de nouvel HttpApi, pas
de Core dans App, pas de `TaskExecution.resume`, pas de push/merge.
Identités A/B `sprintCockpitInput` conservées.

## Décisions

1. Conducteur sur le chrome actuel. Pas de rewrite OpenCode.
2. Éligibilité = `ownership.result` (SDK déjà public). `selected.id` =
   éligible. Autres cartes = waiting / blocked. `complete` = aucune.
   `blocked` = file entière fail-closed. File séquentielle = dépendance.
3. Même mapper cockpit + workbench. Badge Eligible / Blocked. Item
   **Pilot** `aria-current` si l’URL est `/sprint/cockpit`.
4. **Copier le prompt** : faits observés seulement,
   `Skill apex-task. Carte {id}. cwd = {worktreeLabel}. Base {head}.`
   Fait absent → copie désactivée. Clipboard seulement. Interdit :
   `taskChatOpen`, `SessionPrompt`, envoi composer.
5. Launch conservé si éligible + worktree observé. Désactivé sinon.
   Launch n’injecte pas le prompt.
6. Pilote = `/sprint/cockpit` : pas de composer, pas de tools Write/
   Edit/Bash. Panneau « No write tools — pilot does not code ».
   Merge Git = simulation.
7. Identités A/B figées. Pas de listing MT Sprint 7.
8. App n’importe jamais Core. Aucun nouvel HttpApi.
9. Tests mapper + prompt + rail. Typecheck `packages/app`. Smoke
   cockpit + inspecteur Tâche.

## B1 — Éligibilité + rail

Consommer `ownership.result` dans `mapCockpitView`. Étendre
`CockpitTaskView` : `eligibility` (`eligible` | `blocked` | `waiting` |
`none`) + `reason` observée seulement.

- `selected` + id match → eligible
- `selected` + autre id → blocked / waiting (file, pas un DAG inventé)
- `complete` → aucune éligible
- `blocked` → toutes blocked + `reason` du snapshot
- `inaccessibleCockpitView` → aucune éligible

Rails (cockpit `TaskRailItem` + `session-sprint-rail-view`) : badge
Eligible / Blocked. Item **Pilot** dans le rail cockpit (aujourd’hui
absent). `sessionSprintRailSelected` : Pilot current si pathname =
`/sprint/cockpit` (aujourd’hui toujours `false`).

Fichiers : `sprint-cockpit-mapper.ts` + test ; `sprint-cockpit.tsx` ;
`session-sprint-rail.ts` + test + view ; i18n `en.ts` + locales
(parity).

Tests : A selected → A eligible, B blocked ; `blocked` → 0 éligible ;
Pilot `aria-current` sur cockpit. Typecheck app.

## B2 — Prompt collable + Launch borné

Fonction pure (texte depuis faits). Copie désactivée si
`worktreeLabel` ou `head` pas `available`. Bouton **Copier le prompt**
dans panneau Task status **et** inspecteur Tâche. `navigator.clipboard`
+ toast existant. Aucun `taskChatOpen`.

Launch : disabled si non éligible ou worktree `unknown`. Copie ≠ Launch.

Fichiers : helper prompt à côté du mapper (test du texte) ;
`sprint-cockpit.tsx` ; `sprint-cockpit-launch.ts` + test (gate) ;
`pack-inspector.ts` / `session-pack-inspector.tsx` + test ;
i18n boutons.

Tests : gabarit exact ; HEAD unknown → pas de texte inventé ; Launch
ne copie pas. Typecheck app.

## B3 — Pilote ne code pas

Cockpit sans composer (déjà). Mention explicite dans l’en-tête / panneau
Task status : « No write tools — pilot does not code ». Distinguer
Pilot vs carte (rail). Inspecteur Permissions **sur une session tâche** :
reste `unknown` (ces chats ont des tools). Ne pas ouvrir un chat
staging mutatif pour Pilot. Merge / commit = simulation inchangée.

Fichiers : `sprint-cockpit.tsx` ; rail Pilot ; i18n. Pas de
`session-composer*`.

Tests : surface pilote sans action d’écriture ; merge toujours
`simulated`. Typecheck app.

## Pathset

App : `sprint-cockpit-mapper.ts` + test ; `sprint-cockpit.tsx` ;
`sprint-cockpit-launch.ts` + test ; `session-sprint-rail.ts` + test +
view ; `pack-inspector.ts` + test + `session-pack-inspector.tsx` ;
`en.ts` + locales.

Réemploi : `loadSprintCockpit`, `TaskQueueResult` SDK, clipboard /
toast, Launch W2.

Hors pathset : Protocol/HttpApi/generated ; Core ; `TaskPilotView` ;
`TaskExecution.resume` ; Git mutatif ; identités Sprint 7 live.

## Verify / Smoke

`bun typecheck` dans `packages/app`. Tests mapper / prompt / rail /
launch. `git diff --check`.

Smoke : rail badges A/B ; Pilot current sur `/sprint/cockpit` ; Copier
le prompt (inspecteur Tâche + panneau) ; Launch inerte si bloqué ;
aucun composer / tool d’écriture sur le pilote.

Après « Lance le build » : B1→B3 puis Smoke puis Verify. Commit après
Verify vert seulement.
