# Plan — DA30-008

## Mandat

Le parent Sprint 3 autorise Analyze, Plan, Build local, checks, smoke technique, Verify et commit local borné après les checks. Sont exclus: mutation MT, mise à jour du snapshot, push, merge, rebase, déploiement, staging et smoke visuel.

## Contrat

`OPENCODE_TASK_AUTHORITY_SNAPSHOT` désigne un snapshot local explicite. Le lecteur ne le découvre pas et ne le modifie pas. Il exige le schéma v2, les autorités déclarées `mt-tasks`/`apex-task-folders`, une fenêtre `observedAt < expiresAt` encore valide, une entrée exacte par `mtTaskID`, une phase/valeur DA30-006 admise et un worktree/HEAD concordants si présents. Il expose valeurs, état, provenance et fraîcheur; tout échec omet les valeurs.

## Blocs

### B1 — Contrat et lecteur Core

Créer le schéma browser-safe d’observation et le service Core de lecture/décodage sans effet persistant. Tester disponible, absent, expiré, invalide, phase invalide et divergence identité.

### B2 — Projection HTTP/UI

Ajouter l’observation à `LocalContext.Info.task`, la servir avec le binding existant, puis faire consommer ses valeurs par le pilote seulement à l’état disponible/concordant. Régénérer le SDK requis. Tester le JSON HTTP et les états UI fail-closed.

### B3 — Smoke et Verify

Rejouer tests ciblés, types des paquets touchés, génération, lint/format/diff-check. Produire smoke, verify et handoff pour le parent; ne pas juger le visuel.

## Arrêt

Un snapshot non frais n’est pas une erreur à réparer par écriture: l’action reste bloquée. Tout besoin de lecture MT distante ou de gestion du cache est hors périmètre.
