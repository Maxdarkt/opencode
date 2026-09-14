# Analyze — DA10-007 — Lier chaque chat à un worktree de carte

## Git, MT, autorité

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA10-007`
- Branche : `chat-worktree` @ `493f3aa31` (staging à jour ; APEX absent de ce SHA)
- APEX canonique : `/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/tasks/DA10-007-chat-worktree`
- MT `DA10-007` : `in_progress` (requête `9fd9930c-1631-4185-a139-21550f51227e`)
- Sprint 5 / release 0.2 : W1 + W2. Dépend de DA20-003 (fait). Bloque DA10-008 et DA40-017.
- Aucun Build produit sur `staging`.

## Objectif

Un chat App = un worktree `features/tasks/<carte>`. Lancer crée la session collée à cet arbre ; reprendre ouvre le fil existant. Preuve W1 : libellé worktree sur la carte (rail + fil). Preuve W2 : pas de second chat. L’agent n’écrit que dans cet arbre.

## Surfaces observées (ce HEAD)

| Surface | État | Écart DA10-007 |
| --- | --- | --- |
| `TaskBinding` Core (`adopt` / `resume` / `get`) | Durable, fail-closed, unicité MT / APEX / session | **Aucun HttpApi** mutation ni `get` dédié |
| `POST /api/session` | Crée une session à `location.directory` | N’adopte pas le binding ; cwd = process si location omise |
| `POST /global/ownership` + cockpit | Lecture seule ; deep-link si `sessionID` déjà lié | Launch = **simulation inerte** |
| Rail cockpit | `display_id` + statut ; worktree seulement dans le panneau droit | **Pas de libellé worktree** (preuve W1) |
| `GET /global/context` + `ActiveProjectContext` | Affiche binding si `session_id` | N’ouvre / ne crée pas le fil |
| `TaskPilotView` | `onOpen` seulement si session **déjà** liée | Pas de création |
| `sprintCockpitInput` | Fixtures Sprint 4 `DA40-015-A/B` | Conservé : rail sprint complet **hors scope** |

`TaskBinding.resume(identity)` compare aussi le **HEAD**. Un HEAD bougé n’est pas un motif pour créer un second chat : la reprise de fil = `get({ type: "mt_task" })`, pas `resume` avec un HEAD reconstruit. La divergence HEAD reste un fait affiché (DA10-003).

App n’importe jamais Core/Server : toute ouverture passe par HttpApi + `bun run generate` (`packages/client`).

## Décisions proposées (à valider pour Plan)

1. **Pas de `git worktree add`.** Convention `features/tasks/<display_id>`. Arbre absent / pas un checkout → refus typé. Création Git = hors scope (DA20 / lancement manuel).
2. **`POST /global/task-chat/open`** (payload : `mtTaskID`, `apexExternalRef`, `worktree` absolu). Serveur :
   - `get(mt_task)` → session existante, **zéro** `session.create` ;
   - sinon `LocalContext.inspect(worktree)` (fail-closed), `session.create({ location: { directory } })`, `adopt` avec checkout observé ;
   - collision / arbre ≠ `features/tasks/<carte>` / inspect KO → erreur typée, pas de seconde ligne.
3. **Launch réel, le reste inerte.** Seul `launch` de la carte sélectionnée appelle `open` puis navigue `/{b64(worktree)}/session/{sessionID}`. Commit / merge / production restent « simulation — aucun effet ». Interdit : `TaskExecution.resume`, Git mutatif, MT write.
4. **Libellé W1.** Rail + en-tête canvas/fil : chemin relatif `features/tasks/<carte>` (ou `unknown` tagué). Jamais un faux chemin. Deep-link canvas inchangé si déjà lié.
5. **Isolation agent.** `session.location.directory === checkout.worktree`. Pas de second chat si le binding existe, même si HEAD a bougé.
6. **Tests.** Core/HTTP : create une fois, reopen idempotent, refus arbre absent / hors convention / collision. App : label rail+fil, launch → open, pas de second create. Typecheck App + generate. Smoke : `/sprint/cockpit`, label, launch→session cwd, reopen même `sessionID`.

## Hors périmètre (confirmé)

Panneau secondaire, rail sprint complet, `make dev`, bandeau/inspecteur (DA10-008), création/suppression worktree Git, commit/merge/push.

## Pathset probable

- Schema contrat `TaskChat` (open input/result + erreurs)
- Protocol + handlers `global` + tests HTTP
- Client généré (pas d’édition manuelle `src/generated`)
- App : mapper/rail/canvas, launch, i18n `en.ts`, tests cockpit
- APEX `blocs/` + smoke/verify

## Risques

- `resume` HEAD-strict ≠ reprise de fil → **get**, pas identity complète.
- `session.create` sans location = cwd serveur (souvent staging) → location obligatoire.
- Fixtures 0.1 A/B : ne pas les réécrire ; open testé à part.
- Generate SDK obligatoire après HttpApi.

## Décisions ouvertes

Aucune métier. À valider : les 6 décisions ci-dessus.
