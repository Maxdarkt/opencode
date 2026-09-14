# Analyze — DA30-012 Bornes agent

## Objectif, mandat et limites

Livrer C4 dans le worktree
`/Users/leanbot/Documents/40_Daidalon/features/tasks/DA30-012`, branche
`agent-bounds`, base/HEAD `ee629dd7f` (DA30-013 Verify). Un drain Session V2
s’arrête : tours, budget tokens, temps. Interrupt réel. Idle = no-op. Signal
d’état lisible pour DA10-008. Pas de course à vide 30 min.

Hors périmètre : UI bandeau (DA10-008), pack (DA30-013 fait), coûts $ honnêtes
et alertes sprint (DA30-014), watchdog provider-stream (spec V2 différé),
runtime V1 `packages/opencode`, HTTP/SDK sauf si le Plan exige un événement
Schema pour le signal. Pas de `TaskExecution.resume`. Pas de Build sur
staging.

## Évidence et point de départ

- **Tours** — le runner V2 honore `agent.info.steps` s’il est défini
  (`packages/core/src/session/runner/llm.ts`) : dernier tour = `toolChoice:
  "none"`, outils vides, `MAX_STEPS_PROMPT`. Tests existants : « final step »
  et reset au steer. `Info.empty` et agents sans config n’ont **pas** de
  `steps` → `while (needsContinuation)` illimité. Course à vide possible.
- **Interrupt** — déjà réel. `sessions.interrupt` →
  `SessionExecution.interrupt` → `SessionRunCoordinator` : idle/missing =
  no-op ; actif = `Fiber.interrupt`, wake coalescé annulé, inbox durable
  conservée. HTTP `session.interrupt` déjà câblé. Tests coordinator + runner
  (outils, provider, settlement). TODO runner encore ouvert : statut durable
  busy/idle/interrupted.
- **Budget** — `SessionEvent.Step.Ended` publie `cost: 0` en dur. Les tokens
  d’usage viennent de `stepSettlement` (provider). `session.cost` /
  `session.tokens` existent en projection. Aucune borne « dépassement →
  arrêt ». Un gate sur `cost === 0` serait un faux zéro (interdit DA30-007).
  Le $ honnête est DA30-014 ; C4 s’appuie sur les **tokens mesurés**.
- **Temps** — spec V2 : timeout/watchdog **provider** volontairement différé.
  Aucune deadline de **drain**. Timeouts outils/shell ≠ borne agent. Un drain
  qui continue des tools peut tourner 30 min.
- **Course à vide** — TODO runner : « Bound provider retries and repeated
  identical tool calls » non fait. Tours + temps + budget suffisent pour C4 ;
  ne pas ouvrir un détecteur d’appels identiques ici.

## Contrat retenu

1. **Tours** — plafond fini **toujours**. `limite = min(agent.steps, DEFAULT)`
   si `steps` est posé, sinon `DEFAULT` (Plan : 50, aligné exemples OpenCode
   `build`). Même chemin `MAX_STEPS_PROMPT` / `toolChoice: none`. Un nouveau
   input (steer/queue) reset le compteur comme aujourd’hui.
2. **Budget** — après chaque step avec usage provider : somme
   `input+output+reasoning` du drain (cache.read exclu du plafond, comme
   « tokens brûlés »). Si usage absent → `unknown`, **ne pas** traiter comme
   0, ne pas arrêter sur cette axe. Plafond : config `bounds.tokens` ou
   défaut Plan (fenêtre contexte, pas un $). Jamais de gate sur `cost: 0`.
   Ne pas « corriger » le `cost: 0` publié (DA30-014).
3. **Temps** — deadline **drain** (horloge murale), défaut **30 min** (preuve
   C4). Pas un inactivity watchdog SSE. À échéance : même chemin qu’Interrupt
   (outils unsettled, assistant « interrupted » / raison `timeout`). Idle :
   pas de timer.
4. **Interrupt** — inchangé sémantiquement. Garantir tests idle no-op + actif
   coupe le drain. Exposer **pourquoi** le drain s’est arrêté :
   `interrupt | steps | budget | timeout`. Source pour DA10-008 avec
   `sessions.active()` (running vs idle). Événement Schema minimal plutôt que
   parser des strings d’erreur. Live-only acceptable si le Plan évite
   `bun run generate`.
5. **Stop** — dépassement = plus de `needsContinuation` (sauf steer déjà
   promu : le reset tours s’applique ; budget/temps du **drain** restent).
   Pas de nouvel appel `llm.stream` après borne.

## Régressions à protéger

- `agent.steps` absent → s’arrête quand même au DEFAULT, pas Infinity ;
- `agent.steps` plus petit que DEFAULT → ce plus petit gagne ;
- interrupt idle / session inconnue → no-op, pas d’erreur ;
- interrupt actif → drain s’arrête, inbox persistée, outils pending →
  `Tool execution interrupted` ;
- tokens usage absents → pas d’arrêt budget, pas de `0` inventé ;
- `cost: 0` Step.Ended inchangé ;
- prune / `promptCacheKey` DA30-013 inchangés ;
- pas de timeout universel sur `llm.stream` (spec V2).

## Risques et décisions

- Ne pas porter les bornes dans V1 `SessionPrompt`. Politique métier = runner
  V2 (Daidalon).
- Ne pas attendre DA10-008 : le bandeau consommera `active()` + raison.
- Ne pas fusionner avec DA30-014 : pas d’affichage $ ni faux zéro.
- Config : un petit objet `bounds` (steps défaut, tokens, duration) plutôt
  que disperser trois knobs. Valeurs exactes au Plan.
- Checks : `bun typecheck` + tests `packages/core` (runner + coordinator),
  jamais la racine.

## Entrée Plan

Blocs : (1) contrat Schema raison d’arrêt + defaults bounds ; (2) plafond
tours toujours fini dans le runner ; (3) budget tokens + deadline drain +
signal ; tests ciblés. Pathset centré `packages/core` (+ Schema si événement).
