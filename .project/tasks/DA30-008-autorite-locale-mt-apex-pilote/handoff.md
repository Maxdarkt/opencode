# Handoff — DA30-008

## Résultat

Le protocole local expose maintenant une observation MT/APEX provenant exclusivement d’un snapshot local explicitement configuré. Elle porte `state`, `provenance`, horodatages et génération; seules les observations fraîches, validées et concordantes fournissent `mtStatus`/`apexPhase` au pilote DA30-006. Source absente, invalide, expirée ou divergente: valeurs omises, pilote bloqué. Aucun statut n’est déduit de `TaskBinding`, `TaskExecution`, Git ou Markdown.

## Fichiers et Git

- Commit local: `00a62c8dd5bf619d2acdc2b554fe0c7098e2f149` sur `mt-apex-authority`; base `7c53f4afe485fa550b38a295c3aa255b45d495f5`; worktree produit propre.
- Contrat/lecture: `packages/schema/src/task-authority.ts`, `packages/core/src/task-authority.ts` et test.
- Projection/consommation: `LocalContext.Info`, handler global, serveur, `ProjectContextView` et SDK v2 régénéré.

## Vérifications

Toutes les commandes détaillées dans `verify.md` passent: génération SDK, typechecks Schema/Core/OpenCode/App/SDK, quatre tests ciblés et `git diff --check`. Le suite App complet a un échec préexistant `pa-PK`; le test du pilote est vert.

## Smoke visuel parent

Précondition: définir `OPENCODE_TASK_AUTHORITY_SNAPSHOT` vers un `CURRENT.json` v2 non expiré. L’entrée de tâche doit correspondre au `mtTaskID`, `git.worktreePath` et `git.head` du binding et contenir une paire DA30-006 admise. À 1440×900 puis 1024×768, confirmer MT/APEX/action distincts et l’ouverture du chat/worktree existant. Tester ensuite une fixture expirée ou divergente: aucune valeur ni action ne doit rester. Ne pas écrire MT/APEX/cache pendant cette recette.

## Suite

Le parent intègre ce commit avec les livraisons Sprint 3, configure une fixture locale fraîche pour Pass B, puis décide review/closure. Aucun push, merge, rebase ou mutation MT n’a été effectué par cet enfant.
