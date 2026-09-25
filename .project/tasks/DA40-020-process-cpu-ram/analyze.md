# Analyze — DA40-020 — Afficher CPU/RAM des process du worktree

## Git, MT, autorité

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA40-020-process-cpu-ram`
- Branche : `task/DA40-020-process-cpu-ram` @ `8db56f535` (base staging). Arbre propre hors liens locaux (`node_modules`, `.make.env` gitignoré).
- APEX : `.project/tasks/DA40-020-process-cpu-ram`
- MT `DA40-020` : `in_progress` (Sprint 8 — `da-release-0.1-sprint-8`)
- Thème DA40 ≠ checkout `features/40-tooling`. Aucun code produit sur `staging`.
- Dépendances faites : inspecteur (DA10-008 / DA10-009) et start/stop `make dev` (DA40-019).
- `runtime_profile: none`. Aucun serveur démarré pour cet Analyze.

## Objectif

E4 : dans l’onglet **Serveurs**, afficher la charge **observée** des process locaux de **cet** arbre (`make dev` possédé : serveur + Vite). Maquette : `12% · 410 Mo` si ON, `—` si OFF. Ces chiffres de maquette restent interdits.

## Surfaces observées (ce HEAD)

| Surface | État | Écart DA40-020 |
| --- | --- | --- |
| `packInspectorServersView` | OFF → `cpuRam: "—"` ; ON et unknown → `"unknown"` | ON n’a pas de mesure |
| Inspecteur `data-slot="inspector-servers-cpu"` | Affiche `cpuRam` tel quel | Emplacement prêt |
| `MakeDev.Status` | `state`, host, ports, `worktreeCode`, `error` | Pas de CPU ni de RSS |
| `MakeDev` Core | Un handle possédé, `make -C <directory> dev`, stop = ce handle seulement | Pas d’échantillon du groupe |
| Poll UI | `GET /api/make-dev` au changement de directory, puis start/stop | Pas de rafraîchissement tant que ON |
| Conception / livrable | Charge des process du worktree (serveur, Vite). Fait absent = `unknown`, jamais un faux zéro | À câbler |
| Maquette `cockpit.html` | `12% · 410 Mo` | Valeur figée, hors produit |

## Décisions proposées (à valider pour Plan)

1. **Où.** Même onglet Serveurs. Pas de nouveau panneau. L’App ne mesure rien : elle formate les champs renvoyés par `MakeDev.status`.

2. **Qui.** Uniquement le handle possédé par `MakeDev` de **cette** `Location` et ses descendants (groupe de `make dev`). Jamais un scan machine, jamais un `bun`/`vite` d’un autre worktree, jamais un PID que ce service n’a pas lancé.

3. **Contrat.** Champs optionnels sur `MakeDev.Status` : `cpuPercent` (somme, peut dépasser 100) et `rssBytes`. Pas de chaîne d’affichage dans l’API. `bun run generate` dans `packages/client` après le HttpApi. L’App n’importe pas Core.

4. **Affichage.** OFF ou pas de process possédé → `—`. État `unknown`, ou ON sans échantillon → `unknown`. ON avec échantillon → `n% · n Mo` (entiers, RSS en mébioctets). Jamais recopier `12% · 410 Mo`.

5. **Rafraîchissement.** Tant que l’état est `on`, relire `GET /api/make-dev` toutes les 2 s pour cette session. Arrêter le poll en `off` / `unknown`.

6. **Échec honnête.** Plateforme ou lecture du groupe impossible → champs absents, UI `unknown`. Pas de repli sur la charge globale de la machine.

## Hors périmètre

Coûts et budgets (DA30-014). Adaptateurs d’abonnement (DA30-015). Start/stop, ports, iframe Browser (DA40-019, déjà faits). Permissions. Tuer un process. Push / merge / rebase / `staging`. Worktrees `features/10-…`.

## Pathset probable

- `packages/schema/src/make-dev.ts` — champs optionnels
- `packages/core/src/make-dev.ts` — échantillon du groupe possédé dans `status`
- `packages/protocol` seulement si le groupe HttpApi doit exposer les champs (déjà `MakeDev.Status`)
- `packages/client` — `bun run generate`, pas d’édition de `src/generated`
- `packages/app` — format `cpuRam`, poll 2 s, tests `session-make-dev`
- Tests Core du parse d’échantillon (PID injecté, pas un `make dev` réel)

## Tests / smoke (esquisse Plan)

- Unitaire : OFF → `—` ; ON sans nombres → `unknown` ; ON `cpuPercent=3`, `rssBytes=104857600` → `3% · 100 Mo` ; un autre PID n’entre pas dans la somme.
- Typecheck des packages touchés.
- Smoke : onglet Serveurs de la session de **cet** arbre. Après Start, la case n’est ni `unknown` ni `12% · 410 Mo`. Après Stop, `—`. Chemin exact figé au Plan (route session déjà servie par DA40-019).

## Risques

- `make` détaché : mesurer seulement le PID `make` sous-compte Vite et le backend. La somme du groupe est le critère.
- `%CPU` sommé peut dépasser 100. L’afficher tel quel.
- Le poll 2 s ne doit pas relancer `make dev`.

## Décisions ouvertes

Aucune. À valider : les 6 décisions, en particulier la somme du groupe (3) et le poll 2 s (5).
