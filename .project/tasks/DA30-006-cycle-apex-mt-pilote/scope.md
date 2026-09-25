# Scope — DA30-006 — Cycle APEX/MT et commande pilote minimale

## Objectif

Implémenter le cycle durable Analyze/Plan/Build/Smoke/Verify, ses statuts MT distincts, la reprise sans doublon et une commande pilote minimale.

## Contexte

Sprint 3 validé le 2026-09-07, 29 SP. Base candidate Sprint 2 : `10e1234b3`. Estimation : 8 SP.

## Périmètre

Inclut l'analyse, le plan, l'implémentation bornée, les tests, le smoke technique et le handoff. Exclut push, publication, déploiement, multi-hôte, paiement, suppression de worktree et changement hors objectif.

## Dépendances

Candidate Sprint 2 `10e1234b3`.

## Critères d'acceptation

Cycle démontré de bout en bout; incohérences refusées; reprise idempotente; tests et smoke.

## Validation

Tests ciblés et complets affectés, typecheck, format/diff, smoke reproductible et preuve Git exacte.
