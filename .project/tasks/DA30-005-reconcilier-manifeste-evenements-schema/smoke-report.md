# Smoke technique — DA30-005

## Résultat

PASS. Le manifeste importé réellement dans `packages/schema` expose les 58 définitions
Server canoniques dans l'ordre vérifié, dont les trois événements Revert actuels avant
le segment V1 live. Aucun événement V1-only n'est ajouté au manifest Server.

## Preuves

| Contrôle | Commande | Résultat |
| --- | --- | --- |
| Régression ciblée | `bun test --cwd packages/schema test/event-manifest.test.ts` | PASS — 2 tests, 22 assertions |
| Typecheck | `bun run --cwd packages/schema typecheck` | PASS — `tsgo --noEmit` |
| Suite Schema | `bun test --cwd packages/schema` | PASS — 15 tests, 48 assertions |
| Hygiène diff | `git diff --check` | PASS |

## Pass B visuel (parent)

Non applicable : aucun écran, route, compte, fixture distante ni jugement visuel n'est
produit par cette tâche de contrat. Le parent peut examiner le diff et les sorties de
test; voir le plan pour les états et régressions ciblés.

## Reprise

Si la revue parent relève une divergence, remettre MT à `in_progress`, relire le
`STATE.md` et `plan.md`, puis créer un bloc correctif borné à partir du manifeste/test
concerné avant de rejouer les quatre contrôles ci-dessus.
