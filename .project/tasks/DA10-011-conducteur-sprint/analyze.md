# Analyze — DA10-011 — Conducteur sprint : éligibles et prompts

## Git, MT, autorité

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA10-011`
- Branche : `conducteur-sprint` @ `03f621743` (staging Sprint 6 mergé ; tip docs sprint-6)
- APEX : `.project/tasks/DA10-011-conducteur-sprint`
- MT `DA10-011` : `in_progress` (Sprint 7 `da-release-0.1-sprint-7`)
- Thème DA10 (UI). Pas un checkout `features/10-product-ui`.
- Dépend de DA10-009 (fait, archived). S3 merge = DA20-006 (hors carte).
- Aucun Build produit sur `staging`.

## Objectif

S1 S2 S4 seulement : **tâches éligibles (dépendances)** dans le rail + panneau sprint, **prompt collable**, **chat pilote sans tools d’écriture**. Copie, pas d’orchestration magique. Le pilote ne code pas.

## Surfaces observées (ce HEAD)

| Surface | État | Écart DA10-011 |
| --- | --- | --- |
| Maquette `cockpit.html` | Rail **Pilote** `staging · conducteur` ; carte bloquée = prompt « bloqué : dépendance » ; inspecteur Tâche = **Copier le prompt** ; Permissions pilote = « Aucune : le pilote ne code pas » | App n’a ni badge éligible ni copie |
| Workbench session (DA10-009/010) | Rail 244/64 : item **Pilot** → `/sprint/cockpit` ; cartes tâche → `sessionHref` ou cockpit ; pastilles working/unread | Pas d’éligible/bloqué ; Pilot jamais `aria-current` |
| Inspecteur Tâche | id, statut, worktree, branche, HEAD observés | Pas de prochaine action, pas de Copier |
| Inspecteur Permissions | onglet visible, corps `unknown` | Pas le contrat « zéro tool d’écriture » du pilote |
| `/sprint/cockpit` (DA10-005) | Rail A/B, canvas inerte, panneau Task status / contexte / topologie ; Launch = `taskChatOpen` (W2) ; merge/commit = simulation | Ignore `ownership.result` ; pas de copie ; pas d’item Pilote dans ce rail |
| `sprintCockpitInput` | Identités **figées Sprint 4** `DA40-015-A/B` | Pas un listing MT Sprint 7 (aucun `list()` bindings) |
| `TaskOwnershipSnapshot.result` | SDK : `TaskQueueResult` (`selected` / `complete` / `blocked`) déjà renvoyé par `POST /global/ownership` | Mapper App **ne lit pas** `result` |
| `TaskQueue` (DA30-009) | File séquentielle Schema/Core : une sélection, fail-closed | Autorité d’éligibilité **déjà** là ; pas un graphe MT DAG |
| `TaskPilotView` | Action de **cycle** d’une carte (Analyze/Plan/…) | Pas le conducteur sprint ; ne pas le réécrire |
| Launch cockpit | Ouvre/reprend le chat lié ; **n’envoie pas** de prompt | W2 OK ; ≠ S2 (copie) |

## Décisions proposées (à valider pour Plan)

1. **Où.** Conducteur sur le **chrome existant** : rail workbench + `/sprint/cockpit` (surface pilote) + inspecteur Tâche. Pas de rewrite OpenCode. Pas de 3ᵉ peau. Pas de session staging avec tools.
2. **Éligibilité (S1).** Consommer `ownership.result` (déjà public SDK). `selected.id` = **éligible**. Autres cartes = waiting / blocked avec `reason` observée. `complete` = aucune. `blocked` = file entière fail-closed (`unknown` / raison), jamais une 2ᵉ carte « quand même OK ». La file séquentielle **est** la dépendance ; ne pas inventer d’arêtes MT.
3. **Rail.** Même mapper pour cockpit et workbench. Badge / libellé **Eligible** ou **Blocked** (faits seulement). Item **Pilot** : `aria-current` si l’URL est `/sprint/cockpit`.
4. **Prompt (S2).** Bouton **Copier le prompt** : panneau Task status du cockpit **et** inspecteur Tâche. Texte **uniquement** depuis faits observés, gabarit maquette : `Skill apex-task. Carte {id}. cwd = {worktreeLabel}. Base {head}.` Fait absent → pas de SHA/chemin inventé ; copie **désactivée** (ou lignes omises, jamais un faux HEAD). Clipboard seulement. **Interdit** : `taskChatOpen`, `SessionPrompt`, `TaskExecution.resume`, envoi composer.
5. **Launch existant.** Conservé pour une carte **éligible** avec worktree observé (W2). Désactivé si non éligible / worktree `unknown`. Launch n’injecte pas le prompt.
6. **Pilote ne code pas (S4).** Le chat pilote **reste** `/sprint/cockpit` : pas de composer agent, pas de tools Write/Edit/Bash. Panneau : « No write tools — pilot does not code ». Ne **pas** ouvrir un chat staging mutatif pour le Pilote. Distinguer visuellement Pilot vs carte. Merge Git = toujours simulation (S3 = DA20-006).
7. **Identités.** Garder `sprintCockpitInput` A/B (projection existante). Pas de découverte live Sprint 7 (pas d’API list). Recette honnête : file A→B sur ces identités.
8. **Honnêteté / API.** App n’importe jamais Core. **Aucun** nouvel HttpApi. `result` déjà sur le snapshot. Jamais un faux éligible.
9. **Tests / smoke.** Mapper : selected → A éligible, B bloquée ; `blocked` → aucune éligible. Prompt fail-closed si HEAD unknown. Copie ≠ Launch. Rail : badge + Pilot current sur cockpit. Typecheck `packages/app`. Smoke : cockpit + inspecteur Tâche, copie, pas de tool d’écriture sur le pilote.

## Hors périmètre (confirmé)

S3 merge / push / retirer worktrees (DA20-006). `make dev` (DA40-019). Graphe de dépendances MT au-delà de `TaskQueue`. Nouveau HttpApi. Session pilote avec tools. `TaskExecution.resume`. Rewrite `/sprint/cockpit` chrome 0.3. Identités Sprint 7 live.

## Pathset probable

- App : mapper `result` + prompt, rail (cockpit + session), inspecteur Tâche, panneau sprint, i18n `en.ts`, tests
- Réemploi : `loadSprintCockpit`, `TaskQueueResult` SDK, `packInspectorTaskView`, clipboard / toast existants
- APEX `blocs/` + smoke/verify
- Hors pathset : Protocol/HttpApi ; Core ; generated ; Git mutatif

## Risques

- Identités A/B Sprint 4 ≠ sprint actif : le UI le dit via les `display_id` observés, on n’invente pas DA10-011 dans le rail.
- `TaskQueue` ≠ DAG MT : une seule éligible à la fois.
- Clipboard : tests unitaires du **texte** ; smoke visuel du bouton.
- Ne pas transformer Launch en orchestrateur (S2).

## Décisions ouvertes

Aucune métier hors gabarit (décision 4). À valider : les 9 décisions ci-dessus.
