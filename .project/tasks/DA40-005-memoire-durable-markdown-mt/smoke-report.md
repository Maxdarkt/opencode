# Smoke report — DA40-005

Date : 2026-09-07. Type : recette documentaire autonome ; aucune UI, aucun runtime et aucun connecteur modifiés.

| Scénario | Méthode | Résultat |
|---|---|---|
| Autorités et propriété | lecture de `memoire-durable.md` et recherche des autorités demandées | PASS — MT, APEX, Git, docs, sessions/caches et projections distingués. |
| Arbre et modèles | recherche des huit chemins exigés dans `templates/README.md` | PASS — plan, release, sprint, STATE, checkpoint, décision, journal et archive couverts. |
| Cycle E2E | lecture du prototype | PASS — idée → release → sprint → tâche → reprise → clôture → archive présent sans mutation réelle. |
| Pannes | recherche des sept cas dans la matrice | PASS — timeout, crash, doublon, état périmé, deux worktrees, carte masquée, chat perdu ; chacun a détection/réponse/fin. |
| Contrat de reprise | inspection de la section contexte et checkpoint | PASS — ordre de chargement ciblé, budget de contexte et gestion `stale` définis. |
| Routage modèle | inspection de la grille et de la consigne d'attestation | PASS — Luna/Terra/Sol/Astra et escalade fondée sur preuve définis ; pas de Build sans modèle observé. |

## Commandes de contrôle

`git diff --check -- .project/tasks/DA40-005-memoire-durable-markdown-mt` : PASS.

Recherches `rg` sur les responsabilités, sept pannes, cycle E2E et huit modèles : PASS. La première tentative de recette a échoué avant exécution à cause de chevrons non quotés dans une boucle zsh ; la commande corrigée a passé, sans modifier de fichier.

## Pass B

Non requis : ce livrable ne modifie ni interface, ni service, ni support externe. La revue parent porte sur l'adoption éventuelle de la racine canonique et des changements proposés au skill global.
