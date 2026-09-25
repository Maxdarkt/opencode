# Plan — DA40-020 — Afficher CPU/RAM des process du worktree

Analyze accepté (6 décisions). Worktree
`/Users/leanbot/Documents/40_Daidalon/features/tasks/DA40-020-process-cpu-ram`,
branche `task/DA40-020-process-cpu-ram`, HEAD `8db56f535`.
`runtime_profile: none` jusqu’au Smoke. Pas de staging, pas de
DA30-014 / DA30-015, pas de start/stop réécrit.

## Décisions

1. Onglet Serveurs existant. L’App formate `MakeDev.status`. Elle ne
   mesure pas.
2. Somme = handle possédé par `MakeDev` de cette `Location` +
   descendants. Jamais un scan machine, jamais un autre worktree.
3. `MakeDev.Status` : `cpuPercent` (nombre fini ≥ 0, peut dépasser 100)
   et `rssBytes` (`NonNegativeInt`), tous deux optionnels. Pas de
   chaîne dans l’API. `bun run generate` dans `packages/client`.
   L’App n’importe pas Core.
4. OFF ou pas de process possédé → `—`. `unknown`, ou ON sans les deux
   champs → `unknown`. ON avec les deux → `n% · n Mo` (entiers,
   `rssBytes / 1048576`). Jamais `12% · 410 Mo`.
5. Si l’état est `on`, `GET /api/make-dev` toutes les 2 s. Pas de poll
   en `off` / `unknown`. Le poll ne fait pas de POST.
6. `ps` / `pgrep` en échec, plateforme autre, ou plafond de marche
   atteint → champs absents. Pas de charge globale.

## B1 — Schéma et échantillon Core

- `packages/schema/src/make-dev.ts` : ajouter les deux champs
  optionnels sur `Status`. Protocole inchangé (il réexporte déjà
  `MakeDev.Status`).
- `packages/core/src/make-dev.ts` : fonction pure
  `sumProcessTree(rows, rootPid)`. Ligne = `pid`, `ppid`, `cpuPercent`,
  `rssKilobytes`. Inclure la racine et les descendants seulement.
  `rssBytes = somme des Ko × 1024`.
- Marche réelle, seulement si un handle est vivant : `pgrep -P` depuis
  ce PID, puis `ps -p <liste> -o pid=,ppid=,pcpu=,rss=`. Plafond 8
  niveaux et 64 PID. Au-delà, ou commande en échec → pas de champs.
  `status` / la réponse de `start` portent l’échantillon. `stop` retire
  le handle puis relit (donc `—`).
- Test dans `packages/core/test/make-dev.test.ts` : un PID étranger
  est exclu ; `cpuPercent` sommé peut dépasser 100 ; Ko → octets.
  Pas de `make dev` réel pour ce cas.

Check : depuis `packages/core`, `bun test test/make-dev.test.ts`.
Depuis `packages/schema`, `bun typecheck`.

## B2 — Client généré

- Depuis `packages/client` : `bun run generate`. Ne pas éditer
  `src/generated` ni `src/generated-effect` à la main.
- Les deux champs apparaissent dans le type `MakeDev.Status` généré.

Check : `bun run check:generated` puis `bun typecheck` dans
`packages/client`. `bun typecheck` dans `packages/protocol` et
`packages/core`.

## B3 — Affichage et poll

- `packages/app/src/pages/session/session-make-dev.ts` : étendre le
  type local (miroir, pas un import Core). `packInspectorServersView`
  applique la décision 4. `Math.round` sur le pourcentage et sur les
  mébioctets.
- `session-make-dev-context.tsx` : intervalle 2 s, GET seul, tant que
  `state === "on"`. `onCleanup` arrête le timer. Start/stop mutent
  comme aujourd’hui.
- `session-make-dev.test.ts` : OFF → `—` ; ON sans nombres →
  `unknown` ; `cpuPercent: 3`, `rssBytes: 104857600` → `3% · 100 Mo` ;
  `150.2` et `1048576` → `150% · 1 Mo`.

Check : depuis `packages/app`,
`bun test --conditions=solid --preload ./happydom.ts ./src/pages/session/session-make-dev.test.ts`
puis `bun typecheck`. `git diff --check`.

## Pathset

`packages/schema/src/make-dev.ts` ; `packages/core/src/make-dev.ts` ;
`packages/core/test/make-dev.test.ts` ; `packages/client` generate ;
`packages/app/src/pages/session/session-make-dev.ts` ;
`session-make-dev-context.tsx` ; `session-make-dev.test.ts`.

Hors pathset : Makefile, `.make.env` commité, Session/V2, PTY,
Permissions, Browser iframe, coûts, adaptateurs abo, staging.

## Smoke

Profil `web-api`, au palier Smoke seulement. Listener de **cet**
arbre sur `0.0.0.0`. Port = `UI_PORT` de son `.make.env`, dans
`appPorts.range` du registre projet. Sinon arrêt.

Chemin : `/${base64Encode(fixtureDir)}/session`. `base64Encode` est
celui de `packages/core/src/util/encode.ts` (le décodeur de
`decode64`). `fixtureDir` = répertoire de fixture créé dans ce
worktree, `WORKTREE_CODE=91`, ports `4191` / `4491`, Makefile stub
`sleep` (même idée que le test Core). Le slug est calculé au Smoke
et écrit dans `smoke-report.md` avant la navigation. Pas un autre
chemin.

1. L’App et le backend de ce worktree restent ceux du `.make.env`
   local. Ne pas lancer `make dev` sur ces ports.
2. Session = `fixtureDir`. Start →
   `[data-slot="inspector-servers-cpu"]` matche `^\d+% · \d+ Mo$`,
   différent de `12% · 410 Mo`, dans les 6 s.
3. Stop → le même slot vaut `—`.

Alerte courte, puis navigateur intégré, même tour. Puis sleep Smoke.

## Verify

Typechecks B1–B3, tests B1 et B3, `check:generated`, `git diff --check`.
Commit local si tout est vert. Pas de push / merge.

Après « Lance le build » : B1 → B2 → B3, puis Smoke, puis Verify.
Pas d’arrêt entre les blocs.
