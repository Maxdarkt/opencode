# Daidalon — roadmap fonctionnelle

**Statut :** backlog de cadrage  
**Autorité d'exécution future :** MT Tasks + dossiers APEX  
**Sources fonctionnelles :** [`vision.md`](./vision.md), [`conception.md`](./conception.md)  
**Dernière mise à jour :** 2026-09-06

## État de synchronisation MT Tasks

- Projet renommé : `Daidalon` (`DA`).
- Sprint créé et activé : `M0 — Audit et validation`, 17 SP dont 2 SP d'orchestration.
- Cartes historiques supprimées : `OC-0001` et `OC-0002`; `OC-0003`, trace du raccordement initial déjà réalisé, a été réconciliée puis archivée le 2026-09-07 sous le domaine `40-tooling`.
- Worktrees métier MT Tasks activés : `10 product-ui`, `20 workspace-git`, `30 agent-runtime`, `40 tooling`.
- Connecteur vérifié après redémarrage : `DA` est routé, les quatre codes sont actifs et aucune route orpheline ne subsiste.
- Cartes M0 matérialisées : `DA40-002` pour l'orchestration, puis `DA10-001`, `DA20-001`, `DA30-001`, `DA30-002` et `DA40-001` pour les audits et la décision.

Ce document ordonne les capacités projetées. Il ne remplace pas les cartes MT Tasks : celles-ci portent le statut métier, tandis que les dossiers APEX portent l'analyse, le plan et les preuves de chaque tâche.

## Ordre de construction

### M0 — audit et validation

Objectif : comprendre la base, valider l'expérience et mesurer les écarts avant tout développement important.

- exécuter et parcourir OpenCode sur de vrais dépôts ;
- auditer sessions, contexte, modèles, coûts, UI, Git et worktrees ;
- documenter les parcours, forces, irritants et risques ;
- comparer OpenCode actuel à l'expérience cible ;
- préparer un protocole économique abonnement / API naïve / runtime optimisé ;
- prendre une décision GO, GO conditionnel ou NO-GO pour chaque grande extension.

### F0 — fondations du fork

- stratégie de synchronisation avec `anomalyco/opencode` ;
- politique de branches, worktrees, commits et contributions amont ;
- attribution, licence, nom et versioning ;
- environnement local reproductible et tests de non-régression ;
- configuration APEX et rattachement à MT Tasks.

### F1 — accueil et sélection de projet

- navigation claire dans les dossiers locaux ;
- saisie ou collage d'un chemin absolu ;
- fil d'Ariane et dossier parent ;
- projets récents et favoris ;
- aperçu de l'arborescence avant ouverture ;
- détection du dépôt Git, de la branche et des worktrees ;
- erreurs et permissions compréhensibles.

### F2 — espace projet

- projet comme objet durable de premier rang ;
- affichage permanent du dossier, de la branche et du worktree actifs ;
- navigation entre chats, fichiers, recherche, Git, diffs et terminaux ;
- panneau droit contextuel inspiré de Codex ;
- restauration des onglets et de la disposition.

### F3 — tâche APEX et worktree sécurisé

- création et rattachement d'un dossier APEX ;
- relation durable tâche / session / branche / worktree ;
- ownership exclusif d'un worktree actif ;
- garde-fous avant reset, suppression ou déplacement ;
- état Git et diff visibles depuis la tâche ;
- reprise fiable après interruption.

### F4 — vue Sprint et chat pilote

- vue des tâches par statut ;
- chat général d'orchestration ;
- dépendances, blocages et prochain mouvement ;
- ouverture d'un chat/worktree de tâche depuis le Sprint ;
- réconciliation MT Tasks / APEX / Git / sessions ;
- revue et smoke visuel pilotés depuis le parent.

### F5 — observabilité et économie

- tokens entrée, sortie, raisonnement et cache ;
- coût et latence par tâche et par résultat validé ;
- modèle, fournisseur, retries et escalades ;
- budget par tâche, sprint et période ;
- sélection minimale du contexte et provenance ;
- comparaison reproductible API naïve / runtime optimisé / abonnement.

### F6 — navigateur persistant intégré

- panneau navigateur par tâche ;
- restauration des onglets et sessions ;
- isolation, permissions, captures et traces ;
- intégration au smoke visuel APEX.

### F7 — produit communautaire

- installation et mises à jour ;
- accessibilité et multi-OS ;
- documentation de contribution ;
- mécanisme d'extensions stable ;
- gouvernance, sécurité et politique de compatibilité amont.

## Sprint 0 proposé — cadrage exécutable

Le premier sprint reste volontairement analytique. Il ne modifie pas encore le produit.

| Ordre | Tâche | Résultat attendu |
|---:|---|---|
| 1 | `DA10-001` — Parcours UI et inventaire des irritants | Carte des écrans, problèmes observés et priorités UX |
| 2 | `DA20-001` — Architecture projet, session et worktree | Contrats actuels, risques et points d'extension |
| 3 | `DA30-001` — Architecture contexte, modèles et coûts | Flux d'un appel, métriques disponibles et écarts économiques |
| 4 | `DA30-002` — Modèle cible APEX/Sprint | Schéma Projet -> Sprint -> Tâche -> Chat -> Worktree |
| 5 | `DA40-001` — Gap analysis et décision M0 | Recommandation argumentée et périmètre du Sprint 1 |

## Sprint 1 candidat — première tranche verticale

Ce sprint ne sera créé qu'après la décision M0.

1. améliorer le sélecteur de projet ;
2. afficher le contexte Git/worktree actif ;
3. créer une tâche APEX locale reliée à une session ;
4. rattacher un worktree sécurisé unique ;
5. afficher les premières métriques modèle/tokens/coût.

La sortie attendue est un seul projet, une seule tâche APEX, une seule session et un seul worktree fonctionnant de bout en bout. L'orchestration parallèle et le navigateur intégré restent hors de cette première tranche.

## Règles de priorisation

1. sécurité et reprise ;
2. compréhension de l'état par l'utilisateur ;
3. simplicité du parcours ;
4. mesure de la qualité et du coût ;
5. parallélisme et automatisation avancée.

Chaque feature doit avoir une preuve observable, un scénario de smoke et une mesure de non-régression avant d'être considérée terminée.
