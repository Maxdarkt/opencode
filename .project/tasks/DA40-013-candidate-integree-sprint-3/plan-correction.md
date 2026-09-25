# Plan correction — DA40-013 — Fixture concordante

## Mandat

La délégation parent autorise la correction de recette locale et, si nécessaire,
un helper versionné avec commit local borné. La cible est uniquement
`/Users/leanbot/Documents/40_Daidalon/features/s3-integration` au HEAD
`c9bbcde78ab304a3bd37f8b74364df9fb12ade53`; aucun appel ni écriture MT,
staging, push, merge, rebase ou déploiement.

## B3 — Générateur de fixture locale

Ajouter un script de développement `packages/opencode/script/create-task-pilot-fixture.ts`.
Il reçoit les chemins absolus et inexistants de la base SQLite et du snapshot,
ainsi que le worktree cible. Il mesure la branche/HEAD, construit les tables
Project/Session/TaskBinding/TaskExecution via les services Core, écrit un
snapshot d’autorité version 2 frais (TTL court) qui correspond au binding, puis
vérifie localement l’observation `available` et la décision `write_plan`.

## B4 — Preuve et recette parent

Exécuter le script avec deux fichiers temporaires explicites, vérifier sa sortie
et les fichiers produits, relancer typecheck/tests Core/OpenCode/App touchés et
conserver le worktree propre hors script. La recette parent exporte exactement
`OPENCODE_DB` et `OPENCODE_TASK_AUTHORITY_SNAPSHOT`, démarre backend/App hors
staging, ouvre la session imprimée, et confirme à 1440×900 puis 1024×768
`available`, `in_progress`, `analyze`, `write plan` et un bouton actif.

## Arrêt

Arrêter si la fixture ne peut pas créer un binding et ownership concordants dans
une base explicitement isolée, si le snapshot ne produit pas `available`, ou si
la recette exige un statut MT réel. Aucun contournement par snapshot divergent,
expiré ou statut inventé n’est permis.
