# Analyze — DA30-004

## Objectif et autorité

Le mandat du Sprint 2 autorise l'implémentation locale bornée d'un propriétaire d'exécution unique,
du refus des propriétaires concurrents avant mutation métier et de la reprise explicite des effets
interrompus. L'enfant peut poursuivre Analyze, Plan, Build, checks, smoke technique, commit local
borné et passage MT en `review`. UI, clustering, staging et opérations Git distantes, destructives ou
d'intégration restent exclus.

## Point de départ observé

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/s2-30-ownership`, branche
  `execution-ownership`.
- Base : `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2`.
- DA20-003 : commit accepté `a70bf26adc4ece7645e3654452c0f034f78d05ac`, cherry-pick local
  `eceeb7dd7734f60491e09cdac72fa297993f4c4b`. Le parent et le tree Git
  `704fb7c5d534470d75a413f3804e5c4566a73edb` correspondent exactement à la source.
- Dirty préexistant : projections Sprint `PLAN-GENERAL.md`, `docs/product/releases/0.1.md`,
  `sprint.md` et `docs/product/sprints/sprint-2.md`; elles restent hors du commit DA30-004.
- Chat : `01a07b7b-4a62-7842-80fa-4d645525df4c`, routage parent attesté
  `gpt-5.6-sol/high` sans signal de substitution.

## Contrat d'entrée DA20-003

`TaskBinding.Service.resume(identity)` est le garde d'identité obligatoire avant toute acquisition
ou reprise. Il exige un binding existant et rejette en `ConflictError`, avant écriture, toute
divergence MT/APEX/session/projet/Location/dépôt/branche/worktree/HEAD. Le futur service ne mesure ni
ne répare Git et ne contourne pas ce garde.

## Patterns pertinents

- Les contrats sérialisables et consommables par l'UI vivent dans `@opencode-ai/schema`; les
  services persistants vivent dans Core avec `Context.Service`, couche Effect et SQLite/Drizzle.
- `SessionRunCoordinator` démontre l'exclusivité process-local d'une clé mais ne survit pas à un
  redémarrage. DA30-004 doit donc persister le jeton de fencing et l'état des effets, sans étendre
  la coordination au multi-hôte.
- Une transaction SQLite peut valider binding/propriété/effets et mettre à jour le jeton de reprise
  atomiquement. Chaque opération métier reste hors transaction mais doit être précédée d'un
  enregistrement durable `pending`, puis confirmée explicitement.

## Contrat retenu

1. Un `Owner` durable est lié au binding par `mtTaskID` et expose `ownerID` plus une `generation`
   monotone servant de jeton de fencing.
2. `acquire(identity, ownerID)` appelle d'abord `TaskBinding.resume`, crée la première propriété
   ou rejoue exactement le même propriétaire ; tout autre propriétaire échoue sans mutation.
3. `begin(token, effectID)` refuse un jeton obsolète. Un effet absent devient `pending`; un effet
   déjà confirmé n'est pas réattribué; un `pending` existant est `uncertain` et bloque le rejeu.
4. `confirm(token, effectID)` confirme idempotemment l'effet sous le jeton actif.
5. `resume(identity, previousToken, nextOwnerID, resolutions)` appelle le garde DA20-003, exige le
   jeton courant, refuse toute résolution absente ou `uncertain`, puis traite atomiquement les effets
   interrompus : `confirmed` reste acquis, `absent` redevient exécutable. La génération est incrémentée
   avant de remettre le nouveau jeton; l'ancien est alors fenced.
6. Aucun TTL ni vol implicite : l'absence d'observation explicite ne permet jamais de conclure qu'un
   effet est absent.

## Régressions protégées

- acquisition initiale et rejeu exact ; refus concurrent sans mutation de la propriété ;
- divergence de binding refusée avant création d'ownership ;
- deux acquisitions concurrentes : une seule propriété persiste ;
- jeton ancien refusé après reprise ;
- interruption après `begin` : reprise bloquée si incertaine, conservation si confirmée et
  réexécution seulement si observée absente ;
- migrations, typechecks Schema/Core et régressions DA20-003.

## Risques et limites

- Le fencing vaut aux frontières du service; un appelant qui mute sans `begin`/jeton n'est pas
  protégé. Le handoff UI devra rendre cet état explicite sans inventer une garantie universelle.
- Le contrat est local à la base SQLite et ne revendique ni consensus, ni horloge distribuée, ni
  coordination multi-hôte.
- Les effets externes doivent fournir une observation fiable pour être classés `confirmed` ou
  `absent`; sinon la reprise reste fail-closed.

## Décisions ouvertes

Aucune. Le scope et le mandat parent déterminent le contrat fail-closed, la persistance locale et les
limites.
