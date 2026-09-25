# B02 — Routine et projections

Statut : completed, 2026-09-07.

## Résultat

La routine de suivi, les entrées mémoire/worktrees et le protocole opérationnel
définissent les autorités, journal, checkpoint, timeout et carte archivée masquée.
Le registre canonique étiquette les dix copies plan/sprint comme read-only. La
projection locale `40-tooling` pointe sur ce registre sans modifier sa copie.

## Réconciliation réelle

La première observation de `PLAN-GENERAL.md` était devenue stale pendant la
validation. Les cinq copies ont été relues et concordent maintenant au hash
`047c30067722610012fac56b9cecdad697b64440c33dab068028823df5ea3f3c`; aucune
copie ni le canonique n'a été écrit par l'enfant. Le journal conserve le fait.

## Preuves

- `Daidalon/.project/runtime/canonical-projections.md`.
- `Daidalon/docs/workflow/memoire-durable.md`.
- `Daidalon/docs/workflow/suivi-sprints.md`.
- `Daidalon/.project/archives/index.md`.

## Prochaine action

Exécuter la reconstruction à froid et les contrôles finaux de B03.
