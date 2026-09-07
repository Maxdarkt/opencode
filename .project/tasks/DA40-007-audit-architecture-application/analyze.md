# Analyze — DA40-007

Analyse réalisée le 2026-09-06 dans `/Users/leanbot/Documents/40_Daidalon/features/40-tooling`.

## Objectif

Documenter l’architecture réellement exécutée par Daidalon à partir du dépôt amont OpenCode, puis fournir un cadre de décision pour conserver l’architecture locale ou introduire un backend et/ou une base de données distants. Aucun code produit, backend, schéma ou migration ne sera ajouté.

## Autorités et périmètre

- Projet MT : `DA`, Sprint 1 `da-release-0.1-sprint-1`, carte `DA40-007` passée de `todo` à `in_progress` et relue dans MT (`f46d3fda-5317-4cf2-817c-7c99ad2acff6`).
- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/40-tooling`, branche `40-tooling`.
- Modèle effectif mesuré dans le contexte du thread : `gpt-5.6-luna`, conforme au modèle prévu ; aucune divergence de modèle ne bloque Build.
- APEX : `.project/apex.json` v2, suivi `tracked` ; le parent reste propriétaire de `PLAN-GENERAL.md`, `sprint.md`, des documents globaux de sprint/release et du registre runtime.
- État Git initial mesuré : HEAD `1b327889841111256dfbc88f9cb063f848cc661b`, index vide, modifications et artefacts hérités documentés par le worktree ; aucune modification héritée ne doit être réécrite.

## Constat principal

Le dépôt est un monorepo Bun (`package.json:25-32`) issu de `anomalyco/opencode` (`package.json:120-123`). Il contient plusieurs applications et bibliothèques, mais le parcours local validé par DA40-003 est composé de :

1. `packages/app`, UI Solid/Vite servie sur `http://127.0.0.1:4440` ;
2. `packages/opencode`, processus Bun qui écoute `http://127.0.0.1:4140` et expose l’HTTP API ;
3. les packages de contrat et de runtime (`schema`, `protocol`, `client`, `server`, `core`, `llm`) chargés par ces deux surfaces.

La présence de `packages/console`, `packages/stats`, `packages/web`, `packages/slack`, Electron, TUI et CLI décrit la largeur du dépôt amont ; elle ne prouve pas leur exécution dans la candidate locale Daidalon.

## Preuves relues

- Manifests : `package.json`, `packages/app/package.json`, `packages/opencode/package.json`, `packages/core/package.json`, `packages/server/package.json`, `packages/schema/package.json`, `packages/protocol/package.json`, `packages/client/package.json`, plus les manifests console/stats/web/slack/desktop.
- Entrée et serveur : `packages/opencode/src/index.ts`, `packages/opencode/src/cli/cmd/serve.ts`, `packages/opencode/src/cli/cmd/web.ts`, `packages/opencode/src/server/server.ts`, `packages/opencode/src/server/routes/instance/httpapi/api.ts` et ses groupes/handlers.
- Composition runtime : `packages/opencode/src/effect/app-runtime.ts` et `packages/opencode/src/server/routes/instance/httpapi/server.ts`.
- Persistance : `packages/core/src/database/database.ts`, `packages/core/src/database/sqlite.bun.ts`, `packages/core/src/database/path.ts`, les schémas Drizzle `packages/core/src/{project,session,event,account,credential,permission,share}/*.sql.ts`, `packages/opencode/src/storage/storage.ts` et `packages/core/src/global.ts`.
- Client : `packages/app/src/context/server.tsx`, `packages/app/src/context/server-sdk.tsx`, `packages/app/vite.config.ts`.
- Preuves historiques : analyse et smoke de DA20-001, DA30-003 et DA40-003 ; les conclusions historiques sont conservées comme contexte et ne remplacent pas la lecture du code courant.
- Smoke DA40-003 : `evidence/manifest.json`, `evidence/process-cwd.txt`, `evidence/listeners.txt`, `evidence/http-smoke.json`, `evidence/health.response` ; backend Bun `27514` sur `4140`, UI Node/Vite `27516` sur `4440`, réponses HTTP 200.

## Architecture à documenter

- Frontend : Solid/Vite, préférences locales navigateur/plateforme, sélection d’un serveur HTTP et appels SDK/compatibilité.
- Contrats : Schema → Protocol → Client/SDK ; `packages/opencode/src/server/routes/instance/httpapi/api.ts` assemble les groupes Root, Global, Event et Instance.
- Backend exécuté : `packages/opencode` initialise `AppRuntime`, compose Core/Session/Provider/Tool/MCP/Git/Workspace/Worktree/LSP et démarre `Server.listen`.
- Localisation et fichiers : `Global.Path` déduit data/config/state/cache/tmp/log/repos sous XDG ; les sessions portent `directory`, `path` et `workspace_id` facultatif.
- Données : SQLite local ouvert par Bun, WAL et migrations appliquées au démarrage ; Drizzle porte projets, répertoires, sessions, messages, parts, inbox V2, epochs de contexte, événements, permissions, credentials, comptes, workspaces et partages.
- Compatibilité : `packages/opencode/src/storage/storage.ts` conserve un stockage JSON sous `Global.Path.data/storage` et ses migrations historiques. Les chemins Session/Message/Part actuels lus par `Session` et `MessageV2` passent par Drizzle/SQLite ; il ne faut pas présenter la couche JSON comme l’autorité unique actuelle.
- Externe : fournisseurs LLM, catalogue modèles, MCP, GitHub/GitLab, partage et OAuth peuvent être appelés par le runtime ; leur présence ne transforme pas le serveur local en backend SaaS.

## Régressions et risques

1. Confondre monorepo et produit exécuté : les packages console/stats et leurs bases distantes ne sont pas la BDD du parcours local.
2. Confondre `packages/server` (contrats/middleware/handlers réutilisables) avec le processus backend ; le listener courant est dans `packages/opencode`.
3. Confondre HTTP local et absence de backend : `packages/opencode` est déjà un backend local consommé par l’UI.
4. Conclure qu’aucune base n’existe en voyant encore le stockage JSON historique ; les tables Drizzle et `Database.path()` prouvent le contraire.
5. Déclarer une architecture distante nécessaire sans besoin produit : la cible Sprint 1 est mono-utilisateur/local et dispose d’un serveur et d’une BDD locaux.
6. Déduire que les surfaces console/stats (PlanetScale/Athena/Firehose/SST) sont actives dans Daidalon ; elles appartiennent aux surfaces cloud amont et devront être traitées séparément si la cible évolue.

## Questions restantes traitées au Plan/Build

- Produire une carte de modules et de flux avec frontières UI/client/protocole/serveur/core/session/stockage/fournisseurs.
- Expliciter les données qui restent locales et les limites de la preuve d’exécution.
- Définir les déclencheurs, prérequis, impacts sécurité/données/exploitation et tâches APEX pour un backend ou une BDD distants.
- Vérifier le lien documentaire et le rendu Mermaid sans lancer de migration ni appeler de fournisseur.

## Décision de passage

Le mandat enfant autorise l’enchaînement autonome des phases ; Analyze est suffisamment borné. Plan peut commencer. Le parent garde la réception visuelle finale et la clôture métier.
