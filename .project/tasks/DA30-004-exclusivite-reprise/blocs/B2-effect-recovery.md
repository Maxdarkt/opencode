# B2 — Frontières d'effet et reprise

- Statut : terminé le `2026-09-07T13:48:50+02:00`.

## Résultat

- `begin` persiste `pending` avant que l'appelant ne reçoive `execute`; un second appel refuse
  l'effet incertain. Un effet `confirmed` retourne `confirmed` et ne doit pas être rejoué.
- `confirm` exige le jeton actif et confirme idempotemment seulement un effet admis.
- `resume` revalide le binding DA20-003, l'identité du jeton et l'ownership courant avant toute
  modification. Les résolutions dupliquées ou sans effet `pending` sont rejetées.
- Toute résolution manquante ou `uncertain` conserve propriétaire, génération et effets intacts.
- Un effet observé `confirmed` est conservé; un effet observé `absent` est supprimé pour permettre
  un nouveau `begin`. Le transfert incrémente ensuite la génération et fence l'ancien jeton.

## Checks

- `bun test test/task-execution.test.ts test/task-binding.test.ts test/local-context.test.ts test/database-migration.test.ts` : PASS, 43 tests / 171 assertions.
- `bun typecheck` dans Schema : PASS.
- `bun typecheck` dans Core : PASS.
- `bun run script/migration.ts --check` : PASS, aucune dérive incrémentale.
- Oxlint ciblé `--deny-warnings` : PASS, 0 warning / 0 erreur.
- Prettier ciblé : PASS.
- `git diff --check` : PASS.

## Couverture d'interruption

- reprise refusée sans observation et avec observation `uncertain`;
- réconciliation atomique multi-effets `confirmed` + `absent`;
- refus d'un binding divergent avant mutation;
- refus d'une identité de reprise différente du jeton interrompu;
- refus de preuves dupliquées/superflues sans mutation partielle;
- fencing de l'ancien propriétaire après transfert.

## Déviation et suite

Aucune. B3 doit exécuter le smoke technique final, la suite Core utile, l'inventaire de pathset et
produire le handoff/plan de smoke parent avant commit borné.
