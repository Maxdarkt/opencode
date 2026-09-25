# DA30-005 — Réconcilier le manifeste d’événements Schema

## Objectif

Rétablir une suite `packages/schema` entièrement verte en définissant puis en appliquant la liste
et l'ordre canoniques du manifeste d'événements.

## Contexte et preuves

- La baseline Sprint 2 `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2` expose 58 définitions.
- `packages/schema/test/event-manifest.test.ts` en attend 55 et produit exactement deux échecs.
- Les mêmes échecs sont reproduits sans les changements DA20-003, DA30-004 et DA10-003.
- Dette source : `DA20-003/problems.md#DEBT-SCHEMA-EVENT-MANIFEST`.

## Dans le scope

- inventorier les trois définitions supplémentaires et leur provenance;
- déterminer la liste et l'ordre qui font autorité;
- corriger l'implémentation, les attentes de test ou les deux selon le contrat établi;
- documenter la décision afin que le manifeste ne dérive plus silencieusement;
- vérifier le typecheck et toute la suite Schema sur le HEAD exact.

## Hors scope

- retirer ou masquer un événement uniquement pour faire passer le test;
- modifier l'UI, l'ownership, la compaction Codex ou la promotion staging;
- élargir rétroactivement DA20-003, DA30-004 ou DA10-003.

## Critères d’acceptation

1. Les 58 définitions actuelles sont expliquées et comparées aux 55 attentes historiques.
2. La source canonique et l'ordre sont explicites et couverts par un test stable.
3. `packages/schema` passe entièrement, sans exclusion ni snapshot accepté aveuglément.
4. Le typecheck Schema et `git diff --check` passent.
5. La décision et les éventuelles incompatibilités sont consignées dans les preuves APEX.

## Dépendances et validation

Tâche backlog, hors Sprint 2. Elle part de la candidate Sprint 2 acceptée ou de sa baseline de
sortie, dans le worktree de domaine 30. Aucun smoke visuel n'est requis. Analyse, plan, test ciblé,
suite complète Schema et revue du pathset sont requis avant clôture.
