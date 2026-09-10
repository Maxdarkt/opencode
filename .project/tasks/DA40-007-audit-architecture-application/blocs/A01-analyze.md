# Bloc A01 — Analyze

- Statut : terminé le 2026-09-06.
- Entrée : `scope.md`, `STATE.md`, AGENTS, `.project/apex.json`, preuves DA20-001/DA30-003/DA40-003 et état Git courant.
- Transition MT : `DA40-007 todo → in_progress`, mise à jour `827fc042-ce79-40be-a67e-77dc587b5997`, relecture `f46d3fda-5317-4cf2-817c-7c99ad2acff6`.
- Modèle : `gpt-5.6-luna`, conforme au prévu.
- Résultat : périmètre documentaire borné ; monorepo amont distingué de la candidate locale ; backend local `packages/opencode` et SQLite/Drizzle prouvés ; stockage JSON historique identifié comme compatibilité/migration ; surfaces cloud non revendiquées comme exécutées.
- Fichier produit : `analyze.md`.
- Commandes de preuve : lecture des manifests/sources ciblées, `git rev-parse HEAD`, `git status`, lecture MT et preuves DA40-003.
- Aucun code, migration, fournisseur, serveur ou fichier global modifié.
- Reprise : `plan.md`, puis blocs documentaires séquentiels et smoke/checks.
