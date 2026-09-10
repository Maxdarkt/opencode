# Proposition Sprint 3 — Piloter une tâche de bout en bout

Statut : briefing à valider. Aucune carte nouvelle ni sprint MT créé.

## Objectif

Achever la candidate locale 0.1 : depuis une vue Sprint, ouvrir une tâche APEX, suivre ses phases,
piloter sa prochaine action, constater son contexte/worktree et afficher un coût honnête, avec une
recette intégrée reproductible.

## Périmètre proposé — 29 SP

| Ordre | Domaine | Résultat | SP | Dépendances |
|---:|---|---|---:|---|
| 1 | DA30-005 | Réconcilier le manifeste d'événements Schema et remettre la suite totalement verte | 3 | aucune |
| 2 | 30 agent-runtime | Cycle durable Analyze/Plan/Build/Smoke/Verify, statuts MT distincts et commande pilote minimale | 8 | candidate Sprint 2 |
| 3 | 30 agent-runtime | Mesure honnête modèle/tokens/coût/latence, avec états mesuré, estimé, partiel ou inconnu | 5 | candidate Sprint 2 |
| 4 | 10 product-ui | Vue Sprint/tâches, dépendances, blocages et prochaine action; ouverture du chat/worktree existant | 5 | contrat de phase du lot 2 |
| 5 | 40 tooling | Candidate intégrée Sprint 3, checks et recette technique/visuelle parent | 5 | lots 1 à 4 |
| 6 | 40 tooling | Orchestration, réception, mémoire durable et rotation du Sprint 3 | 3 | aucune à l'entrée |

Les identifiants MT des cinq nouvelles cartes seront attribués par MT Tasks après validation du
briefing. DA30-005 est réutilisée sans doublon.

## Ordonnancement

DA30-005, le cycle runtime et la mesure des coûts peuvent démarrer en parallèle dans trois
worktrees distincts. La vue UI démarre après stabilisation du contrat de phase. La candidate
intégrée consomme ensuite les quatre livraisons; le parent réalise le smoke visuel et la clôture.

## Critères de sortie

1. Toutes les suites Schema sont vertes, sans tolérance héritée.
2. Une tâche réelle expose phase APEX, statut MT, chat, worktree, owner et prochaine action.
3. Le pilote reprend une tâche existante sans doublon et refuse les états incohérents.
4. Modèle, tokens, coût et latence ne présentent jamais un faux zéro.
5. La recette parent couvre création/reprise, divergence, blocage, passage de phase et clôture.
6. MT, APEX, Git, plan, sprint et release sont réconciliés.

## Exclusions

Pas de push, publication, tag, déploiement, multi-hôte, parallélisme distribué, navigateur persistant,
budget bloquant, paiement ou suppression de worktree. Ces effets exigent des mandats ultérieurs.

## Routage recommandé

Terra/high pour les lots runtime, coût, UI, intégration et orchestration. DA30-005 démarre en
Terra/high; escalade Sol uniquement après difficulté répétée documentée. Luna sert aux inventaires,
validations déterministes et synchronisations documentaires.
