# Smoke — DA20-006

- Status: PASS (cockpit + make-dev HTTP ; session UI inspecteur = limite)
- App Mini: `http://192.168.1.97:4406/sprint/cockpit` (pas `127.0.0.1` MacBook)
- Backend Mini: `http://192.168.1.97:4106`
- `.make.env` local ignoré `WORKTREE_CODE=06` `HOST=192.168.1.97` → `4106`/`4406`
- Fixture `/tmp/da20-006-fixture-91` code `91` → `4191`/`4491` (non versionnée)
- `appPorts.range` : `registry.json` absent ; formule Make `4100+code` / `4400+code` respectée
- Sleep : `00_cursor-config` sans `dev-stop` ; TERM PID bash OWNED `8494` → ports 4106/4406 libres. `runtime_profile: none`

## Cockpit (browser Cursor intégré)

| Check | Résultat |
| --- | --- |
| HTTP 200 cet arbre Vite | PASS |
| Rail Pilote + cartes A/B | PASS |
| Launch disabled (ownership inaccessible, fail-closed) | PASS |
| Merge → dialogue simulation | PASS |
| Copy staging / never force-push / never master or develop | PASS |
| Acknowledge simulation, HEAD Git inchangé `20c60ffea` | PASS |
| Copy prompt disabled (HEAD unknown) | PASS |

## Make-dev borné (directory ≠ ROOT App)

| Check | Résultat |
| --- | --- |
| GET cet arbre (06) | `off` ports `4106/4406` (processus MakeDev ≠ listeners smoke) |
| POST start cet arbre ports occupés | `off` + `make exited 2` ; listeners **06 encore là** |
| POST start fixture 91 | `on` `4191/4491` |
| POST stop fixture 91 | `off` ; App 06 encore 200 |
| Session UI inspecteur Serveurs | **limite** : `ClientError: Transport` (même classe DA40-019 sans session saine) |

`.make.env` non commité.
