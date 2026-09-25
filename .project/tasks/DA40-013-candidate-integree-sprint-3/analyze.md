# Analyze — DA40-013 — Candidate intégrée Sprint 3

## Objectif et autorité

Valider la candidate locale Sprint 3 dans
`/Users/leanbot/Documents/40_Daidalon/features/s3-integration`, branche
`sprint3-integration`, puis préparer le handoff de recette parent. Le mandat
borné est [OP-DA40-013-integration](../../../../../../Daidalon/.project/journals/OP-DA40-013-integration.md) :
checks et smoke local uniquement; aucun commit, push, merge, rebase, tag,
publication, déploiement, suppression ou build sur staging.

## Préconditions observées

- MT Sprint 3 relu : DA10-004, DA30-005, DA30-006 et DA30-007 sont `done`;
  DA40-013 est passé de `todo` à `in_progress` et a été relu (update
  `aca4ad8d-810f-464d-83d1-00f71e003c19`, reread
  `abc8a766-0f28-4c19-9ead-fb56e90f39c7`).
- Base `10e1234b3b08b986ef966f01d04e25bbf1185433` ancêtre de HEAD
  `442a1311f06d970ccbb1bc77bc9eda78f81c42d9`; worktree propre.
- Les commits ordonnés sont `738d5cc25` (manifeste Schema), `6b53bc34a`
  (TaskPilot Core/CLI), `7374a3ea3` (TaskMetrics Core/HTTP/SDK) et
  `442a1311f` (vue App). Le diff cumulé porte 24 chemins uniques, `1393+ / 26-`;
  l’export Schema commun est touché par deux commits.

## Contrats et protections de régression

- `TaskPilot` conserve des transitions MT/APEX fail-closed et la CLI ne
  modifie aucune autorité.
- `TaskMetrics` expose les métriques HTTP/SDK; un coût sans provenance reste
  `unknown`, jamais zéro.
- L’index Schema exporte les deux contrats `TaskPilot` et `TaskMetrics`; la
  résolution mécanique observée les conserve tous deux.
- La vue App rend une action suivante explicable, bloque les observations
  incomplètes/divergentes et n’active « Open task » qu’avec session et
  worktree.
- Le changement de route HTTP impose `bun run generate` dans `packages/client`
  selon `AGENTS.md`; le delta généré attendu est nul.

## Risques et recette manuelle

Le risque principal est une incompatibilité de contrat inter-package ou une
génération SDK non déterministe. B1 exécute typechecks, suites touchées et
génération; B2 exécute les smokes CLI, HTTP et état UI. Le parent conserve le
jugement visuel : deux tailles (1440×900 et 1024×768), affichage du panneau
Task Pilot, retour à la ligne des identifiants et état de bouton.

## Question ouverte

Aucune : le mandat, les dépendances MT et la candidate exacte déterminent le
parcours. Aucun changement métier n’est requis par cette tâche d’intégration.
