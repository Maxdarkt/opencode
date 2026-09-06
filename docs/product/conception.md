# Daidalon — conception produit

**Statut :** conception de référence avant développement  
**Sources :** [`vision.md`](./vision.md), [`roadmap.md`](./roadmap.md), [`worktrees.md`](./worktrees.md)  
**Dernière mise à jour :** 2026-09-06

## 1. Rôle de ce document

Ce document est le fil directeur entre la vision et les tâches d'implémentation. Il décrit le modèle produit, l'architecture de navigation, les parcours, les états et les règles de sécurité. Toute feature doit se rattacher à une section de cette conception et produire une preuve observable.

La conception reste indépendante des choix de détail du code tant que l'audit n'a pas confirmé le meilleur point d'extension dans OpenCode.

## 2. Modèle produit

```text
Projet
├── dépôt source et branche de référence
├── mémoire et préférences locales
├── fichiers, terminaux et navigateur
├── sprints
│   └── Sprint
│       ├── objectif et budget
│       ├── chat pilote
│       ├── tâches et dépendances
│       └── synthèse de progression
└── tâches
    └── Tâche
        ├── carte MT Tasks
        ├── dossier APEX
        ├── chat OpenCode
        ├── branche et worktree dédiés
        ├── fichiers, terminal et diff
        ├── checklist d'exécution
        └── modèle, tokens, coût et validations
```

### Autorités

| Donnée | Autorité |
|---|---|
| Projet local, sessions et préférences d'interface | runtime OpenCode local |
| Statut métier, sprint, priorité et dépendances | MT Tasks |
| Analyze, Plan, Build, Smoke, Verify et preuves | dossier APEX |
| Branche, commit, diff et worktree | Git |
| Messages, outils et consommation modèle | session OpenCode |

L'interface réconcilie ces autorités ; elle ne remplace pas silencieusement l'une par une autre.

## 3. Architecture de navigation

### Barre latérale gauche — navigation globale

- accueil et projets récents ;
- projets favoris ;
- sprints du projet actif ;
- tâches du sprint regroupées par statut ;
- sessions libres ou historiques ;
- réglages, fournisseurs et modèles.

La barre gauche répond à « où suis-je et que puis-je ouvrir ? ».

### Zone centrale — espace de travail

- chat du sprint ou chat de la tâche ;
- progression sous forme de checklist visible ;
- demandes d'autorisation et décisions ;
- réponses, actions d'outils et preuves ;
- bascule rapide entre tâche et sprint sans perdre le brouillon.

La zone centrale répond à « que fait l'agent et quelle décision attend-il ? ».

### Panneau droit — contexte vérifiable

Onglets contextuels :

- Sprint : objectif, tâches, statuts, dépendances et budget ;
- Fichiers : arborescence du worktree actif et fichiers ouverts ;
- Git : branche, worktree, diff ligne par ligne, commits et opérations proposées ;
- Terminal : processus liés à la tâche ;
- Coûts : modèle, fournisseur, tokens, cache, latence, retries et escalades ;
- Navigateur : session persistante de la tâche, dans une phase ultérieure.

Le panneau droit répond à « sur quelles preuves et quel état travaille-t-on ? ».

## 4. Parcours essentiels

### P1 — ajouter un projet local

1. Ouvrir l'accueil.
2. Choisir un dossier dans une vraie arborescence ou coller son chemin.
3. Prévisualiser les sous-dossiers importants, le dépôt Git, la branche et les worktrees détectés.
4. Confirmer le dossier exact.
5. Enregistrer localement le projet, ses favoris et son dernier état d'interface.
6. Afficher l'espace projet avec un état vide explicite.

Critère clé : aucune ambiguïté sur le chemin réellement ouvert.

### P2 — préparer un sprint

1. Créer ou sélectionner un sprint MT Tasks.
2. Définir objectif, budget, critères de sortie et tâches.
3. Afficher les dépendances et les tâches non prêtes.
4. Ouvrir le chat pilote avec le mandat du sprint.
5. Le pilote propose les tâches à lancer ; l'utilisateur conserve les gates sensibles.

### P3 — lancer une tâche APEX

1. Sélectionner une carte MT Tasks.
2. Vérifier ou créer son dossier APEX.
3. Allouer une branche et un worktree uniques.
4. Ouvrir le chat dans ce worktree.
5. Exécuter Analyze puis Plan avec leurs validations.
6. Afficher la checklist Build/Smoke/Verify et son avancement.

Critère clé : la tâche ne peut jamais écrire dans un autre worktree par confusion de contexte.

### P4 — revoir et intégrer une tâche

1. Afficher le diff ligne par ligne dans l'onglet Git.
2. Relier chaque changement aux étapes et validations APEX.
3. Montrer tests, smoke, dettes et décisions.
4. Présenter séparément commit, rebase, merge, push et suppression du worktree.
5. Exiger une confirmation ciblée pour toute opération destructive ou externe.
6. Réconcilier Git, APEX et MT Tasks après chaque transition.

## 5. Worktrees et Git

### Identité visible

La barre de contexte affiche en permanence :

```text
Projet / Sprint / Tâche / Worktree / Branche / HEAD
```

