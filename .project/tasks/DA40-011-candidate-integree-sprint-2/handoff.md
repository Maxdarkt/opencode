# Handoff — DA40-011 Candidate intégrée Sprint 2

## Résultat remis

La candidate assemble les livraisons acceptées DA20-003, DA30-004 et DA10-003 sur
`sprint2-integration`, puis ajoute quatre corrections d'intégration bornées : hygiène du contrat
Schema, parité readonly/mutable du test OpenAPI, nettoyage lint/format des seules lignes Sprint 2 et
routage exact d'un sandbox sélectionné lors de la création d'une session.

Le smoke technique et le smoke visuel parent démontrent ensemble : binding exact, ownership unique
et génération monotone, effets pending/confirmed, refus fail-closed divergent/resuming, brouillon
restauré et zéro POST de prompt. La fixture finale reste concordante avec
`c6-smoke-resumed`, génération 2 et effet confirmé.

## Git et commit borné

Le commit B6 inclut uniquement :

- le dossier `.project/tasks/DA40-011-candidate-integree-sprint-2/` ;
- les dix fichiers produit C1/C3/C4/C5 inventoriés dans `verify.md`.

Il exclut explicitement `PLAN-GENERAL.md`, `sprint.md`, `docs/product/releases/0.1.md`,
`docs/product/sprints/sprint-2.md` et `.make.env`. Le hash exact et le pathset relu après commit sont
consignés dans le STATE de remise, car un commit ne peut pas contenir sa propre empreinte.

## Suite parent

Après relecture du commit et de cette preuve, le parent décide seul du passage MT à `done`, de la
promotion éventuelle et de la rotation documentaire. Aucun push, merge, rebase, promotion,
archivage, reset, nettoyage ou retrait de worktree n'est exécuté par B6.

Point de reprise en correction : repartir du commit B6 enregistré dans `STATE.md`, ouvrir un bloc
APEX borné au défaut observé et rejouer le contrôle affecté puis les gates de `verify.md`.
