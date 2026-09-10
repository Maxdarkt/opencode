# Problèmes et dettes — DA30-004

## Périmètre DA30-004

Aucun défaut ou dette en périmètre ne reste ouvert. Les corrections rencontrées pendant Build
(équipement du worktree, typage Drizzle et attente de test) ont été résolues puis revérifiées.

## Dette héritée — event-manifest

- Fait : `packages/schema/test/event-manifest.test.ts` conserve deux échecs de snapshot : surface
  publique complète et définitions canoniques courantes.
- Preuve : suite Schema DA30-004 = 13 PASS / 2 FAIL; exécution ciblée = 0 PASS / 2 FAIL. DA20-003
  avait reproduit les deux mêmes échecs sur la baseline exacte `9ba850b68` avant ce changement.
- Impact : la suite globale Schema n'est pas entièrement verte; les typechecks, le contrat
  `TaskExecution`, ses identités canoniques et les tests Core restent verts.
- Gravité : faible pour DA30-004, hors périmètre et non bloquante car aucune définition d'événement
  n'a été modifiée.
- Propriétaire/décision : dette DA20-003 préexistante, déjà signalée au parent; ne pas créer de
  doublon MT depuis DA30-004.
- Reprise : le parent conserve l'arbitrage/scoping existant; rouvrir DA30-004 seulement si un test
  démontre que `TaskExecution` modifie la surface des événements.
