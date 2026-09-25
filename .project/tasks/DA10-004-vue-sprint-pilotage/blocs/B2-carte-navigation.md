# B2 — Carte Sprint/tâche et navigation existante

## Résultat

Ajout de `task-pilot-view.tsx` et intégration dans le contexte projet actif.

- La carte compacte et responsive affiche séparément tâche, statut MT, phase APEX, identité existante, bloc et prochaine action.
- L'absence de source MT/APEX reste visible comme « Not observed »; l'évaluateur B1 rend alors `context_incomplete`, sans action inventée.
- La dépendance affichée est l'identité TaskBinding déjà reçue : session + worktree. Sans les deux, le bouton est désactivé.
- Le bouton navigue exclusivement vers `/${base64Encode(worktree)}/session/${sessionID}` : il rouvre le chat déjà lié dans son worktree, sans créer ni l'un ni l'autre.
- Les clés user-facing sont ajoutées à la source i18n partagée.

## Contrôles exécutés

- PASS — Prettier appliqué aux quatre fichiers B2.
- PASS — `git diff --check`.
- Non exécutés sur instruction parent — tests, typecheck, smoke technique et smoke visuel. La limitation B1 de dépendances workspace manquantes reste à conserver pour la vérification finale; aucun lockfile ni dépendance n'a été modifié.

## Suite parent

Réaliser les contrôles techniques puis la recette visuelle sur la candidate intégrée avec observations MT/APEX explicites aux résolutions `1440×900` et `1024×768` définies dans `plan.md`.
