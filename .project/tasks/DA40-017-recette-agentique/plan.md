# Plan — DA40-017 — Recette 0.2 : tests de codage agentique isolés

## Mandat

Analyze validé. Recette d’intégration sur HEAD `9bcddb2c0` (`recette-agentique`).
Prouver la **chaîne** : open carte → write isolé vs `staging` → pack visible →
Interrupt qui coupe un drain mock. Pas de rewrite C1–C5 / W1–W2. Produit
seulement si un check démontre un trou (alors correctif borné, C1).

Worktree `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA40-017`.
Pas de code produit sur `staging`. Pas de `bun install` inutile (`bun.lock` =
blob du SHA). Pas de push / merge / rebase / `TaskExecution.resume` /
`git worktree add`. MT reste `in_progress`.

Succès = les 3 acceptations du scope, checks verts, smoke noté, Verify +
commit local du pathset.

## Décisions figées

1. **Nature.** Tests recette + APEX. Surfaces déjà livrées inchangées sauf
   trou d’isolation **démontré**.
2. **Harness.** Carte test = tmp `…/features/tasks/<id>` (git checkout, comme
   `conventionTree` DA10-007). Empreinte **lecture** du checkout source
   `/Users/leanbot/Documents/40_Daidalon/Daidalon` : `rev-parse HEAD` +
   `git status --porcelain` avant/après. Zéro écriture recette dans
   `staging`. Si le chemin source est absent (CI), stand-in git tmp nommé
   `Daidalon` + même protocole d’empreinte.
3. **Isolation.** Outil `write` (pas de LLM payant). Relatif `notes.md` →
   fichier seulement dans l’arbre carte. `../` → `relative_escape`, pas de
   fichier. Absolu sous `staging` + deny `external_directory` → empreinte
   identique. `ask` ≠ sandbox OS : la recette documente deny + escape.
4. **Pack.** Après open (et write isolé si le même process le permet) :
   `GET /api/session/:id/pack` → `worktree` = directory observé ; tokens
   `unknown` sans `value` ; `unknown` ≠ `"0"` / `$0.00`. Inspecteur App
   inchangé sauf trou.
5. **Interrupt.** Idle : `POST /api/session/:id/interrupt` → 204, no-op
   (session pas busy). Busy : drain mock (`TestLLMServer` hang / stream
   gated, pas de provider réel) → POST interrupt → plus busy. Preuve
   « stoppe un run » = ce check HTTP (Core runner déjà vert, ne pas le
   réécrire).
6. **Smoke.** `.make.env` local ignoré, jamais commité :
   `WORKTREE_CODE=17` → `4117` / `4417`. **Ne pas** réécrire les fixtures
   cockpit Sprint 4 A/B. Launch recette = `POST /global/task-chat/open`
   (`mtTaskID=DA40-017`, worktree de cette carte) puis vue session. Bandeau
   Idle, inspecteur Contexte/Coût honnêtes, Interrupt **absent** à Idle.
   Interrupt visuel running seulement si drain local mockable sans clé ;
   sinon limite notée dans `smoke-report.md` (preuve run = check B3).
7. **Honnêteté.** Pas de pathset inventé, pas de coût `0`, pas de write
   staging « simulé ». `bun.lock` du SHA uniquement.

## Blocs

### B1 — Isolation write vs staging

Fichier : `packages/core/test/coding-agent-isolation.test.ts` (nouveau).
Réutiliser le layer `WriteTool` de `tool-write.test.ts` (Location +
`PermissionV2` deny).

Cas :

1. Location = tmp convention carte. `write` `notes.md` → fichier présent
   uniquement sous ce directory.
2. `write` `../escape.md` → erreur `relative_escape` (ou message outil
   équivalent), aucun fichier hors Location.
3. `write` chemin absolu sous l’empreinte `staging` + `denyAction =
   "external_directory"` → pas d’écriture, empreinte HEAD+porcelain
   identique.

Ne pas étendre `tool-write.test.ts` (unitaire déjà là). Ici : empreinte
staging + convention carte.

