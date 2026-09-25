# Plan — DA40-009

Validation de poursuite : autonome le 2026-09-07. Le mandat fixe la portée et le
parent a attesté `gpt-5.6-terra` / `high` avant Build.

## Contrat de sortie

La racine `Daidalon/` possède des modèles versionnés et opératoires, une décision,
un journal, un checkpoint et un index d'archives. Les copies de worktree sont
déclarées projections en lecture seule, liées au canonique et contrôlables par
revision/fraîcheur. La routine indique la reprise sûre pour timeout, projection
stale et carte archivée masquée. Une recette reconstruit DA40-009 depuis règles,
checkpoint, MT et STATE, sans transcript.

## Blocs bornés

1. **B01 — Canon et modèles.** Créer les conventions versionnées sous la racine
   canonique : décision, journal, checkpoint, archive et projection; enregistrer
   la décision d'adoption sans toucher aux plans/sprints.
2. **B02 — Routine et projections.** Ajouter le registre canonique des
   projections et la projection locale `40-tooling`; compléter les documents
   d'entrée et la routine de suivi avec les propriétaires, la fraîcheur et les
   procédures de réconciliation.
3. **B03 — Preuves de reprise.** Écrire le checkpoint compact et son journal,
   comparer les cinq projections, valider les liens et exécuter une reconstruction
   à froid couvrant timeout, stale et carte archivée masquée.

## Checks et smoke technique

- `git diff --check` sur les deux dépôts concernés.
- Résolution de tous les liens Markdown ajoutés et contrôle des champs obligatoires
  des cinq modèles.
- Comparaison SHA-256 des cinq paires de projections, puis lecture du registre.
- Reprise à froid : règles → checkpoint → carte MT → STATE → décision/journal;
  aucune lecture d'ancien chat et aucune mutation rejouée.

## Limites

Le parent conserve les plans, sprints, bilans, mise à jour globale MT et la
réception. Aucun commit, push, merge, rebase, promotion, suppression ou Build
produit ne fait partie de ce plan.
