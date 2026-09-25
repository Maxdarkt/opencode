# B1 — Contrat et évaluateur pilote

## Résultat

- `packages/schema/src/task-pilot.ts` expose le wire contract v1 sérialisable : phase APEX, statut
  MT, état de contexte, action, motif de blocage, entrée et résultat discriminé.
- `packages/core/src/task-pilot.ts` réexporte les contrats canoniques et fournit `evaluate(input)`
  pur, déterministe et sans I/O. Il donne priorité au contexte et à MT `blocked`, puis accepte
  uniquement la table de décision publiée pour DA10-004.
- `packages/core/test/task-pilot.test.ts` couvre les huit états admis, les quatre blocages et les
  couples incohérents/idempotence.

## Correction bornée

Le premier essai de test ne pouvait résoudre aucun paquet dans le worktree neuf; `bun install
--frozen-lockfile` a restauré les dépendances sans modifier le lockfile. Une incompatibilité réelle
Effect v4 a ensuite révélé que `Schema.Union` attend un tableau; `Schema.Union([Next, Blocked])`
est maintenant le contrat chargé. Aucun comportement hors B1 n'a été ajouté.

## Checks

- `bun test test/task-pilot.test.ts` depuis `packages/core` : PASS, 3 tests / 15 assertions.
- `bun typecheck` depuis `packages/core` : PASS.

## Suite

Construire B2 : commande CLI `opencode task pilot` qui décode ce contrat et imprime l'évaluation,
sans persistance ni mutation d'autorité externe.
