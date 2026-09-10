# Sprint 3 — Piloter une tâche de bout en bout

Statut : completed le 2026-09-08. ID MT : `415b28cf-2d9c-4162-9be7-f6502a453b8e`; référence : `da-release-0.1-sprint-3`. Sept cartes, 34 SP acceptés, aucune inachevée. L’extension DA30-008 (5 SP) a été explicitement approuvée pour rendre l’autorité MT/APEX disponible sans affaiblir le refus sûr.

## Objectif et résultat

Achever la candidate locale 0.1 : depuis une vue Sprint, suivre une tâche APEX, constater son worktree, son chat et son coût, puis piloter sa prochaine action à partir d’une autorité locale fraîche et concordante.

La candidate acceptée est `features/s3-integration`, branche `sprint3-integration`, HEAD local `57da5e0d156c1b6f73c2c4528b502d6b764d9891`. Aucun push, tag, déploiement, publication ou suppression de worktree n’a été effectué.

| Carte | Résultat accepté | SP | Commit / preuve |
|---|---|---:|---|
| DA30-005 | Manifeste Schema réconcilié | 3 | `15cc8310` |
| DA30-006 | Cycle APEX/MT et commande pilote minimale | 8 | `70d0b4a8` |
| DA30-007 | Observabilité modèle, tokens, coût et latence honnête | 5 | `70e6bfed` |
| DA30-008 | Snapshot d’autorité locale MT/APEX explicite et fail-closed | 5 | `00a62c8d` |
| DA10-004 | Vue Sprint et pilote de prochaine action | 5 | `aeee8b73` |
| DA40-013 | Candidate intégrée et fixture de recette isolée | 5 | `57da5e0d` |
| DA40-014 | Orchestration, réception et rotation | 3 | état parent / runtime |

## Réception et preuves

- Runtime Sprint génération 24 validé, avec transitions MT `in_progress → review → done` et états APEX concordants.
- Contrôles ciblés finaux : Core 11/11 et HTTP 8/8 PASS; validations APEX et Sprint State PASS; `git diff --check` PASS sur la candidate propre.
- Pass B parent à `1440×900` et `1024×768` : la fixture SQLite temporaire affiche DA40-013, MT `in_progress`, phase APEX `analyze`, contexte `concordant`, bloc `None`, action `Write plan` et ouverture du chat existant.
- Les états snapshot absent, expiré, malformé ou divergent restent sans MT/APEX/action : refus fail-closed. Les preuves divergentes/indisponibles ont été rejouées aux deux tailles avant la fixture disponible.

## Critères de sortie

Les suites Schema sont vertes dans le périmètre; une tâche réelle expose son statut, sa phase, son chat, son worktree, son owner et une prochaine action; le pilote refuse les identités incohérentes; coûts et métriques ne simulent pas un zéro; la candidate a reçu les vérifications techniques et visuelles; MT, APEX, Git et les vues canoniques sont réconciliés.

## Dettes et suite

La baseline i18n App `pa-PK` reste hors pathset et documentée; elle n’a pas été masquée. La release 0.1 demeure locale et sans publication. La suite éventuelle (0.2 : plusieurs tâches successives; 0.3 : parallélisme sûr) n’est ni planifiée ni créée par cette rotation.

Preuves durables : [état parent](../../../.project/tasks/DA40-014-orchestration-sprint-3/STATE.md), [runtime](../../../.project/runtime/sprints/415b28cf-2d9c-4162-9be7-f6502a453b8e/CURRENT.json) et [handoff fixture](../../../../features/40-tooling/.project/tasks/DA40-013-candidate-integree-sprint-3/handoff-correction.md).
