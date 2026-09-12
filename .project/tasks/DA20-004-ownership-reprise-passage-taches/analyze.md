# Analyze — DA20-004 — Ownership et reprise lors du passage entre tâches

## Objectif, autorité et périmètre

Cette analyse prépare le contrat local et strictement en lecture seule qui permet au cockpit de
présenter deux tâches séquentielles A puis B sans attribuer à B le chat, le worktree, le propriétaire,
les preuves, les effets ou l'attention de A. La délégation Sprint 4 autorise **Analyze seulement** :
aucun code produit, service, migration, test/smoke exécuté, commit, opération Git, session/PTY,
mutation MT/APEX ou action d'agent n'est fait dans cette phase.

Le parent DA40-016 a alloué ce worktree propre sur le commit DA30-009 `3fa91aba1`; le HEAD observé
est exactement ce commit. La carte est l'amont direct de DA20-005 (topologie Git lecture seule) et
alimente DA10-005 (cockpit lecture seule). DA30-010 reste propriétaire des métriques agrégées ; une
projection DA20-004 ne doit ni les calculer ni les agréger.

Dans le prochain Plan : un contrat de snapshot de lecture, fail-closed, où chaque ligne est portée
par l'identité complète de **sa** tâche, sa provenance et sa fraîcheur. Une inconnue est représentée
par un état explicite, jamais par une valeur reprise de l'autre entrée. Hors périmètre : commandes
Git, runtime agent, MT/APEX, UI, mutation d'ownership, transfert de session/worktree, double écrivain,
déplacement/suppression de worktree et calcul de métriques.

## Preuves et surfaces inventoriées

- `TaskBinding.Identity` est l'autorité durable de l'identité : `mtTaskID`, référence APEX,
  `sessionID`, projet/Location et checkout `{ repository, branch, worktree, head }`. `resume` exige
  une égalité complète et refuse l'absence ou chaque divergence avant écriture.
- `TaskExecution` conserve l'owner et la génération de fencing par `mtTaskID`, avec le `sessionID` et
  worktree liés. Ses effets `pending|confirmed` sont indexés par `mtTaskID`. `resume` transmet un
  owner **à l'intérieur de la même tâche**, après réconciliation des effets ; il ne fournit pas une
  transition A → B et ne doit pas être détourné pour en créer une.
- DA30-009 ajoute `TaskQueue.evaluate` (sélection pure A/B) et
  `TaskAuthority.observeQueue` (snapshot runtime frais + bindings individuels). Le résultat ne
  contient volontairement que `{ id, action }`, sans owner, session, checkout ni effet. Sa preuve
  B2 valide la sélection A active puis B après fermeture de A, et bloque les bindings/snapshots
  divergents.
- Aucun contrat d'« attention » de tâche n'existe dans Schema/Core au HEAD analysé. Les occurrences
  actuelles relèvent du TUI et ne constituent ni une autorité cockpit ni un signal lié à une tâche.
  DA20-004 doit donc définir une entrée source-explicite ou déclarer `unknown` ; il ne peut pas
  consommer une attention globale ou de session comme si elle appartenait à B. DA30-010 reste hors
  de cette frontière pour tout agrégat.
- `TaskAuthority.QueueObservation` ne porte aujourd'hui que MT/APEX/provenance de snapshot et
  résultat de file. Il ne permet pas à DA20-005 d'exiger une liaison owner → session → checkout par
  tâche sans refaire des inférences ; c'est précisément le manque que DA20-004 doit combler.

## Contrat recommandé au Plan

Introduire un domaine Schema/Core de projection, de nom à confirmer au Plan (par exemple
`TaskOwnership`), sans endpoint ni écriture. Son entrée reçoit une file ordonnée de
`TaskBinding.Identity` et la source de snapshot runtime déjà employée par `TaskAuthority` ; sa sortie
porte les faits par tâche, sans objet partagé mutable :

1. Chaque entrée expose son `mtTaskID`, l'identité de binding complète, la provenance/fraîcheur de
   l'observation runtime, un owner/effets provenant uniquement de `TaskExecution.get(mtTaskID)`, et
   une collection de signaux d'attention avec `sourceTaskID` obligatoire.
2. Chaque sous-fait est une union explicite `available | absent | inaccessible | invalid | expired |
   divergent | unknown` (le sous-ensemble exact sera fixé après vérification des conventions Schema).
   Une absence d'owner, d'effet, d'attention ou de preuve ne devient jamais une valeur neutre ou
   empruntée à A/B.
3. Le service compose les lectures existantes ; il ne fait ni `acquire`, `begin`, `confirm` ni
   `resume`. Une file vide, ID dupliqué, snapshot expiré/malformé, binding divergent ou relation
   owner/session/worktree incompatible retourne une projection bloquée/inconnue sans sélection
   implicite et sans écriture.
