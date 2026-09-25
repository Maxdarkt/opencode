# Plan — DA10-004

## Mandat et contrat

Le mandat Sprint 3 du parent autorise le parcours local Analyse → Plan → Build → checks → smoke technique → handoff dans `/Users/leanbot/Documents/40_Daidalon/features/s3-10-sprint-view`. Il exclut explicitement commit, merge, rebase, push, déploiement, suppression et intégration inter-worktree. Les opérations de réconciliation/recette visuelle/closure restent au parent.

Entrée fonctionnelle : le contrat DA30-006 v1. Une observation comporte `mtStatus`, `apexPhase?` et `context`; l'évaluation est pure et rend soit l'action suivante, soit un motif de blocage. La vue ne persiste aucune autorité, n'alloue aucune identité et ne synthétise aucune observation absente.

### Frontière de données

La carte reçoit deux sources distinctes : (1) l'identité locale déjà observée (`TaskBinding`/`TaskExecution`) pour `mtTaskID`, `sessionID`, `worktree`, effets et navigation; (2) une observation pilote optionnelle, fournie explicitement par un futur lecteur MT/APEX. Le `LocalContextInfo` actuel ne fournit pas la seconde source. En son absence, la carte affiche statut et phase « non observés », expose `context_incomplete`, masque toute prochaine action et conserve seulement l'ouverture du chat déjà lié quand l'identité existe. Elle ne déduit ni Sprint, ni statut MT, ni phase APEX depuis l'autre source.

## Blocs

### B1 — Modèle de lecture et évaluation pure

Créer un module UI local qui définit l'observation, applique exactement la table DA30-006 et fournit les libellés d'action/motif. Tester les sept transitions admises, les associations interdites, la priorité des trois contextes bloquants et l'idempotence. Aucun appel réseau, import de `core`, ni écriture.

### B2 — Carte de pilotage et navigation existante

Créer une carte responsive affichant séparément tâche, statut MT, phase APEX, dépendances d'identité, motif/action. Insérer la carte sous le contexte projet existant. Les dépendances visibles sont l'identité de tâche, le worktree, le chat et les effets d'exécution; tout effet `pending` est un bloc `resuming`. Quand l'identité TaskBinding est présente, le seul bouton ouvre la route du `sessionID` déjà lié dans le `worktree` déjà lié; sinon il reste désactivé. Ajouter les clés i18n source et les tests de rendu/intégration nécessaires. Ne pas afficher un Sprint ni une phase/statut comme mesurés sans observation explicite.

## Vérifications

- tests unitaires B1 sur toutes les lignes de la table DA30-006;
- test de la carte : valeurs distinctes, observation absente explicitement bloquée, blocage prioritaire et action d'ouverture seulement avec identité;
- `bun test --conditions=solid --preload ./happydom.ts ./src/components/<tests ciblés>` depuis `packages/app`;
- `bun typecheck` et `bunx prettier --check` sur les fichiers touchés, puis `git diff --check`;
- smoke technique : rendu contrôlé de la carte sur une observation concordante et une observation bloquée, avec navigation construite vers la session existante.

## Smoke visuel parent

Préconditions : candidate inter-tâches contenant DA30-006 et DA10-004, runtime local avec une fixture liant `mtTaskID`, session et worktree, observations MT/APEX explicites. À `1440×900` puis `1024×768`, vérifier que statut MT, phase APEX, dépendances, action et motif restent lisibles et distincts; vérifier que le bouton ouvre le chat existant dans le bon worktree et qu'un contexte `incomplete`, `divergent` ou `resuming` désactive l'action. Capturer écran + valeur route + HEAD. Le parent est propriétaire de cette recette et de toute correction issue de son jugement.

## Risques et arrêt

Une API live MT/APEX ou une agrégation Sprint est hors contrat : la signaler au parent, sans la simuler. Écart de contrat DA30 ou échec de check non corrigeable dans les deux blocs : checkpoint APEX et rapport au parent. Les corrections limitées aux fichiers de ces blocs sont autorisées.

## Correction C1 — passerelle d'observation

Le `LocalContextInfo` actuel expose l'identité et les effets, mais pas les deux autorités MT/APEX. C1 rend `mtStatus` optionnel dans l'observation de présentation et transmet à la carte le contexte réellement calculé par `getActiveTaskState`. L'évaluateur conserve `context_incomplete` tant que le statut MT est absent; une phase APEX seule n'est pas une autorité suffisante. La carte affiche donc explicitement le contexte réel et ne prétend plus que celui-ci serait inconnu, sans fabriquer une action. Une future source MT/APEX peut compléter la même observation sans modifier le composant.

Tests C1 : contexte concordant/incomplet/divergent/résumant avec statut absent, et conservation des couples DA30 admis. Smoke visuel : fixture avec observation complète puis sans statut MT, aux deux tailles parent, preuve de l'action active puis du fail-closed.
