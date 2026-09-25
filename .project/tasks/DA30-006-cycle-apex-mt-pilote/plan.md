# Plan — DA30-006

## Mandat

Le mandat parent Sprint 3 couvre Analyze, Plan, Build local borné, tests, smoke technique, Verify et
handoff. Il exclut les mutations MT hors transitions explicitement relues, les documents canoniques
parent, staging, commit, push, merge, rebase, promotion, déploiement et destruction. Le contrat v1
est déjà publié pour DA10-004; il reste source d'interopérabilité pendant ce Build.

## Contrat d'implémentation

- `TaskPilot` reçoit uniquement `mtStatus`, `apexPhase` optionnelle et `context`; il ne lit ni
  n'écrit MT, APEX, Git, binding ou execution.
- La paire admise détermine une unique action : start Analyze, écrire Plan, commencer Build, lancer
  Smoke, Verify, demander review, ou signaler la clôture parent.
- `incomplete`, `divergent`, `resuming` et `blocked` gagnent sur la phase; les couples non admis
  sont fail-closed. `done` reste informatif et ne devient pas une commande enfant.
- La commande `opencode task pilot` valide ses options, imprime le résultat JSON stable et a zéro
  effet persistant. C'est une prévisualisation, pas un adaptateur MT/APEX.

## Blocs

### B1 — Wire contract et évaluateur pur

- Ajouter les schémas sérialisables `TaskPilot` dans Schema : phases, statuts MT, contexte,
  actions, entrée et résultat discriminé.
- Ajouter l'évaluateur pur dans Core et un test unitaire couvrant tous les parcours admis, les
  contextes prioritaires, couples invalides et idempotence (même entrée, même sortie).

### B2 — Commande pilote locale

- Ajouter le groupe CLI `task` et sa sous-commande `pilot` dans OpenCode.
- Exiger `--mt-status`, accepter `--apex-phase` et `--context`, décoder l'entrée strictement et
  imprimer le contrat JSON; options ou valeurs invalides échouent sans effet.
- Ajouter un smoke CLI reproductible de chaque parcours de la chaîne et d'un refus.

### B3 — Verify et handoff

- Rejouer tests ciblés, typechecks Schema/Core/OpenCode affectés, format/lint ciblés et
  `git diff --check`.
- Écrire bloc, smoke-report, verify, dette/handoff et le plan de smoke visuel parent. Passer à
  `review` uniquement après les preuves; jamais `done`.

## Risques et arrêt

Un besoin de lecture MT ou APEX locale, de mutation dans une autorité externe, de changement UI non
couvert ou de persistance d'un cache sans provenance dépasse le mandat et exige un scope. Deux échecs
bornés du même check déclenchent une révision de plan selon APEX. Aucun risque ouvert ne bloque B1.
