# Smoke report — DA20-003

## Smoke technique enfant

### Environnement et préconditions

- Worktree `/Users/leanbot/Documents/40_Daidalon/features/s2-20-binding`, branche
  `task-session-binding`, HEAD de travail basé sur `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2`.
- Bun `1.3.9`; dépendances installées localement avec `bun install --frozen-lockfile`; `bun.lock`
  inchangé.
- Base SQLite isolée en mémoire via le harness Core ; aucun serveur, compte externe ou fournisseur
  LLM requis.

### Action et résultat

Commande depuis `packages/core` :

`bun test test/task-binding.test.ts test/local-context.test.ts test/database-migration.test.ts`

Résultat : PASS, 30 tests / 123 assertions. Le parcours couvre :

1. création d'une session persistée et adoption du binding complet ;
2. reconstruction logique par nouvelle lecture du service et reprise exacte ;
3. rejeu exact sans duplication ni mutation du timestamp ;
4. refus typé de session/binding absent ;
5. refus `adopt` et `resume` de chaque divergence MT, external_ref, session, projet/location, dépôt,
   branche, worktree et HEAD ;
6. preuve que les lignes refusées restent identiques ;
7. compatibilité avec l'observation Git read-only `LocalContext` et les migrations historiques.

Checks complémentaires sur la même révision de travail :

- `bun typecheck` dans `packages/schema` : PASS ;
- `bun typecheck` dans `packages/core` : PASS ;
- `bun run script/migration.ts --check` : PASS ;
- Prettier ciblé : PASS ;
- Oxlint ciblé : PASS, 0 warning / 0 erreur ;
- `git diff --check` : PASS.

Suite globale Schema : 13 PASS / 2 FAIL dans `event-manifest.test.ts`. Les mêmes deux échecs sont
reproduits sur la baseline exacte `9ba850b68`; ils sont donc préexistants et tracés dans
`problems.md` sans modification hors périmètre.

### Correction

Le premier test ciblé a révélé deux fixtures Workspace non canoniques. Elles ont reçu le préfixe
`wrk_` exigé par `Workspace.ID`; le contrat et la persistance n'ont pas changé. Aucun autre cycle de
correction n'a été nécessaire.

## Limites et régressions

- Le service ne mesure pas Git : l'appelant fournit les faits observés par `LocalContext`; il les
  persiste et les compare sans lancer de commande ni réparer le checkout.
- Pas de lease, ownership, TTL, génération d'écrivain ou arbitrage : DA30-004.
- Pas de route HTTP ni de présentation UI dans ce pathset : DA10-003.
- La suppression en cascade d'une session/projet supprime son binding conformément aux FK ; aucune
  réutilisation silencieuse d'une session supprimée n'est possible.

## Plan de smoke visuel parent

- **Environnement** : candidate Sprint 2 intégrant DA20-003, DA30-004 et DA10-003, runtime local sur
  une base de test neuve ; aucun compte externe.
- **Préconditions/fixtures** : projet Git avec branche `task-session-binding`, HEAD connu, un worktree
  lié, carte `DA20-003`, external_ref APEX stable et session attachée à la même Location.
- **Route/action** : ouvrir la vue tâche/contexte actif livrée par DA10-003 depuis le Sprint ; reprendre
  la session existante, puis rejouer le même binding. Ensuite injecter successivement dans le fixture
  un autre HEAD, une autre branche et un autre worktree et relancer la reprise.
- **Viewport** : desktop `1440×900` ; vérifier aussi `1024×768` si la barre de contexte est responsive.
- **États attendus** : le contexte exact affiche sans ambiguïté tâche, external_ref/session, dépôt,
  branche, worktree et HEAD ; le rejeu n'ajoute aucune tâche/session. Chaque divergence bloque avant
  action d'écriture, nomme le champ divergent et conserve l'ancien binding.
- **Régressions** : navigation vers une session libre sans binding, session supprimée, Location avec
  ou sans workspace, worktree lié et changement de HEAD ; aucune action Git destructive proposée ou
  exécutée automatiquement.
- **Preuves à capturer** : capture de l'état exact, capture du refus avec champ divergence, compte de
  lignes/sessions avant-après ou trace API, et logs du smoke parent liés au commit intégré.

## Reprise/correction exacte

En cas d'échec, rouvrir `.project/tasks/DA20-003-binding-tache-session-worktree/STATE.md`, identifier
le champ ou check rouge, puis reprendre dans `packages/core/src/task-binding.ts` et
`packages/core/test/task-binding.test.ts`. Toute demande de lease ou d'UI doit rester dans DA30-004
ou DA10-003 et ne doit pas étendre cette carte.
