# Smoke report — DA30-006

## Smoke technique enfant

### Environnement et préconditions

- Worktree produit : `/Users/leanbot/Documents/40_Daidalon/features/s3-30-apex-cycle`, branche
  `apex-cycle`, HEAD `10e1234b3b08b986ef966f01d04e25bbf1185433` avant changements.
- Bun `1.3.9`; dépendances restaurées par `bun install --frozen-lockfile`, sans changement de lock.
- Le pilote a besoin d'options observées seulement; aucun serveur, SQLite, compte, MT, fichier APEX
  live ou session n'est requis.

### Parcours exercé

`bun run src/index.ts task pilot` depuis `packages/opencode` a retourné les huit actions admises :

1. `todo` sans phase → `start_analyze`;
2. `in_progress` + `analyze`, `plan`, `build`, `smoke`, `verify` → respectivement `write_plan`,
   `start_build`, `run_smoke`, `verify`, `request_review`;
3. `review` + `verify` et `done` + `verify` → `parent_close` sans mutation enfant;
4. `blocked` → `mt_blocked`, contexte divergent → `context_divergent`, et `review` + `build` →
   `invalid_status_phase`.

La commande n'a produit aucun effet de persistance : le diff Git ne contient que les cinq sources et
tests B1/B2; aucune migration, table ou fichier APEX/MT/session/worktree du produit n'est créé.

## Limites

- Les statuts MT et phases APEX sont des observations externes explicites : cette commande ne les
  rafraîchit, ne les écrit ni ne les déduit.
- Le pilote ne calcule ni composition de Sprint ni coûts. `task_binding` n'ayant pas d'appartenance
  Sprint et les coûts `Step.Ended.cost=0` étant sans provenance tarifaire durable, toute interface
  future doit recevoir les IDs MT autoritatifs et représenter l'absence de prix par `unknown`.
- Aucun navigateur ou serveur n'est nécessaire à ce smoke technique; le jugement visuel reste parent.

## Plan de smoke visuel parent

| Élément | Plan actionnable |
| --- | --- |
| Environnement | Candidate Sprint 3 intégrant DA30-006 et DA10-004; runtime local, données de démonstration sans compte externe. |
| Préconditions | Une carte MT existante avec external_ref APEX, session/worktree/HEAD concordants; fixtures pour chaque phase et les statuts `in_progress`, `review`, `blocked`; aucun effet TaskExecution pending sauf scénario de reprise. |
| Route/action | Ouvrir la vue Sprint, choisir la tâche existante, vérifier que phase APEX et statut MT sont affichés séparément, lire la prochaine action. Faire évoluer les fixtures Analyze → Plan → Build → Smoke → Verify → review; tenter contexte divergent, pending/resuming, MT blocked et paire review/build. |
| Viewport | Desktop `1440×900`, puis `1024×768` pour vérifier que statut, phase, action et motif restent visibles. |
| États attendus | Chaque état admis affiche l'action v1 exacte; `review` et `done` montrent une clôture parent non cliquable côté enfant; les blocages désactivent le pilote et exposent leur motif; aucun passage de statut n'est inféré d'une phase. |
| Régressions | Binding/session/worktree/HEAD divergents, effet pending, phase absente hors todo, double rendu de la même tâche, données Sprint sans IDs MT et coût absent doivent rester explicites et sans faux zéro. |
| Preuves | Captures des vues analyse/build/review et blocage, sortie JSON pilote correspondante, trace de l'identité de reprise, HEAD candidate et absence de mutation MT/APEX après clic/refresh. |

## Reprise/correction

En cas d'écart UI, parent remet la carte `review` à `in_progress` après relecture, signale le snapshot
et reprend un bloc correction borné. Les écarts de contrat sont corrigés dans `task-pilot.ts`; une
lecture MT/APEX ou un calcul de coût/Sprint exige un scope séparé.
