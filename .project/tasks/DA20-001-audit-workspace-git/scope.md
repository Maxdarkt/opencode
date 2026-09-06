# DA20-001 — Auditer l’architecture projet, session, Git et worktrees

## Objectif

Établir les contrats actuels entre projet, session, dépôt Git, branche et worktree afin d'identifier les fondations réutilisables et les risques à traiter.

## Dans le périmètre

- découverte et persistance des projets locaux ;
- identité des sessions et rattachement au workspace ;
- détection Git, branches, diffs et worktrees ;
- cycle de vie création, reprise, intégration et retrait d'un worktree ;
- points d'extension et garde-fous nécessaires à Daidalon.

## Hors périmètre

- création d'un nouveau gestionnaire Git ;
- modification du cycle de vie existant ;
- merge, rebase, push ou suppression de worktree.

## Critères d'acceptation

- schéma des composants et flux actuels ;
- responsabilités, persistance et autorités identifiées ;
- risques de confusion de branche/worktree documentés ;
- recommandations réutiliser/étendre/remplacer argumentées par le code.

## Exécution

- Worktree : `20-workspace-git`
- Branche : `20-workspace-git`
- Dépendance : aucune
- Validation : références de code, scénarios Git non destructifs et matrice des risques
