# Plan — DA30-013 — Packer le contexte

## Mandat et frontière

Analyze accepté (`analyze.md`). Worktree
`/Users/leanbot/Documents/40_Daidalon/features/tasks/DA30-013`, branche
`context-pack`, HEAD `493f3aa31`. Pas de staging, pas
`features/30-agent-runtime`, pas de commit/push/merge avant Verify.

Livrer C2/C3/C5 : pack borné au worktree, prune live V2 avant overflow,
préfixe cache-stable. Hors périmètre : UI, HTTP/SDK, DA10-008, DA30-012,
runtime V1 `packages/opencode`, `TaskExecution.resume`, second estimateur.

Pas de route HTTP : C1 consommera Schema+Core plus tard. `session.context`
et `TaskMetrics` inchangés (réemploi des états tokens).

## Décisions filaires

1. **Pack** — objet métier `ContextPack` : mandat (system agent + dernier
   input user visible), `worktree` = `Location.directory`, `pathset` relatif
   strictement sous ce cwd, `omitted` + `provenance` pour tout chemin hors
   borne (staging, sibling, `global.config/AGENTS.md`). Pas d’arbre auto.
   Sources pathset : instructions observées dans le worktree, pièces jointes,
   fichiers cités par le mandat.
2. **Tokens** — `tokensBefore` / `tokensAfter` = `TaskMetrics.Tokens`.
   Estimateur unique `Token.estimate`. Absence → `{ state: "unknown",
   provenance }` sans `value`. Jamais `0` inventé. Un `0` mesuré/estimé n’est
   légitime que si l’estimateur rend 0 sur un request vide.
3. **Prune (C3)** — fonction pure sur le request live (copies, pas de
   mutation durable). Seuils V1 : `PRUNE_PROTECT=40_000`,
   `PRUNE_MINIMUM=20_000`, troncature 2k, outils protégés `skill`.
   `compactIfNeeded` inchangé (résumé ancré). Prune **avant** `llm.stream`.
4. **Cache (C5)** — `promptCacheKey` = hash hex ≤64 de
   `cwd + règles rendues + identité outils matérialisés`. Plus l’ID session.
   Deux sessions même location / mêmes règles / mêmes outils → même clé.
   Date : **après** le préfixe (update system), jamais dans le baseline
   hashé ni en tête du system. `cache.read` provider → `measured` ; sinon
   `unknown` (pas `0`).
5. **Checks** — toujours depuis le package (`packages/schema`,
   `packages/core`). Jamais `bun test` à la racine.

## Blocs Build

### B1 — Schéma `ContextPack`

Fichiers : `packages/schema/src/context-pack.ts` (nouveau),
`packages/schema/src/index.ts`.

Contrats publics : `ContextPack`, `Pathset`, `OmittedPath`, `CachePrefix`
(cwd, `rulesHash`, `toolsIdentity`). Tokens = import `TaskMetrics.Tokens`,
pas un nouveau tagged union. Aucun Core, aucun test runner.

Check : `bun typecheck` depuis `packages/schema`. `git diff --check` ciblé.

### B2 — Assemblage Core (C2 + preuve + préfixe)

Fichiers : `packages/core/src/context-pack.ts` (nouveau),
`packages/core/test/context-pack.test.ts` (nouveau).

Fonctions testables (pas de Layer HTTP) : borner le pathset ;
assembler le pack ; hasher le préfixe cache. Chemins hors
`Location.directory` → `omitted`. Tokens via `Token.estimate` + états
DA30-007.

Cas tests : fichier dans le worktree ; chemin `staging` / sibling omis ;
`AGENTS.md` global omis du pathset (provenance) ; tokens absents →
`unknown` sans `value` ; même cwd+règles+outils → même hash ; un des
trois change → hash change.

Check : `bun typecheck` et
`bun test test/context-pack.test.ts` depuis `packages/core`.

### B3 — Prune live + clé cache runner (C3, C5)

Fichiers : `packages/core/src/session/compaction.ts`,
`packages/core/src/session/runner/llm.ts`,
`packages/core/src/session/runner/to-llm-message.ts` si le prune s’y
accroche, `packages/core/src/system-context/builtins.ts` (date hors
baseline), tests :
`packages/core/test/session-compaction.test.ts`,
`packages/core/test/session-runner.test.ts` (assertions `promptCacheKey`),
`packages/core/test/system-context/builtins.test.ts`.

Avant `llm.stream` : prune des sorties outils anciennes si gain ≥
`PRUNE_MINIMUM` au-delà de `PRUNE_PROTECT` ; sous seuil → aucune
sortie effacée. `promptCacheKey` = préfixe B2, plus l’ID session.
Ajuster les tests « concurrent sessions » et « 64-char session » :
même location → même clé ; longueur ≤64. Date visible en update,
baseline = env (+ instructions), pas `Today's date`.

Check : depuis `packages/core` :
`bun test test/context-pack.test.ts test/session-compaction.test.ts test/session-runner.test.ts test/system-context/builtins.test.ts test/task-metrics.test.ts`
puis `bun typecheck`. `git diff --check` ciblé.

## Pathset

- `packages/schema/src/context-pack.ts` (nouveau)
- `packages/schema/src/index.ts`
- `packages/core/src/context-pack.ts` (nouveau)
- `packages/core/src/session/compaction.ts`
- `packages/core/src/session/runner/llm.ts`
- `packages/core/src/session/runner/to-llm-message.ts` (si besoin prune)
- `packages/core/src/system-context/builtins.ts`
- `packages/core/test/context-pack.test.ts` (nouveau)
- `packages/core/test/session-compaction.test.ts`
- `packages/core/test/session-runner.test.ts`
- `packages/core/test/system-context/builtins.test.ts`

Hors pathset : `packages/opencode` V1, HTTP/SDK/`bun run generate`, UI,
`TaskMetrics` schéma, `session.context`, staging.

## Smoke (après B3, pas maintenant)

Pas de chrome. Smoke technique = les checks B3 + preuve tokens avant/après
prune (`estimated`, after < before à mandat égal) + pathset hors worktree
vide + clé cache stable. Aucun provider réel. `cache.read` absent →
`unknown`.

## Risques

- Tests runner figent encore la clé = ID session : à réécrire en B3, pas à
  conserver.
- `SystemContext.make` refuse un baseline vide : date en update / message
  system post-baseline, pas un baseline `""`.
- Instruction globale hors cwd : hors pathset, peut rester dans les règles
  hashées si elle est réellement envoyée.
- Collision faible avec DA30-012 (autres fichiers).

## Autorité

B1–B3 autorisés par ce Plan après « Lance le build ». Enchaîner les trois
blocs puis Smoke puis Verify. Pas de commit/push/merge avant Verify vert.
