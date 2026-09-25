# Smoke — DA40-020

- Statut : PASS
- Profil : `web-api`, puis sleep. Listeners `*:6440` (UI) et `*:6442` (backend), dans `appPorts.range` 6400–6499.
- `.make.env` local gitignoré : `WORKTREE_CODE=40`, `UI_PORT=6440`, `BACKEND_PORT=6442`, `HOST=0.0.0.0`. Le lien vers le fichier staging (code 00, ports 4100) ne passait pas `config-check`.
- Fixture : `.project/tasks/DA40-020-process-cpu-ram/fixtures/code-91` (non versionnée). Slug `base64Encode` du chemin. Session `ses_f27f74a40ffeibd7ZqnbkIO38V`, directory = cette fixture.
- URL : `http://100.112.223.7:6440/${slug}/session` puis la route session serveur. Navigateur intégré Cursor.
- CORS : le navigateur vient de `http://100.112.223.7:6440`, refusé par le serveur (localhost seulement). Relance du backend de **cet** arbre avec `--cors` de cette origine. Pas un second stack.

## Inspecteur Serveurs

| Étape | `inspector-servers-state` | `inspector-servers-cpu` |
| --- | --- | --- |
| Avant Start | `OFF` | `—` |
| Après Start | `ON · 4191 / 4491` | `0% · 3 Mo` |
| Après Stop | `OFF` | `—` |

`0% · 3 Mo` matche `^\d+% · \d+ Mo$` et n’est pas `12% · 410 Mo`.

## Sleep

`make dev-stop` dry-run puis `APPLY=1` sur les PID OWNED 40465, 40486, 40487. kill count 3. Ports 6440 et 6442 libres. `runtime_profile: none`.
