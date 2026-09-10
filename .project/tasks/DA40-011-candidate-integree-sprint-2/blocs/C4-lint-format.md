# C4 — Gate lint/format avant B5

## Attribution

Le premier lint ciblé comptait 43 avertissements dans cinq fichiers App. L'attribution ligne par
ligne avec `git blame` contre la base `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2` établit :

- 8 avertissements introduits par les commits Sprint 2 : 3 casts inutiles dans
  `project-context-view.tsx`, 3 assertions `as never` dans `active-task-write-guard.test.ts`, un `!`
  inutile dans `prompt-input/submit.ts` et un cast d'`Event` dans le test de refus d'écriture ajouté
  à `prompt-input/submit.test.ts` ;
- 35 avertissements préexistants : 20 dans `pages/session.tsx`, 13 dans
  `prompt-input/submit.test.ts`, 2 dans `prompt-input/submit.ts` ;
- répartition préexistante : 3 `no-unused-vars`, 11 `consistent-return`, 15
  `no-unsafe-type-assertion`, 5 `unbound-method`, 1 `no-unnecessary-boolean-literal-compare`.

Les deux refus Prettier concernaient `active-task-write-guard.ts` et son test, tous deux introduits
par Sprint 2.

## Corrections bornées

- Suppression des trois casts redondants de `project-context-view.tsx`.
- Test unitaire du guard recentré sur son préflight direct, sans stubs incomplets `as never`.
  L'intégration réelle `sendFollowupDraft` et la restauration du brouillon restent exercées par
  `prompt-input/submit.test.ts`.
- Retrait du non-null assertion redondant `session!.id` et usage d'un vrai `Event` dans la seule
  occurrence ajoutée par Sprint 2.
- Reflow Prettier mécanique du guard et de son test.

Aucun contrat ni comportement produit ne change : les edits de production retirent seulement des
assertions TypeScript sans effet runtime ou modifient le format. Aucune règle n'est désactivée ou
masquée.

## Vérifications

- Inventaire Oxlint final des 27 sources intégrées : 35 avertissements base, 0 Sprint 2.
- Oxlint strict `--deny-warnings` sur les trois fichiers C4 autonomes : PASS, 0 avertissement.
- Prettier sur les 27 sources intégrées : PASS.
- App ciblée : PASS — 13 tests, 46 assertions.
- App typecheck : PASS.
- `git diff --check` : PASS; index vide; aucun fichier Client/SDK généré dirty.

## Git, dette et reprise

HEAD reste `9d0decb2be8abd1d7e7a31b28117572b0d873606`, divergence base `0 derrière / 10 devant`.
Le pathset produit non committé C1/C3/C4 contient 7 fichiers, 32 insertions et 34 suppressions.
Les 35 avertissements préexistants restent une dette distincte : ils empêchent un
`--deny-warnings` plein fichier, mais aucune ligne Sprint 2 n'est rouge.

C4 est terminé. Le parent peut reprendre la réconciliation finale B4 sur cette preuve, puis ouvrir
B5 seulement après acceptation du gate candidat; aucun smoke B5 n'a été commencé ici.
