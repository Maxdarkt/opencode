# Plan — DA40-021 — Ports 6400 et bind réseau

`runtime_profile: none` jusqu’au Smoke. Pas de stack Supabase, pas de `config.toml`. Docs et archives `4140` / `4440` hors chemin.

## B01 — Registre DA

Dépôt `/Users/leanbot/Documents/Codex/codex-workflow-config`. Seul fichier édité : `projects/registry.json`, bloc `DA` uniquement.

`appPorts` :

- `range` `[6400, 6499]`, `source` `[6400, 6409]`
- domaines `10` `[6410, 6419]`, `20` `[6420, 6429]`, `30` `[6430, 6439]`, `40` `[6440, 6449]`
- retirer `legacyFrontendRange`
- Supabase inchangé (`[56420, 56429]`, api `56421` … pooler `56429`)

Ne pas modifier le hunk LC déjà présent, ni les autres fichiers sales.

Contrôle : `node scripts/check-project-registry.mjs` vert sur la copie de travail.

Commit local, sans push. Le diff du commit est seulement l’ajout du projet DA (ports 6400). La suppression LC reste non indexée après le commit :

1. Éditer le bloc DA, puis copier le fichier complet hors dépôt.
2. Reconstituer le fichier commité depuis `HEAD:projects/registry.json` plus le bloc DA nouveau. LC identique à HEAD.
3. `git add projects/registry.json` et commit `feat(registry): place Daidalon app ports on 6400`.
4. Restaurer la copie complète. `git diff` ne montre plus que le hunk LC.

`git show --stat` : un seul fichier. Refus si le patch touche LC ou un autre projet.

## B02 — Écoute 0.0.0.0

Worktree uniquement.

Chemin :

- `Makefile` — `HOST ?= 0.0.0.0`. Garde : UI `6400 + code`, backend `6400 + code + 2`. `--host` et `--hostname` restent `$(HOST)`.
- `.make.env.example` et `.make.env` — fichier réel, pas un lien vers staging. `WORKTREE_CODE=00`, `UI_PORT=6400`, `BACKEND_PORT=6402`, sans `HOST`. `.make.env` reste ignoré, hors commit.
- `packages/app/src/entry.tsx` — en DEV, si l’hôte Vite est `0.0.0.0`, l’URL API utilise `location.hostname` et `VITE_OPENCODE_SERVER_PORT`.

Contrôles, sans serveur :

- `make config-check`
- `DRY_RUN=1 make dev` contient `0.0.0.0`, `6400`, `6402`, et pas `127.0.0.1`
- `bun typecheck` dans `packages/app`

## Smoke

Profil `web-api`, réveillé pour ce palier seulement. URL figée : `http://<tailscale ip -4>:6400/sprint/cockpit`.

Avant navigation : `UI_PORT` lu dans `.make.env` de ce worktree, et ce port dans `appPorts.range` `6400–6499`. Sinon stop.

Premier appel navigateur : `browser_navigate` seul, `newTab: true`, `position: "active"`. Pas de `browser_tabs`. Pas de navigateur graphique sur cet hôte. Puis lock et snapshot. La réponse HTTP doit être cette app.

Sommeil des PID de cette carte avant `smoke-report.md`. `runtime_profile: none`.

## Verify

Rejouer `config-check`, le dry-run et `bun typecheck` de `packages/app`. Smoke PASS. Aucun `config.toml`.

Commit local du worktree, sans push ni merge : `feat(opencode): bind local servers on 6400`. Inclure le Makefile, l’exemple, `entry.tsx` et le dossier APEX. Exclure `.make.env`. Puis la remise sprint.
