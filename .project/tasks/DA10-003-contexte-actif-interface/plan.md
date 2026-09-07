# Plan — DA10-003

## Mandat

Message parent du 2026-09-07 après réception de DA20 `a70bf26…` et DA30 `1de05c0…` : intégrer les
commits, puis conduire DA10 de l’Analyze à la review. Les commits dépendants sont déjà présents
dans ce worktree (`8a06e7b…`, `b914e645…`). Aucun push, merge, rebase, promotion, reset, nettoyage
destructif ou modification des projections Sprint n’est autorisé.

## Blocs

### B1 — Projection de contexte en lecture seule

Étendre `LocalContext.Info` et le handler `global.context` pour retourner le binding de la session
et le snapshot ownership/effets quand ils existent. Fournir les services Core au serveur et
régénérer les clients exigés par le dépôt. Tests : route auth/lecture existante, types et génération.

### B2 — Présentation UI fail-closed

Construire le sélecteur d’état et enrichir `ProjectContextView` : projet Core, sprint explicitement
indisponible si absent du contrat, tâche, session, worktree, branche, HEAD, owner/génération/effets;
états concordant/incomplet/divergent/reprise et indicateur d’écriture désactivée hors concordance.
Tests : table d’états et cas de régression de divergence.

### B3 — Vérification et handoff

Exécuter génération, tests ciblés et typechecks des paquets touchés, smoke technique local, puis
produire `smoke-report.md`, `verify.md`, handoff et plan de smoke visuel parent. Commiter seulement
les paths DA10 validés, jamais les projections Sprint préexistantes.
