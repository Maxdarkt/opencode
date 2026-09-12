# Plan — DA20-004 — Ownership et reprise lors du passage entre tâches

## Mandat et décision de conception

Le Sprint 4 autorise, après le checkpoint Analyze accepté, un unique domaine local de **projection
lecture seule** : `TaskOwnership`. Il compose les autorités existantes sans les modifier :
`TaskBinding` prouve l'identité, `TaskAuthority.observeQueue` apporte le snapshot MT/APEX frais et
sa provenance, `TaskExecution.get` apporte l'owner/génération/effets de la même tâche. Une entrée
source-explicite porte les signaux d'attention ; en son absence, l'état est `unknown`.

Ce plan n'autorise aucun endpoint, UI, commande Git, action agent, écriture MT/APEX, acquisition ou
reprise d'owner, migration SQLite, dépendance, service local réel, commit, rebase, merge ou push.
`TaskExecution.resume` n'est jamais appelé par `TaskOwnership` : il reste un protocole mutatif de
reprise dans le même `mtTaskID`, et ne peut pas devenir une transition A → B. DA20-005 reçoit une
projection avec checkout déjà lié à son identité, pas des commandes Git ni une permission d'inférer
un worktree depuis la sélection de file.

## Contrat Schema : `TaskOwnership`

Créer `packages/schema/src/task-ownership.ts`, exporté par `packages/schema/src/index.ts`. Les noms
ci-dessous sont le contrat final du Build ; les valeurs sont sérialisables, readonly et sans runtime
Core.

### États, provenance et fraîcheur