Checks : depuis `packages/core`,
`bun test test/coding-agent-isolation.test.ts test/tool-write.test.ts`
puis `bun typecheck`. `git diff --check` pathset B1.

Livrable : `blocs/B1.md`.

### B2 — Open carte + pack visible

Fichier : `packages/opencode/test/server/coding-agent-recette.test.ts`
(nouveau). S’appuyer sur `httpapi-global` (`taskChatOpen` +
`conventionTree`) et `session-pack.test.ts` (`GET …/pack`).

Séquence :

1. Open `mtTaskID` recette + worktree tmp convention → `200`, `sessionID`.
2. `GET /api/session/:id/pack` → `worktree` = directory observé ;
   `tokensBefore` / `tokensAfter` `state: "unknown"` sans `value`.
3. Optionnel même process : write relatif dans ce directory (outil direct
   ou B1 déjà vert) puis pack encore honnête (worktree inchangé, pas de
   tokens `0`).

Ne pas modifier `sprint-cockpit-input.ts`. Ne pas `bun run generate`.

Checks : depuis `packages/opencode`,
`bun test test/server/coding-agent-recette.test.ts test/server/session-pack.test.ts test/server/httpapi-global.test.ts`
puis `bun typecheck`. `git diff --check` pathset B2.

Livrable : `blocs/B2.md`.

### B3 — Interrupt HTTP coupe un run

Même fichier recette (étendre). Idle d’abord : session ouverte, POST
interrupt → 204, pas busy.

Busy : `TestLLMServer` hang (`toolHang` / SSE hang) + prompt, puis POST
`/api/session/:id/interrupt` → drain plus busy (status idle / fiber
coupée). Pas de clé provider. Ne pas dupliquer les cas Core
`session-runner` / coordinator ; ce bloc = **fil HTTP**.

Pendant le run mock : empreinte staging inchangée (rejouer le snapshot
B1).

Si le hang HTTP s’avère non branchable sans rewrite produit : C1
uniquement pour exposer le drain mock au handler existant ; sinon stop
et noter le blocker. Ne pas inventer un interrupt « simulé ».

Checks : depuis `packages/opencode`,
`bun test test/server/coding-agent-recette.test.ts` ;
depuis `packages/core`,
`bun test test/session-runner.test.ts test/session-run-coordinator.test.ts`
(régression interrupt). `bun typecheck` opencode + core.
`git diff --check` pathset.

Livrable : `blocs/B3.md`.

## Pathset

- `packages/core/test/coding-agent-isolation.test.ts` (nouveau)
- `packages/opencode/test/server/coding-agent-recette.test.ts` (nouveau)
- `.project/tasks/DA40-017-recette-agentique/**` (plan, blocs, STATE,
  smoke-report, verify)

C1 seulement si check rouge : alors ajouter le fichier produit **minimal**
au pathset et le nommer dans `blocs/*.md`.

Hors pathset : `sprint-cockpit-input.ts` / fixtures A/B, chrome 0.3,
`$` DA30-014, prune/cache C3/C5, EventManifest, `src/generated`,
`.make.env`, `bun.lock`, staging, worktrees métier, `TaskExecution`.

## Smoke (après B3, même chaîne)

Alerte courte puis : `make config-check` / `dev` ports 17. Open DA40-017
via HTTP puis vue session. Preuves Idle + inspecteur + Interrupt absent.
`smoke-report.md`. Pas d’attente de collage.

## Verify + commit

`verify.md` : HEAD, pathset, typecheck core/opencode, tests B1–B3 +
régressions citées, smoke, SHA. Commit local
`test(opencode): recette agent de codage isolé` (ajuster le scope si C1
produit). Pas de push/merge. Remise au sprint. MT non `done` ici.

## Arrêts

Trou isolation non corrigeable dans le pathset / interrupt busy HTTP
impossible sans rewrite / checks encore rouges / secrets ou `bun.lock`
sale dans le diff / tentation d’écrire sur `staging`.
