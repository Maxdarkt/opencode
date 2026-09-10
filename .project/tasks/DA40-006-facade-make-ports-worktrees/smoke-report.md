# Smoke report — DA40-006

Date : 2026-09-06. Smoke technique uniquement; aucune recette visuelle ni aucun serveur persistant n'est requis.

| Vérification | Résultat |
| --- | --- |
| `make config-check` | vert avec le code `40` et les ports `4140/4440` |
| configuration invalide (`BACKEND_PORT=1`) | refusée : formule attendue `4140/4440` |
| `make help`, `make ports`, `make context` | verts; branche `40-tooling`, HEAD `50019f223` affichés |
| `make preflight-ports` | vert; ports 4140 et 4440 libres |
| `DRY_RUN=1 make dev-app`, `dev-server`, `dev` | verts; commandes Vite/opencode et injection Vite visibles |
| `make -n dev` | vert et sans lancement de processus après correction de sous-Make |
| contrat de préflight `dev`/enfants | vert : global `4140 4440`, backend seul `4140`, UI seule `4440` |
| contrat de supervision `dev` | vert : PID directs Bun/Vite, détection de fin, arrêt/reap du survivant, validés par parsing/expansion sans lancement |
| listeners 4140/4440 après smoke | absents |
| `git check-ignore .make.env` dans les cinq racines | vert |
| `make format`, `make typecheck`, `git diff --check` | verts |

Incident corrigé durant B01 : `make -n dev-app` exécutait une sous-invocation `$(MAKE)` et a lancé temporairement Vite. Le PID créé par cette validation (`8068`) a été arrêté, sans toucher à un processus préexistant. La correction supprime cette sous-invocation spéciale ; le parsing final n'a créé aucun listener.

Pass B : non requis. Le parent effectue la revue et la décision métier, pas de smoke UI demandé.
