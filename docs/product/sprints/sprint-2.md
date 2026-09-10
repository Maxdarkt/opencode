# Sprint 2 — Tâche, worktree et reprise fiables

Statut : completed le 2026-09-07, 5 cartes et 29 SP acceptés, aucune inachevée. ID MT : `ddc01132-b26a-446a-85a0-04d2d37a0a01`.
Référence : `da-release-0.1-sprint-2`. [Release 0.1](../releases/0.1.md). Briefing utilisateur approuvé le 2026-09-07.

## Objectif et capacité

Livrer une tranche verticale où une carte MT, son dossier APEX, sa session et son worktree restent liés, exclusifs, visibles et reprenables après interruption. Capacité planifiée : 29 SP, estimation relative sans conversion en jours.

| Carte | Titre | SP | Routage | Worktree | État initial |
|---|---|---:|---|---|---|
| DA20-003 | Binding tâche/session/worktree | 8 | Sol / high | `s2-20-binding` | done, commit `a70bf26ad` |
| DA30-004 | Exclusivité et reprise | 8 | Sol / high | `s2-30-ownership` | done, commit `1de05c023` |
| DA10-003 | Contexte actif dans l'interface | 5 | Terra / high | `s2-10-context-ui` | done, commit final `f4b7b44d8` |
| DA40-011 | Candidate intégrée Sprint 2 | 5 | Sol / high | `s2-integration` | done, commit `10e1234b3` |
| DA40-012 | Orchestration Sprint 2 | 3 | Terra / high | parent/staging | done |

## Ordre et contrats

`DA20-003 → DA30-004 → DA10-003 → DA40-011`, sous supervision continue de DA40-012. Une attente de dépendance reste `todo`. Chaque tâche dispose d'un chat et d'un worktree dédié depuis la baseline `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2`; le parent ne développe pas sur staging.

DA20 remet le binding et son contrat. DA30 consomme ce contrat pour l'exclusivité et la reprise. DA10 présente les faits et les états de sécurité. DA40-011 assemble les commits acceptés et produit la candidate exacte.

DA20-003 a été reçue par le parent : commit `a70bf26adc4ece7645e3654452c0f034f78d05ac`, 30 tests / 123 assertions, typechecks Schema/Core et migration check verts. DA30-004 a reçu ce commit et le contrat pour commencer.

DA30-004 a été reçue par le parent : commit `1de05c0239357fb5796935460b89bfd9deec939b`, 44 tests / 176 assertions, typechecks Schema/Core et migration check verts. Son chat est archivé ; DA10-003 a reçu les deux commits acceptés.

DA10-003 est reçue et `done` au HEAD `f4b7b44d81d22e020b1c1f259e73385ee74c2665`. La revue parent a exigé puis validé deux corrections : garde fail-closed sur prompt, commande, shell et reprise; conservation du brouillon et de ses contextes après refus. Typechecks App/OpenCode, 13 tests App / 46 assertions, 7 tests HTTP / 27 assertions et smokes réels concordant, `resuming` et divergent sont verts sur 1440×900 et 1024×768. Aucun appel modèle; zéro message écrit lors des refus. Son chat est archivé et DA40-011 a reçu la chaîne de commits acceptée.

## Critères de sortie

1. Binding durable, idempotent et validé avant écriture.
2. Un seul propriétaire écrivain, conflits et effets incertains refusés.
3. Contexte actif et écarts lisibles dans l'interface.
4. Candidate intégrée vérifiée techniquement et visuellement par le parent.
5. MT/APEX/Git/docs/checkpoint concordants, sans dette critique dans le scope.

## Limites

Pas de clustering, multi-hôte, réparation Git destructive, publication ni promotion sur staging. Les opérations Git externes ou sensibles restent séparées et requièrent un mandat explicite.

Dette héritée découverte pendant DA20-003 : `packages/schema/test/event-manifest.test.ts` attend encore 55 définitions et un ordre historique alors que la baseline en expose 58. Les deux échecs sont reproduits sans TaskBinding sur `9ba850b68`; ils sont hors périmètre et devront faire l'objet d'un cadrage distinct s'ils deviennent une gate de release.


## Bilan de clôture

La candidate intégrée est acceptée au commit local `10e1234b3`. Les suites Core (1123/1123), OpenCode (26/26), App ciblées, typechecks, génération Client/SDK, format et diff passent. Le smoke parent couvre `concordant → divergent → pending/resuming → concordant`, sans POST prompt et avec brouillon intact. Le correctif C5 conserve le sandbox exact lors d'une nouvelle session.

Dettes reportées : DA30-005 pour les deux attentes event-manifest héritées et 35 avertissements App préexistants inventoriés dans DA40-011. Aucun push, merge, tag, déploiement ou suppression de worktree n'a été effectué. [Preuves DA40-011](../../../.project/tasks/DA40-011-candidate-integree-sprint-2/verify.md).
