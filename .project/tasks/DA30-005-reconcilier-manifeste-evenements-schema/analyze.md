# Analyze — DA30-005

## Objet et autorité

Le mandat Sprint 3 transmis par le parent `01a07d34-6e02-7a81-a3ed-0287a9ad3690`
autorise une correction bornée du manifeste Schema, de son test et de ses preuves APEX.
Le code cible est le worktree dédié
`/Users/leanbot/Documents/40_Daidalon/features/s3-30-schema-manifest`, branche
`schema-manifest`, HEAD initial `10e1234b3b08b986ef966f01d04e25bbf1185433`.

La carte MT `DA30-005` a été relue `todo` dans le Sprint 3 puis passée à
`in_progress` (mutation `78a3c4fd-8358-403f-8958-e519f7d40faf`, relecture
`9daf5245-73b3-4b3b-aad9-399931eb8568`).

## Constat reproductible

Après installation locale verrouillée des dépendances (`bun install --frozen-lockfile
--ignore-scripts`), `bun test test/event-manifest.test.ts` échoue exactement sur deux
attentes historiques :

1. `ServerDefinitions.length` attend `55`, reçoit `58`.
2. La tranche des événements live V1 attendue aux indices `40..42` est désormais aux
   indices `43..45`; les compteurs `Definitions` et `Durable` sont aussi décalés de
   trois (`85 → 88`, `32 → 35`).

La liste mesurée à l'exécution place juste avant ces événements V1 live :

1. `session.next.revert.staged`
2. `session.next.revert.cleared`
3. `session.next.revert.committed`

Ces trois définitions sont déclarées ensemble dans `SessionEvent.RevertEvent` puis
incluses dans `SessionEvent.Definitions` et `DurableDefinitions`
([`packages/schema/src/session-event.ts`](../../../../s3-30-schema-manifest/packages/schema/src/session-event.ts)).
`EventManifest` compose ces définitions dans `coreDefinitions`, avant
`sessionV1LiveDefinitions`; elles sont donc présentes dans les 58 définitions Server,
les 88 définitions publiques et les 35 définitions durables. Ce placement explique le
décalage sans retrait ou masquage d'événement.

Le seul commit qui a ajouté conjointement le manifeste, le test et les définitions est
`24b0132bc51909777a813497a4d147011d7aedbf` (`refactor(schema): extract public event definitions (#33579)`).
Les constantes à 55/85/32 et la tranche à 40 ont donc été figées dans ce même test sans
intégrer les trois événements Revert déjà présents dans les inventories : c'est une
dette d'attente, pas une divergence d'implémentation.

## Contrat retenu, risques et protections

- La source canonique est la composition ordonnée `EventManifest.ServerDefinitions` :
  fondation (`ModelsDev`, `Integration`, `Catalog`, Session V1 durable et Session
  current), fonctionnalités, puis `SessionTodo`. Les définitions Revert restent dans
  leur ordre `Staged`, `Cleared`, `Committed` au sein du segment Session current.
- `Definitions` conserve le même segment de fondation, puis les événements V1 live et
  les surfaces de compatibilité ; aucun V1-only n'est promu au Server manifest.
- Le test doit verrouiller la liste et l'ordre de Server, et dériver les trois
  compteurs/indices réellement attendus; ainsi l'ajout, le retrait ou le déplacement
  silencieux d'un événement devient visible.
- Hors scope : modifier les définitions, leur rôle protocolaire, ou retirer les trois
  événements afin de satisfaire un ancien compte.

## Passage au plan

Aucun point métier, dépendance ou risque non résolu. Le plan peut corriger strictement
la documentation de composition et les assertions de régression, puis rejouer le test
ciblé, le typecheck et toute la suite Schema.
