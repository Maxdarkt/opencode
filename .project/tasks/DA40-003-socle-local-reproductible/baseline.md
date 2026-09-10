# Baseline — 2026-09-06
Bun 1.3.14, lockfile intact, aucun fichier produit modifié.
| Contrôle | Résultat |
|---|---|
| app : worktree, server-health, directory-picker-domain | 37 pass, 0 fail |
| llm : endpoint | 3 pass, 0 fail |
| core : location | 1 pass, 0 fail |
| bun run typecheck : app, llm, core, opencode | 4 exit 0 |
| GET backend /global/health | 200, healthy true, version local |
| GET UI / et /src/entry.tsx | 200 ; port backend 4140 injecté |
Commandes exactes et cwd : evidence/checks.json. Logs individuels conservés.
Sélection ciblée, pas de suite complète ni d'appel modèle. Ne qualifie pas les parcours session/admission V1/V2, tâche DA30-003.
Premier GET backend trop tôt : connexion refusée ; serveur ensuite prêt, GET rejoué 200 sans restart. Voir backend.log et http-smoke.json.
