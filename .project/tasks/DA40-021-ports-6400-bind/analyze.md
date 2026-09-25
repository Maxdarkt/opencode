# Analyze — DA40-021 — Ports 6400 et bind réseau

## Contexte

- Carte MT `DA40-021`, titre « Ports 6400 et bind réseau », sprint `da-release-0.1-sprint-7`.
- Worktree `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA40-021-ports-6400-bind`, branche `task/DA40-021-ports-6400-bind`, HEAD `03f621743`.
- Arbre propre. `node_modules` (racine et paquets) sont des liens vers le checkout source ; les lockfiles coïncident. `.make.env` du source n’est pas lié : l’éditer modifierait staging.
- `runtime_profile: none`. Aucun serveur lancé.

## Registre Codex

Dépôt `/Users/leanbot/Documents/Codex/codex-workflow-config`, HEAD `5012f2c` (base demandée). Le bloc `DA` n’est pas dans HEAD : il est déjà dans la copie de travail de `projects/registry.json`, avec la plage historique `4100–4199` et `legacyFrontendRange` `4400–4499`.

La même copie vide aussi `executionWorktrees` du projet LC. Ce hunk est préexistant. Le commit de cette carte ne doit contenir que l’ajout du bloc DA. Après le commit, la suppression LC reste non indexée. Aucun autre fichier déjà modifié de ce dépôt n’est touché.

`legacyFrontendRange` est optionnel dans le schéma. Le validateur ne l’exige que s’il est présent. Le retirer du bloc DA suffit ; `projects/registry.schema.json` et `scripts/project-registry.mjs` restent intouchés.

Cible du bloc `appPorts` :

- `range` `[6400, 6499]`
- `source` `[6400, 6409]`
- domaines : `10` `[6410, 6419]`, `20` `[6420, 6429]`, `30` `[6430, 6439]`, `40` `[6440, 6449]`
- noms, chemins et branches de domaines inchangés
- Supabase inchangé : plage `[56420, 56429]`, api `56421` … pooler `56429`

Le contrôle `node scripts/check-project-registry.mjs` suit cet edit, puis un commit local de `projects/registry.json` seul, sans push.

## Formule Make

`Makefile` impose encore `backend = 4100 + code` et `UI = 4400 + code`, et `HOST ?= 127.0.0.1`. `.make.env.example` a `WORKTREE_CODE=40`, `4140` / `4440`, `HOST=127.0.0.1`. `.make.env` est absent ici et ignoré par Git.

`6400` / `6402` sont le créneau source (code `00`) : UI = offset primaire `0`, backend = offset api `2`. Le code `40` serait `6440` / `6442`. Les deux fichiers d’env prennent donc `WORKTREE_CODE=00`, `UI_PORT=6400`, `BACKEND_PORT=6402`, sans clé `HOST`.

La garde `config-check` devient `UI = 6400 + code`, `backend = 6400 + code + 2`. Le défaut d’écoute passe à `0.0.0.0` (`vite --host`, `bun serve --hostname`).

## Client et Supabase

`packages/app/src/entry.tsx` construit l’URL du backend avec `VITE_OPENCODE_SERVER_HOST`. Si cette valeur est `0.0.0.0`, le panneau du MacBook appelle `0.0.0.0` au lieu de l’IP Tailscale. En DEV, un hôte d’écoute `0.0.0.0` doit être remplacé par `location.hostname`, le port restant `BACKEND_PORT`.

Aucun `config.toml`, aucun client Supabase. Les seules occurrences sont des libellés d’icônes. Pas de stack Supabase, pas de `config.toml`.

## Hors chemin

Les mentions `4140` / `4440` dans `docs/product/architecture.md` et les archives de tâches restent historiques. Le chemin de smoke proposé pour le plan est `/sprint/cockpit` (`SESSION_SPRINT_COCKPIT_HREF`). URL : `http://<tailscale ip -4>:6400/sprint/cockpit`, panneau Cursor du MacBook.

## Chemin prévu

1. Bloc DA du registre, check, commit local Codex (fichier unique, hunk LC laissé de côté).
2. `Makefile`, `.make.env.example`, `.make.env` local, hôte client DEV.
