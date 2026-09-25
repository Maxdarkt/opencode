# C2 — Consommation de l’autorité DA30-008

Le panneau consomme `task.authority` du contexte local. Seul `state: available` avec binding concordant transmet `mtStatus` et `apexPhase` au pilote; absent, expiré, invalide ou divergent retourne `context_incomplete`, sans valeur ni action inférée.

Checks : `bun install --frozen-lockfile` sans diff `bun.lock`; `bun typecheck`; pilote 4/4, 21 assertions; `git diff --check` PASS. Commit : `aeee8b73ea08ab4c1fa1d516054cce007ea627bf`.

Pass B parent : intégrer ce commit, configurer `OPENCODE_TASK_AUTHORITY_SNAPSHOT` avec fixture fraîche puis vérifier à 1440×900 et 1024×768 les valeurs/action disponibles et les états fail-closed.
