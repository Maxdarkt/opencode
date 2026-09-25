# Dettes — DA40-005

## D01 — Adoption de la racine canonique

- Sévérité : medium.
- Impact : les projections actuelles des cinq worktrees restent historiques et peuvent encore diverger tant que la convention `read_only`/`canonical_ref` n'est pas adoptée.
- Preuve : constat de baseline et section propriété de `memoire-durable.md`.
- Propriétaire : parent de coordination.
- Décision : non incluse dans DA40-005 ; pas de migration implicite.
- Réouverture : lorsqu'un parent autorise un plan de migration non destructif et désigne le checkout canonique.

## D02 — Intégration du contrat au skill global

- Sévérité : low.
- Impact : la grille d'attestation modèle/checkpoint ne sera pas automatique dans d'autres projets tant que le parent n'aura pas revu puis intégré la proposition.
- Preuve : proposition §8 de `memoire-durable.md`.
- Propriétaire : parent / mainteneur du skill.
- Décision : aucune modification de `/Users/leanbot/.codex/skills/sprint-orchestrator` par cette tâche.
- Réouverture : lors d'une revue de skill explicitement mandatée.
