# Plan — DA40-011 Candidate intégrée Sprint 2

## Mandat et résultat attendu

Mandat parent du Sprint `da-release-0.1-sprint-2`, transmis après acceptation de DA20-003,
DA30-004 et DA10-003 : assembler leurs commits sur `sprint2-integration`, vérifier la candidate,
effectuer le smoke technique, préparer le smoke visuel parent et créer un commit local DA40 borné.
Sont exclus : staging, push, merge/rebase des branches métier, promotion, reset, nettoyage
destructif, suppression de worktree et changement fonctionnel d'une tâche source.

Le succès exige une histoire locale traçable, les arbres sources reconstitués aux frontières, les
contrats binding/ownership/UI compatibles, les checks rejoués sur le HEAD exact, puis des preuves et
un retour arrière reproductibles. Aucun choix utilisateur supplémentaire n'est requis.

## Contrats et protections

- Appliquer les patches par `git cherry-pick` dans l'ordre transmis; ne jamais intégrer une branche.
- Après DA20, le tree du HEAD doit égaler celui de `a70bf26ad`; après DA30, celui de `1de05c023`;
  après les huit commits DA10, celui de `f4b7b44d8`.
- Avant/après chaque bloc : mesurer HEAD, staged/unstaged/untracked et conserver les projections
  Sprint/release préexistantes hors index et hors commits.
- Un conflit mécanique est résolu selon les arbres sources; un conflit fonctionnel ou une rupture
  d'arbre arrête le bloc et remonte au parent.
- Les générations et migrations doivent être reproductibles sans delta produit inexpliqué.

## Blocs bornés

### B1 — Intégrer DA20-003

Cherry-pick `a70bf26adc4ece7645e3654452c0f034f78d05ac`. Vérifier parent/baseline, pathset de 19
chemins, absence de conflit et égalité du tree avec la source. Exécuter depuis `packages/core` les
tests `task-binding`, `local-context` et `database-migration`, puis le typecheck Schema/Core et le
check de migration. Produire `blocs/B1-da20.md` et un checkpoint.

### B2 — Intégrer DA30-004

Cherry-pick `1de05c0239357fb5796935460b89bfd9deec939b`. Vérifier son pathset de 21 chemins et
l'égalité du tree avec la source; aucun cherry-pick intermédiaire `eceeb7dd` n'est ajouté. Depuis
`packages/core`, exécuter les tests `task-execution`, `task-binding`, `local-context` et
`database-migration`, le typecheck Schema/Core et le check migration. Produire `blocs/B2-da30.md`.

### B3 — Intégrer DA10-003

Cherry-pick successivement `bafde2951`, `213cccd97`, `6f7cace52`, `5247b61c4`, `c7079f2ca`,
`9c9dcb717`, `6cc3f03fc`, `f4b7b44d8`. Vérifier les huit parents successifs, le pathset final et
l'égalité du tree avec `f4b7b44d8`. Rejouer les trois tests HTTP ciblés depuis `packages/opencode`
et les tests App `active-task-context-state`, `active-task-write-guard` et `prompt-input/submit` avec
Solid/happydom. Typechecks OpenCode/App. Produire `blocs/B3-da10.md`.

### B4 — Vérifier la candidate intégrée

- `packages/core` : quatre tests ciblés puis suite `bun test` complète; `bun typecheck` et
  `bun run script/migration.ts --check`.
- `packages/schema` : `bun typecheck`, puis suite `bun test`; distinguer les deux rouges
  `event-manifest` déjà reproduits sur la baseline.
- `packages/opencode` : trois tests HTTP ciblés et `bun typecheck`.
- `packages/app` : trois tests UI ciblés et `bun typecheck`.
- `packages/client` : `bun run generate`; `packages/sdk/js` : `bun run build`. Vérifier ensuite
  qu'aucun fichier produit inattendu n'est dirty.
- Lint/format ciblés des sources intégrées et `git diff --check`.

Toute correction strictement d'intégration devient un bloc C1 borné, suivi des checks affectés;
aucune correction fonctionnelle source n'est absorbée. Produire `blocs/B4-verify.md`.

### B5 — Smoke technique et plan visuel parent

Créer l'ignoré `.make.env` avec `WORKTREE_CODE=51`, `BACKEND_PORT=4151`, `UI_PORT=4451`,
`HOST=127.0.0.1`. Exécuter `make config-check`, `make context`, `make ports`,
`make preflight-ports` et `DRY_RUN=1 make dev`, puis démarrer la candidate locale.

Le smoke technique confirme l'accès backend/UI et les parcours concordant, divergent, ownership
concurrent, effet pending/uncertain et refus d'écriture avec restauration du brouillon. Aucun compte
externe ni appel modèle. Arrêter uniquement les processus lancés par ce bloc et conserver
`.make.env` pour le smoke parent. Produire `smoke-report.md` avec commandes, résultats et HEAD.

Le plan parent couvre 1440×900 et 1024×768 : ouvrir `http://127.0.0.1:4451`, vérifier
projet/sprint/tâche/session/worktree/branche/HEAD/owner/génération/effets, puis les fixtures HEAD
divergent et effet pending. Capturer états initial/refus/reprise, traces API et preuve de zéro écriture
sur refus, y compris conservation exacte du brouillon.

### B6 — Handoff et commit DA40 borné

Écrire `verify.md`, `handoff.md`, `problems.md` et la procédure de retour à la baseline. Le retour
arrière proposé reste non destructif : conserver les commits intégrés et, si la candidate est
refusée, créer une nouvelle candidate depuis la baseline ou réverter explicitement la série après
inventaire; ne jamais reset/clean. Committer uniquement le dossier APEX DA40-011 et les éventuelles
corrections d'intégration explicitement justifiées, jamais les projections préexistantes ni
`.make.env`. Relire le commit/pathset, passer MT `in_progress → review`, puis remettre le smoke
visuel au parent; le parent seul décide `done`.

## Dettes et arrêt

Dette héritée : deux échecs Schema `event-manifest` préexistants, à documenter séparément sans les
attribuer à la candidate. L'incohérence documentaire ancienne du STATE DA10 est neutralisée par MT
actuel `done`. Arrêt seulement sur conflit fonctionnel, arbre divergent, rouge nouveau/non isolable,
port occupé sans alternative autorisée ou effet externe incertain.
