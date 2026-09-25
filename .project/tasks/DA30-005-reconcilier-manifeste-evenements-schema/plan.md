# Plan — DA30-005

## Contrat d'exécution

Autorisation durable : mandat Sprint 3 du parent
`01a07d34-6e02-7a81-a3ed-0287a9ad3690`, reçu le 2026-09-07. Cible :
`/Users/leanbot/Documents/40_Daidalon/features/s3-30-schema-manifest`, branche
`schema-manifest`, base/HEAD `10e1234b3b08b986ef966f01d04e25bbf1185433`.

Le parcours autorisé est limité à :

1. documenter dans le manifeste l'ordre de composition Server qui fait autorité ;
2. mettre à jour le test du manifeste avec les 58 identifiants Server canoniques,
   les valeurs dérivées `88`/`35` et l'index V1 live `43` ;
3. exécuter test ciblé, typecheck Schema, suite Schema complète et `git diff --check` ;
4. tenir les preuves APEX, puis transmettre le handoff au parent.

Les seules corrections permises sont celles qui réparent l'implémentation/test/documentation
de ce contrat. Arrêt immédiat si le worktree, la branche, la carte MT ou l'origine des trois
événements divergent. Aucun commit, push, merge, rebase, publication, tag, déploiement ou
suppression n'est autorisé dans cet enfant ; le parent décide après validation finale.

## Bloc B1 — contrat de manifeste et régression

- Ajouter un court commentaire de contrat à `packages/schema/src/event-manifest.ts` :
  les inventories concaténés constituent la liste ordonnée canonique, avec les événements
  Revert durables appartenant au segment Session current avant les V1 live.
- Remplacer la seule assertion de cardinalité Server par la liste ordonnée des 58
  `type`, et conserver les cardinalités `Definitions`/`Latest`/`Durable` à
  `88`/`88`/`35` ainsi que la tranche V1 live à `43..45`.
- Aucun changement à `session-event.ts` ni à la classification des événements.
- Contrôle de bloc : `bun test test/event-manifest.test.ts` depuis `packages/schema`.

## Vérification et smoke technique

- Typecheck : `bun typecheck` depuis `packages/schema`.
- Suite complète : `bun test` depuis `packages/schema`.
- Hygiène : `git diff --check` depuis le worktree.
- Smoke technique : le test importe le manifeste réel et vérifie les identités de
  façades existantes, l'ordre des IDs Server et les clés durables ; il couvre donc la
  composition runtime sans composant externe.

## Plan de smoke visuel parent

Cette tâche ne produit aucun écran ni route UI. Pass B visuel : **non applicable**.
Pour la revue parent, les préconditions sont le worktree `schema-manifest` au HEAD de
handoff et les dépendances installées; l'action est d'ouvrir le diff et la sortie de
test. Vue/viewport/fixtures : sans objet. États attendus : 58 IDs Server dans l'ordre
asserté, 88 IDs publics et 35 clés durables, sans événement V1-only ajouté à Server.
Régressions à inspecter : déplacement des trois Revert avant les V1 live, retrait
accidentel d'un événement actuel, ou simple ajustement de compte sans liste explicite.
Les preuves sont les sorties de B1 et de Verify consignées dans `blocs/B1-manifest.md`
et `smoke-report.md`.
