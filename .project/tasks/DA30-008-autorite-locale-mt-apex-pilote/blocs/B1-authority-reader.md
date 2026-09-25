# B1 — Contrat et lecteur local

Ajout de `TaskAuthority.Snapshot` et `TaskAuthority.Observation`, puis du service Core de lecture seule. Le chemin vient de `OPENCODE_TASK_AUTHORITY_SNAPSHOT` (ou d’un chemin de test explicite); le service ne crée, ne modifie ni ne découvre aucun fichier. Il refuse schéma/autorité/horodatage invalides, expiration, entrée absente, divergence worktree/HEAD et couple DA30-006 invalide. Les valeurs MT/APEX n’apparaissent qu’à l’état `available`.

Preuve: `bun --cwd packages/core test test/task-authority.test.ts` PASS (disponible, divergence, expiration) et typechecks Schema/Core PASS.
