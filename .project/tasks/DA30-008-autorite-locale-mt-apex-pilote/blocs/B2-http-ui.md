# B2 — Projection locale et pilote

`GET /global/context` joint l’observation à une liaison existante. La couche App ne transmet `mtStatus`/`apexPhase` à DA30-006 qu’avec `authority.state = available` et un contexte actif concordant; toute autre valeur reste `context_incomplete`. Le SDK v2 a été régénéré par son script officiel.

Preuve: tests HTTP LocalContext/OpenAPI, test App ciblé et typechecks OpenCode/App/SDK passent. Aucune mutation MT, APEX, Git ou cache n’est exécutée.