- `State` est l'union fermée `available | absent | inaccessible | invalid | expired | divergent |
  blocked | unknown`.
- `Provenance` contient au minimum `source` (valeurs fermées
  `task_binding | runtime_snapshot | task_execution | attention_input`) et une référence textuelle
  non vide ; `Freshness` contient `observedAt`, `expiresAt` et `generation` optionnels, sans valeur
  inventée.
- `Fact<Value>` est une union taggée : `available` porte `value`, toutes les autres variantes portent
  l'état, provenance et fraîcheur. Ainsi l'absence/expiration/divergence/inconnu est lisible et ne
  prend jamais la forme d'un `undefined` silencieux.

### Entrée et sortie

- `Attention` porte obligatoirement `sourceTaskID`, `id` et `kind` non vides, plus provenance et
  fraîcheur. Son contenu descriptif reste volontairement hors contrat (aucun agrégat, score ou
  interprétation DA30-010).
- `EntryInput` porte `identity: TaskBinding.Identity` et `attention` optionnel. L'omission signifie
  que la sortie `attention` est `Fact` dans l'état `unknown`; une liste fournie est admise seulement
  si chaque `sourceTaskID === identity.mtTaskID`.
- `Input` porte la liste ordonnée d'`EntryInput` et le `snapshotPath` optionnel déjà accepté par
  `TaskAuthority.QueueInput`.
- `Entry` porte l'`identity` complète, les `binding`, `authority`, `execution` et `attention` comme
  `Fact`, chacun avec sa provenance/fraîcheur propre. `execution.available` contient seulement le
  `TaskExecution.Snapshot` de ce `mtTaskID`; `attention.available` contient les seules attentions
  de cette même entrée.
- `Snapshot` porte le `state`, la provenance/fraîcheur de la source de file, le `TaskQueue.Result`
  inchangé, et toutes les `Entry` dans l'ordre de l'entrée. Il ne contient aucune opération ni
  commande. Une sélection `result.selected.id` ne modifie ni l'ordre ni les faits des autres entrées.

Le contrat ne réutilise pas `TaskAuthority.QueueObservation` comme unique preuve d'identité : la
projection rend séparément la preuve `TaskBinding`, donc le consommateur voit quelle source manque
ou diverge. Il n'introduit ni type de métrique, ni état d'agent, ni modèle global d'attention.

## Composition Core et règles fail-closed

Créer `packages/core/src/task-ownership.ts` avec `TaskOwnership.Service.read(input)`. Sa layer dépend
de `TaskBinding.node`, `TaskAuthority.node` et `TaskExecution.node`; ses appels sont exclusivement
`TaskBinding.resume(identity)`, `TaskAuthority.observeQueue({ entries, snapshotPath })` et
`TaskExecution.get(identity.mtTaskID)`.

Pour chaque entrée, la composition applique cet ordre déterministe :

1. vérifier le binding exact par `TaskBinding.resume`; `NotFoundError` devient `absent`, toute
   `ConflictError` devient `divergent`, et aucune erreur ne crée ou ne corrige un binding ;
2. lire une seule observation de file avec les identités de toutes les entrées. Sa provenance et sa
   fraîcheur restent attachées aux entrées et au snapshot, sans copie de champs d'une tâche à une
   autre ;
3. lire `TaskExecution.get` avec le `mtTaskID` de l'entrée seulement. Une absence devient `absent`.
   Si le token retourné ne concorde pas avec l'identité de cette entrée (`mtTaskID`, `sessionID`,
   `worktree`), il devient `divergent`; il n'est ni projeté ni réparé ;
4. valider les attentions d'entrée avant projection. Une attention dont `sourceTaskID` ne concorde
   pas rend **cette entrée** `invalid`/`blocked`; elle n'est ni déplacée vers A ni affichée sous B.
   Une attention omise reste explicitement `unknown` ;
5. si binding, snapshot de file, identité execution ou attention est invalide/divergent/expiré, le
   snapshot global est `blocked` et son `TaskQueue.Result` est un blocage typé. Les faits déjà lus de
   A restent présents seulement sous A ; B ne reçoit jamais leurs valeurs. Aucun chemin ne lance
   `TaskExecution.acquire`, `begin`, `confirm` ou `resume`.

La provenance `runtime_snapshot` ne prend pas l'autorité MT/APEX : elle indique l'observation
cache. `TaskBinding` et `TaskExecution` restent les sources locales de leurs faits respectifs. La
sortie est donc utilisable par DA20-005 pour associer un checkout prouvé à chaque ligne, y compris
quand la file est bloquée, sans déduire de topologie ni autoriser une mutation.

## Blocs Build bornés

### B1 — Contrat et projection lecture seule

Fichiers autorisés :

- `packages/schema/src/task-ownership.ts` ;
- `packages/schema/src/index.ts` ;
- `packages/core/src/task-ownership.ts`.

Ajouter les contrats ci-dessus, la facade Core et la lecture/composition purement locale. Aucun
changement de table, migration, `TaskBinding`, `TaskExecution`, `TaskAuthority`, endpoint ou UI.
Le Build doit démontrer dans le diff qu'aucun appel aux méthodes mutatives de `TaskExecution` n'est
introduit.

Check B1 : typecheck Schema/Core, lint ciblé des trois fichiers si l'outil est présent, et
`git diff --check`. Si le typecheck révèle un besoin de modifier une dépendance existante, arrêter le
bloc et consigner la divergence plutôt que d'élargir le pathset.

### B2 — Régressions A/B et smoke technique

Fichier autorisé :

- `packages/core/test/task-ownership.test.ts`.

Construire des fixtures SQLite temporaires de bindings et owners A/B distincts, plus un snapshot
runtime synthétique. Couvrir :

1. A active/B todo, puis A `review|verify`/B todo : sélection A puis B, A demeure visible et ses
   faits ne changent pas ;
2. deux owner tokens/session/worktree distincts : chaque sortie correspond seulement à sa propre
   identité ;
3. absence d'attention → `unknown`; attention A ou source divergente fournie à B → refus sans fuite ;
4. token session/worktree divergent, binding divergent/absent, snapshot expiré et IDs dupliqués →
   blocage explicite sans écriture ;
5. rejeu identique → même résultat/provenance et aucune ligne `TaskExecution`/binding/effet modifiée.

Checks B2 : depuis `packages/core`,
`bun test test/task-ownership.test.ts test/task-authority.test.ts test/task-binding.test.ts test/task-execution.test.ts`;
depuis `packages/schema` puis `packages/core`, `bun typecheck`; lint ciblé si disponible ;
`git diff --check`. Le smoke technique réemploie la fixture B2 : observer A active, fermer A dans le
snapshot synthétique, observer B, vérifier A conservée, puis injecter une attention ou un token A
sous B et constater le refus. Aucun serveur, navigateur, Git, MT, APEX ou agent réel n'est lancé.

## Risques, dépendances et arrêt

- `TaskAuthority.observeQueue` lit déjà une fois le snapshot et valide les bindings, mais le nouveau
  service conserve une preuve de binding par entrée afin que l'inconnu soit explicite. Ne pas
  modifier DA30-009 pour rendre ce détail plus commode.
- Un owner absent est une observation, pas une permission d'en acquérir un. Une génération ou un
  effet de A n'est jamais un défaut à corriger depuis B.
- L'attention est un canal injecté de lecture tant que DA30-010 ne définit pas son autorité. Ajouter
  une collecte, une agrégation ou une métrique serait hors périmètre.
- DA10-005/DA40-015 portent l'UI et la recette visuelle ; DA20-005 porte la topologie Git détaillée.
  Aucun résultat B1/B2 ne peut déclarer ces tâches vérifiées.
- Arrêt réel : conflit sur les trois fichiers produits, nécessité démontrée d'une migration/changement
  de dépendance, échec d'un check requis après corrections bornées, ou décision demandant une action
  Git/agent/MT/APEX. Aucun de ces cas n'est observé au Plan.

## Mandat de reprise exact

> Dans `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA20-004-cockpit-ownership`, exécute uniquement B1 de `.project/tasks/DA20-004-ownership-reprise-passage-taches/plan.md` : ajoute le contrat Schema `TaskOwnership`, son export et le service Core `read` strictement lecture seule. Compose `TaskBinding.resume`, `TaskAuthority.observeQueue` et `TaskExecution.get` seulement ; ne jamais appeler `TaskExecution.acquire`, `begin`, `confirm` ou `resume`, ni modifier les domaines existants, SQLite/migrations, UI, endpoint, Git, agent, MT ou APEX. Lance les checks B1, écris `blocs/B1-task-ownership.md` et checkpointe STATE. Aucun commit, push, rebase, merge ou B2. Modèle demandé : `gpt-5.6-luna` / `medium`; toute métadonnée absente ou divergente est informative et non bloquante.

Le parent relit B1 et ses preuves avant de déléguer B2. Les deux blocs ne sont pas autorisés dans un
même paquet.
