# Problèmes et dettes — DA20-003

## DEBT-SCHEMA-EVENT-MANIFEST — attentes de test obsolètes sur la baseline

- **Statut** : hors périmètre, à scoper/enregistrer ; aucune carte MT existante trouvée dans le
  projet DA lors de la requête `ba7a0ff0-b6fa-4aa2-8751-5f8a177aa096`.
- **Sévérité/impact** : faible pour DA20-003, mais la suite complète `packages/schema` reste rouge et
  produit un diff d'assertion extrêmement volumineux. Les tests attendent 55 définitions serveur et
  des positions historiques ; le runtime courant en expose 58.
- **Preuve** : `bun test` dans `packages/schema` sur DA20-003 donne 13 PASS / 2 FAIL. Le test ciblé
  `bun test test/event-manifest.test.ts` reproduit exactement les 2 FAIL sur le worktree baseline
  `/Users/leanbot/Documents/40_Daidalon/features/50-integration` au HEAD
  `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2`.
- **Décision** : ne pas modifier ces attentes dans DA20-003 ; `TaskBinding` ne déclare aucun événement
  et ne cause pas le différentiel.
- **Propriétaire proposé** : domaine 40/tooling ou mainteneur Schema, hors Sprint 2 sauf décision du
  parent.
- **Prochaine action** : le parent décide après réception s'il faut valider un briefing task-scope
  dédié (« Réconcilier le manifeste d'événements Schema et ses attentes »), puis seulement créer la
  carte/folder selon le mode tracked. Reouvrir cette dette si le compte/ordre attendu doit redevenir
  une gate de release.