4. Pour A → B, la projection rend les entrées A et B simultanément consultables. La sélection B de
   `TaskQueue` ne transfère pas l'owner, la session, le worktree, les effets, l'attention ou la
   provenance de A. Toute tentative de fournir à B un token A, un worktree A, une session A ou une
   attention dont `sourceTaskID` est A est refusée ou présentée uniquement sous A, sans mutation.
5. Le snapshot public destiné à DA20-005/DA10-005 sera un modèle de lecture uniquement : il ne
   promet aucune commande Git ni reprise d'agent et DA20-005 devra recevoir le checkout déjà lié à
   l'entrée plutôt que le déduire de la sélection de file.

La décision de détail importante pour le Plan est de préserver l'immutabilité de
`TaskBinding.Identity` et de rendre le nouveau type de projection sérialisable dans Schema, tandis
que la composition Database/TaskAuthority/TaskExecution reste dans Core. Il n'y a pas de décision
métier ouverte : le scope impose ce choix fail-closed et séquentiel.

## Pathset candidat et dépendances

Pathset à valider au Plan, limité au domaine d'ownership/reprise :

- `packages/schema/src/task-ownership.ts` (nouveau contrat de projection, provenance, fraîcheur et
  attention source-explicite) et `packages/schema/src/index.ts` (export) ;
- `packages/core/src/task-ownership.ts` (lecture et composition de `TaskBinding`, `TaskAuthority`,
  `TaskExecution`) ;
- `packages/core/test/task-ownership.test.ts` (fixture SQLite A/B) ;
- seulement si nécessaire pour la couche de composition :
  `packages/core/src/task-authority.ts`, `packages/schema/src/task-authority.ts`,
  `packages/core/test/task-authority.test.ts`.

`task-binding`, `task-execution` et leurs tables/migrations sont des dépendances à lire et tester,
pas des cibles par défaut : les modifier augmenterait le mandat en faisant de DA20-004 une évolution
mutative d'ownership. Aucun fichier UI, HTTP, métriques, runtime session ou topologie Git ne fait
partie du pathset.

## Protections de régression et checks à prévoir

Tests ciblés du futur domaine :

1. A active/B todo : A expose uniquement son owner/session/worktree/effets/attention ; B reste
   explicitement `unknown` ou `absent` pour ses propres faits non observés.
2. A fermée/B sélectionnée : A conserve inchangés sa projection et ses signaux ; B expose uniquement
   son binding et, si présent, son propre owner/effets/attention.
3. Réexécution avec le même snapshot : résultat et provenance identiques, sans écriture Database.
4. Token/owner/session/worktree/HEAD de A fourni pour B : refus fail-closed, aucune sélection utile
   ni mutation ; A et B persistent inchangées.
5. Attention avec `sourceTaskID` A proposée sous B, source absente, IDs dupliqués, snapshot expiré,
   binding absent/divergent et observation incomplète : état explicite, sans consommation croisée.
6. Régressions de DA30-009 (`task-queue`, `task-authority`) et de DA20-003/DA30-004
   (`task-binding`, `task-execution`) restent vertes.

Checks de Build/Verify à inscrire au Plan, sans les exécuter dans Analyze : depuis `packages/core`,
`bun test test/task-ownership.test.ts test/task-authority.test.ts test/task-binding.test.ts
test/task-execution.test.ts`; puis `bun typecheck` dans `packages/schema` et `packages/core`, lint
ciblé si disponible, et `git diff --check`. Le smoke technique sera une base SQLite temporaire et
un snapshot synthétique A/B ; aucun service, navigateur, MT, APEX, Git ou agent réel n'est requis.

## Risques et limites

- La preuve DA30-009 garantit la file et les bindings de chaque entrée, pas l'association d'un owner
  ou d'un effet au snapshot cockpit ; le nouveau service doit interroger `TaskExecution` par
  `mtTaskID` et revalider l'identité avant de projeter.
- `TaskExecution` impose l'unicité de session et worktree entre tasks. Une projection ne doit pas
  contourner cette règle ni inférer qu'un worktree est disponible parce que B est sélectionnée.
- Les signaux d'attention ne disposent pas encore d'autorité durable à l'échelle tâche. Le Plan doit
  choisir une entrée de lecture injectée et provenance-obligatoire, ou les exposer `unknown`; il ne
  doit pas créer un collecteur/agrégateur global, réservé à DA30-010.
- Le snapshot runtime est une observation cache, non une autorité MT/APEX ; son expiration ou sa
  malformation doit rester visible aux consommateurs et bloquer toute liaison présentée comme sûre.
- La recette UI est expressément DA10-005/DA40-015. Le smoke DA20-004 sera technique et local ; ne
  pas conclure à une validation visuelle cockpit depuis ce worktree.

## Questions et prochaine étape

Aucun blocker ni décision utilisateur n'est requis pour le Plan : le mandat fixe le comportement
séquentiel, local et fail-closed. La prochaine instruction bornée est de rédiger `plan.md` avec le
nom de domaine final, les unions d'état exactes, les blocs Schema/Core/tests et les checks ci-dessus,
puis de faire valider ce plan par le parent avant tout Build.
