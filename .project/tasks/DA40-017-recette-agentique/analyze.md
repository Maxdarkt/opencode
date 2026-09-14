# Analyze — DA40-017 — Recette 0.2 : tests de codage agentique isolés

## Git, MT, autorité

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA40-017`
- Branche : `recette-agentique` @ `9bcddb2c0` (`feat(app): show agent banner and honest pack inspector`)
- Arbre propre. `bun.lock` = blob du SHA (pas le lock sale post-install de DA10-008)
- APEX canonique : `/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/tasks/DA40-017-recette-agentique`
- MT `DA40-017` : `in_progress` (démarrage)
- Sprint 5 / release 0.2. Dépend de DA30-013, DA10-007, DA30-012, DA10-008 (Verify verts)
- Aucun Build produit sur `staging`. Thème DA40 ≠ worktree `features/40-tooling`

## Objectif

Prouver qu’un **agent de codage** tourne sur un worktree de carte : isolation vs `staging`, pack/tokens visibles, Interrupt qui **coupe un run**. Scénario reproductible, checks, smoke. Pas de merge.

Acceptation (scope) :

1. Fichiers changés seulement dans l’arbre de carte
2. Pack / tokens visibles
3. Interrupt stoppe un run

## Surfaces déjà livrées (ce HEAD) — ne pas reconstruire

| Preuve 0.2 | Où | Limite |
| --- | --- | --- |
| C2 pack borné au worktree | `ContextPack.boundPathset` ; omit staging / sibling | Pack de **contexte**, pas la mutation disque |
| C5 cachePrefix cwd+règles+outils | Core `promptCacheKey` | Hors recette visuelle |
| C3 prune / compaction | Core runner | Hors acceptation DA40-017 |
| W1/W2 un chat = un arbre | `POST /global/task-chat/open` ; convention `features/tasks/<id>` | Launch cockpit ; pas `git worktree add` |
| C4 Interrupt réel | `SessionExecution.interrupt` ; HTTP `POST …/interrupt` ; idle = no-op | Tests runner ; pas de chaîne recette HTTP |
| C1 bandeau + inspecteur | Vue session ; GET `/api/session/:id/pack` | Smoke DA10-008 = **Idle** seulement |
| Mutation Location | Relatif `../` → `relative_escape` ; absolu hors Location → `external_directory` | Unitaire ; pas chaîné open+write+empreinte staging |

## Écart recette (ce que les quatre cartes n’assemblent pas)

Aucun test unique ne fait : **open carte → write outil → staging intact → GET pack → drain busy → interrupt → idle**.

- Pack HTTP et bandeau existent, mais pas après un tour de **codage**.
- Interrupt coupe un drain en Core ; la recette n’a pas la preuve HTTP + « staging inchangé pendant le run ».
- `external_directory` reste `ask` (pas un mur OS). La recette doit prouver : relatif dans l’arbre = écrit ; fuite relative vers `staging` = refus ; absolu staging nié = pas d’écriture.
- `.make.env` absent ici. Ports carte : `WORKTREE_CODE=17` → `4117` / `4417` (comme DA40-015 = 15). Fichier local ignoré, jamais commité.

## Décisions proposées (à valider pour Plan)

1. **Nature.** Recette d’intégration, pas un rewrite C1–C5 / W1–W2. Produit seulement si un trou d’isolation est **démontré** par les checks (alors correctif borné dans le pathset).
2. **Harness.** Tests : tmp `…/features/tasks/<id>` + empreinte du checkout source `…/Daidalon` (HEAD + `git status --porcelain`). Zéro écriture recette dans `staging`.
3. **Isolation (acceptation 1).** Write relatif `notes.md` (ou équivalent) → fichier seulement dans l’arbre carte. `../` vers staging → `relative_escape`, pas de fichier. Absolu staging + deny `external_directory` → staging identique. Pas de LLM payant : mock / outil direct sous Location de session ouverte.
4. **Pack (acceptation 2).** Après open (et éventuellement write) : `GET /pack` worktree = directory observé ; tokens `unknown` sans `value` si pas de request ; `unknown` ≠ `"0"` / `$0.00`. Inspecteur App inchangé sauf trou.
5. **Interrupt (acceptation 3).** Drain mock busy (stream gated) → `POST /interrupt` → plus busy ; idle interrupt = no-op. Preuve « stoppe un run » = ce check (pas un provider réel).
6. **Smoke.** `make dev` ports 17. Launch cockpit **DA40-017** → session liée. Bandeau Idle, inspecteur Contexte/Coût honnêtes, Interrupt **absent** à Idle. Run visuel Interrupt seulement si un drain local mockable sans clé provider ; sinon la preuve run = check HTTP, limite notée dans `smoke-report.md`.
7. **Honnêteté.** Ne pas inventer un pathset, un coût `0`, ni un write staging « simulé ». `bun.lock` : celui du SHA `9bcddb2c0` uniquement.

## Hors périmètre (confirmé)

Chrome 0.3 (rail, terminal, panneau Files/Diff). `$` DA30-014. Merge / push / rebase. `TaskExecution.resume`. Worktree Git `add`/`remove`. Lock sale DA10-008. Build sur `staging`.

## Pathset probable

- Test recette (HTTP et/ou Core) : open + write isolé + pack + interrupt
- APEX `blocs/` + `smoke-report.md` / `verify.md`
- `.make.env` local (gitignored) si Smoke
- Correctif produit **seulement** si un check rouge révèle un trou

## Risques

- Permission `ask` ≠ isolation OS : la recette documente deny + `relative_escape`, pas un sandbox kernel
- Runner pack encore pauvre (`paths: []`) → `unknown` accepté (C1)
- Smoke `make dev` ne doit pas installer un `bun.lock` sale (ne pas `bun install` inutile)
- Fixtures Sprint 4 A/B : ne pas les réécrire ; launch recette = carte DA40-017

## Décisions ouvertes

Aucune métier. À valider : les 7 décisions ci-dessus.
