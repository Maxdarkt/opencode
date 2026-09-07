---
id: DEC-DA40-009
type: decision
document_status: active
authority: decision-record
sources:
  - .project/tasks/DA40-005-memoire-durable-markdown-mt/memoire-durable.md
  - .project/tasks/DA40-008-integrer-contrat-sprint-orchestrator/handoff.md
  - .project/tasks/DA40-009-adopter-memoire-durable-daidalon/scope.md
observed_at: 2026-09-07T10:03:16+02:00
supersedes: []
superseded_by: null
---
# DEC-DA40-009 — Racine documentaire canonique et projections read-only

## Contexte et décision

Les plans et index existaient dans cinq roots identiques mais non étiquetées; une
identité de contenu ne crée pas une autorité unique. La racine documentaire
canonique est désormais `/Users/leanbot/Documents/40_Daidalon/Daidalon`.

MT Tasks reste l'autorité des cartes et statuts métier; les dossiers APEX restent
l'autorité des phases et preuves; Git reste l'autorité de branche, HEAD et diff.
La racine canonique publie conventions, décisions, journaux, checkpoints, archives,
documents produit et vues de coordination. Les copies de worktrees sont read-only
et identifiées par `canonical_ref`, `observed_at`, `observed_revision` et
`freshness`.

## Alternatives écartées

- Cinq coautorités : rejetées car les écritures concurrentes ne sont pas
  réconciliables.
- Déplacer/supprimer les copies ou historiques : rejeté; l'adoption est
  incrémentale et aucune preuve n'est retirée.
- Utiliser chat, cache ou base vectorielle comme autorité : rejeté; ils peuvent
  aider à retrouver l'état, pas le définir.

## Effets, propriétaire et date de révision

Le parent de coordination écrit les vues projet, archives et checkpoints
canoniques. Chaque worktree écrit seulement son dossier APEX attribué. Toute
opération multi-support est observée puis journalisée. Révision requise lors d'un
changement de topologie ou d'autorité documentaire.

## Preuves et documents impactés

- [Protocole](../workflow/memoire-durable.md).
- [Routine](../workflow/suivi-sprints.md).
- [Registre](../../.project/runtime/canonical-projections.md).
- [Journal DA40-009](../../.project/journals/OP-DA40-009-adoption.md).
