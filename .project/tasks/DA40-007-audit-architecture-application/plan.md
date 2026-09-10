# Plan — DA40-007

Plan établi le 2026-09-06 après Analyze, dans le même worktree et sans élargir le périmètre produit.

## Contrat de sortie

Produire une architecture durable et factuelle qui :

- distingue dépôt amont, architecture réellement exécutée et cible Daidalon ;
- répond explicitement monorepo/projet classique, modules, backend et BDD actuels ;
- relie UI, client, protocole, serveur, core, session, Git/workspace, stockage et fournisseurs ;
- identifie les données locales et les surfaces cloud non exécutées dans le parcours local ;
- donne une matrice de décision pour conserver le local, ajouter un backend distant et/ou ajouter une BDD distante ;
- décrit prérequis, impacts, migrations et prochaines tâches APEX sans implémentation implicite ;
- fournit au moins un Mermaid rendu/validé et un lien stable depuis la documentation produit.

## Frontières

Écriture autorisée :

- `.project/tasks/DA40-007-audit-architecture-application/*` ;
- `docs/product/architecture.md` ;
- le lien ciblé dans `docs/product/conception.md`.

Lecture seule : code, manifests, schémas, routes, preuves DA20-001/DA30-003/DA40-003, Git et endpoints locaux déjà actifs.

Interdit : backend, migration, schéma, dépendance, protocole, runtime, `PLAN-GENERAL.md`, `sprint.md`, documents globaux de sprint/release, registre runtime, redémarrage/arrêt de processus, fournisseur réel, commit, push, merge, rebase ou suppression.

## Blocs bornés et vérifiables

### B01 — Architecture actuelle et flux

Créer `docs/product/architecture.md` à partir des faits mesurés. Couvrir les trois vues (amont, exécutée, cible), carte des modules, frontières de dépendances, processus UI/backend, API/événements, session/agent/outils, Git/workspace, SQLite/JSON/XDG et fournisseurs. Ajouter un schéma Mermaid lisible et des références de fichiers/positions.

Validation : toutes les assertions d’exécution locale ont une preuve DA40-003 ou un manifeste/source courant ; les surfaces cloud sont étiquetées non exécutées.

### B02 — Décision backend/BDD et index documentaire

Compléter le document avec réponse courte aux questions utilisateur, matrice local/backend distant/BDD distante, déclencheurs, impacts sécurité/données/exploitation, prérequis et tâches APEX suivantes. Ajouter un lien depuis `docs/product/conception.md` sans modifier le plan général.

Validation : aucun choix SaaS non demandé ; distinction nette entre serveur local HTTP et backend distant ; SQLite actuelle et ses tables restent explicites ; lien relatif résolu.

### B03 — Checks et smoke technique documentaire

Vérifier le Markdown, les liens internes, les blocs Mermaid, `git diff --check`, l’absence de code/runtime modifié et la cohérence avec les manifests/schémas. Réutiliser les endpoints déjà actifs par GET seulement (`/global/health`, UI `/`) sans redémarrage. Exécuter le check de migration en lecture seule si disponible, sans génération.

Livrables : `blocs/B01.md`, `blocs/B02.md`, `smoke-report.md`, `debts.md`, `handoff.md` et mise à jour de `STATE.md` à chaque checkpoint.

## Ordre et dépendances

B01 → B02 → B03. Les blocs restent séquentiels car B02 relit le document produit par B01 et B03 vérifie l’ensemble final. Aucun bloc parallèle.

## Scénarios de smoke

1. Le document existe, son schéma Mermaid est délimité, et ses liens relatifs ciblés existent.
2. Les manifests prouvent les workspaces ; les sources prouvent `Server.listen`, `AppRuntime`, `Database.path`, `Global.Path` et les tables Drizzle.
3. Les preuves DA40-003 prouvent UI `4440`, backend `4140`, health et index HTTP 200, sans attribuer le serveur à une BDD distante.
4. `git diff --check` et vérification des chemins ne montrent pas d’erreur documentaire ; les modifications restent limitées aux fichiers autorisés et aux artefacts APEX de DA40-007.

## Risques et gestion

- Un état Git hérité très chargé est préservé ; le diff final sera comparé à la liste initiale.
- Le dépôt amont expose plusieurs BDD/clouds ; le document les marque comme surfaces amont et ne les utilise pas pour conclure sur le runtime local.
- Mermaid n’est pas compilé par un renderer imposé dans le dépôt ; une validation structurelle et une visualisation/relecture ciblée suffisent, avec limite explicitée.
- Le parent reste responsable du smoke visuel, de la réception et du passage ultérieur à `done`.

## Décision de passage

Le mandat enfant fournit l’autorisation de dérouler Plan puis Build documentaire, Smoke et Verify sans gate conversationnelle intermédiaire. B01 peut commencer.