Un changement de worktree doit provoquer un changement visible de couleur ou de libellé, sans s'appuyer uniquement sur une notification temporaire.

### États d'une tâche de code

```text
Non allouée -> Worktree prêt -> En travail -> En revue
             -> À corriger -> Validée -> Commit local
             -> Intégrée -> Worktree conservé ou supprimé explicitement
```

### Panneau Git

- résumé `+ / -` par fichier et total ;
- diff unifié ou côte à côte ;
- fichiers non suivis, modifiés, indexés et conflictuels ;
- branche source et branche de tâche ;
- divergence avec la branche cible ;
- historique des opérations rebase/merge ;
- actions séparées avec prévisualisation de l'effet ;
- récupération proposée avant toute suppression ou reset.

## 6. Orchestration du sprint

Le chat pilote ne code pas. Il :

- maintient l'objectif et les décisions du sprint ;
- lit les statuts MT Tasks, APEX, Git et sessions ;
- propose l'ordre de lancement selon les dépendances ;
- ouvre ou reprend le chat d'une tâche ;
- remonte blocages, écarts de contrat et dépassements de budget ;
- supervise la revue et le smoke visuel ;
- produit une synthèse de fin de sprint.

Chaque chat de tâche reste responsable de son unique périmètre et de son unique worktree.

## 7. Coûts et performance

### Indicateurs en direct

- coût de la tâche et du sprint ;
- tokens d'entrée, sortie, raisonnement et cache ;
- contexte brut candidat et contexte réellement sélectionné ;
- modèle et fournisseur par tour ;
- latence, retries et escalades ;
- budget restant ;
- coût par tâche techniquement validée.

### Présentation

Le coût n'est pas un compteur isolé. Il est affiché à trois niveaux :

1. tour du modèle dans le chat ;
2. total et budget de la tâche ;
3. consommation, prévision et répartition du sprint.

Une alerte doit expliquer le poste qui dérive : contexte trop large, modèle coûteux, répétition d'outils, retries ou escalade.

## 8. Persistance locale

Le runtime persiste localement :

- chemin canonique et identité Git du projet ;
- favoris et projets récents ;
- dispositions de panneaux et onglets ;
- rattachements projet/sprint/tâche/session/worktree ;
- brouillons et dernière position de lecture ;
- préférences de modèles et budgets ;
- références vers MT Tasks et dossiers APEX.

Les secrets restent dans les mécanismes de credentials existants et ne sont jamais copiés dans les documents APEX ou la télémétrie.

## 9. Principes UX

- Toujours montrer le contexte actif avant l'action.
- Préférer une progression visible à une animation opaque.
- Afficher les détails techniques à la demande, mais garder les décisions visibles.
- Séparer clairement navigation globale, travail actif et preuves.
- Ne jamais regrouper plusieurs opérations Git sensibles dans un bouton ambigu.
- Garder les tâches, coûts et changements compréhensibles sans ouvrir un terminal.
- Conserver la densité utile d'un outil professionnel ; éviter les écrans décoratifs.

## 10. Repères d'avancement de la conception

| Porte | Question | Preuve attendue |
|---|---|---|
| C0 | Le modèle produit est-il cohérent ? | entités, autorités et états validés |
| C1 | L'accueil permet-il d'ouvrir le bon dossier sans doute ? | wireframe et test de parcours |
| C2 | Le shell projet/sprint/tâche reste-t-il lisible ? | maquette desktop et états vides/chargés |
| C3 | Le cycle worktree/Git est-il sûr et explicite ? | state machine et prototype du panneau Git |
| C4 | Le chat pilote orchestre-t-il sans coder ? | scénario Sprint complet sur papier |
| C5 | Les coûts aident-ils à décider ? | maquette des indicateurs et protocole de mesure |
| C6 | La première tranche verticale est-elle bornée ? | scope et critères du Sprint 1 |

Une porte validée peut être traduite en cartes MT Tasks et tâches APEX. Une porte non validée reste une question de conception, pas une tâche de développement.

## 11. Première tranche verticale candidate

Après validation de C0 à C3 :

1. sélecteur local avec aperçu et persistance ;
2. shell projet avec navigation gauche ;
3. chat de tâche existant au centre ;
4. panneau droit Fichiers/Git ;
5. rattachement explicite d'une tâche à un worktree unique ;
6. indicateurs de coût déjà disponibles dans OpenCode.

Cette tranche doit fonctionner pour un projet, un sprint, une tâche et un worktree avant tout parallélisme.

## 12. Questions de conception ouvertes

- Le chat général appartient-il au projet ou uniquement au sprint actif ?
- Une tâche sans code doit-elle disposer d'un worktree facultatif ou d'aucun worktree ?
- MT Tasks reste-t-il obligatoire ou devient-il un adaptateur de suivi parmi d'autres ?
- Jusqu'où renommer visuellement OpenCode dans le fork sans compliquer la synchronisation amont ?
- Quel niveau de détail des étapes agentiques doit être ouvert par défaut ?
- Quelles opérations Git peuvent être proposées automatiquement, sans être exécutées automatiquement ?
