# Plan — DA40-005

Validation de poursuite : mandat parent du 2026-09-07 après attestation `gpt-5.6-terra` / `high`. Aucun changement de périmètre produit.

## Contrat de sortie

Un lecteur peut appliquer les fichiers produits sans inférer d'état depuis un chat : il sait quelle source lire/écrire, dans quel worktree, quel contexte charger, comment journaliser une transition, comment reprendre une panne et quand escalader un modèle. Le prototype simule le cycle idée → release → sprint → tâche → reprise → clôture → archive.

## Blocs bornés

1. **Contrat et modèles** — produire l'arbre canonique, les responsabilités et les modèles minimaux ; vérifier qu'aucun modèle ne rend une projection autoritative.
2. **Cycle et reprise** — produire le journal de réconciliation, la sélection de contexte, la propriété multi-worktree et le routage modèle ; vérifier les scénarios de panne.
3. **Prototype et recette** — dérouler un cas E2E, contrôler les liens, les invariants et la couverture des critères d'acceptation.

## Smoke documentaire

- Parcours nominal complet et reprise par un nouveau chat depuis un checkpoint seulement.
- Timeout MT, crash, doublon, état obsolète, deux worktrees, carte archivée masquée et chat perdu.
- Vérification qu'un état `review` ne devient jamais `done` depuis l'enfant et qu'une archive ne supprime pas le dossier APEX.

## Limites

Ce plan ne crée aucun fichier dans la racine documentaire canonique proposée et ne modifie ni `PLAN-GENERAL.md`, ni `sprint.md`, ni releases, ni runtime. Leur adoption relève d'une décision parent ultérieure.
