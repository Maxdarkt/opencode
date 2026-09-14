# Analyze — DA10-008 — Bandeau agent et inspecteur de pack

## Git, MT, autorité

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA10-008`
- Branche : `pack-inspector` @ `a8884d674` (merge propre `201fa68c2` + `28038c5cf`)
- APEX canonique : `/Users/leanbot/Documents/40_Daidalon/Daidalon/.project/tasks/DA10-008-bandeau-inspecteur`
- MT `DA10-008` : `in_progress`
- Sprint 5 / release 0.2 : C1 UI. Dépend de DA30-013, DA30-012, DA10-007 (faits). Bloque DA40-017.
- Aucun Build produit sur `staging`. Chrome rail/terminal/secondaire = DA10-009 (0.3).

## Objectif

Bandeau agent : **running / idle**, outil en cours, cwd, **Interrupt** réel (DA30-012). Inspecteur flottant minimal : pack + tokens/coût, `unknown` si absent, **jamais un faux zéro**.

## Surfaces observées (ce HEAD)

| Surface | État | Écart DA10-008 |
| --- | --- | --- |
| `POST /api/session/{id}/interrupt` | Core `SessionExecution.interrupt` ; idle = no-op | App l’appelle (`halt`, undo) **sans** bouton bandeau |
| `session.status` / SSE `session_status` | `idle` / `busy` / `retry` | Pas de bandeau Running/Idle ; `busy` ≠ libellé maquette |
| Outil en cours | Parts tool `running` dans le fil | Pas lu dans un bandeau |
| cwd | `session.directory` / `location.directory` (DA10-007) | Pas affiché sur le bandeau |
| `ContextPack` Schema + `ContextPack.assemble` Core | Pack métier (mandat, pathset, omitted, tokens, cachePrefix) | **Aucun HttpApi**. Runner n’assemble que le `cachePrefix` (`paths: []`, pas de `requestBefore/After`) → tokens pack = `unknown` tant qu’on n’expose pas mieux |
| `session.next.drain.ended` | Live-only, hors EventManifest | App/SDK ne le voient pas. Hors besoin C1 (idle suffit) |
| `SessionContextUsage` | Tokens assistant + `info.cost ?? 0` | **Faux zéro $** interdit pour C1. Ne pas réutiliser tel quel |
| `/global/metrics` | `TaskMetrics` honnête (DA30-007) | Cockpit sprint seulement ; pas collé à la session ouverte |
| Cockpit `/sprint/cockpit` | Launch + libellé worktree (DA10-007) | Dashboard sprint, pas le chat agent. Ne pas y recoller le chrome 0.3 |
| Maquette `docs/product/maquette/cockpit.html` | Bandeau 32px + inspecteur ☰ (Tâche/Git/Coût/Serveurs/Permissions) | Recette visuelle 0.3 ; ici : bandeau + onglets **Contexte / Coût** seulement |

## Décisions proposées (à valider pour Plan)

1. **Où.** Bandeau + inspecteur sur la **vue session** App (`/{b64}/session/{id}`), après launch DA10-007. Pas de rewrite cockpit, rail, terminal, panneau secondaire.
2. **État.** `busy`|`retry` → Running ; `idle` → Idle. Permission pending reste Running (outil = permission / `unknown`). Pas d’état Blocked obligatoire (hors scope C1).
3. **Outil / cwd.** Outil = dernière part tool `running`, sinon `unknown`. cwd = directory de session observé, sinon `unknown`. Jamais un chemin inventé.
4. **Interrupt.** Bouton visible seulement si Running → `session.interrupt`. Absent si Idle. Pas de dialogue « simulation » (Interrupt est réel).
5. **Pack lisible.** `GET` HttpApi session (ex. `/api/session/:id/pack`) qui assemble à la volée via Core (`ContextPack.assemble`) : worktree, mandat, pathset/omitted si candidats connus, tokens `TaskMetrics` (`unknown` si pas de request). App n’importe jamais Core. `bun run generate` obligatoire.
6. **Inspecteur.** Flottant show/hide depuis le bandeau. Onglets **Contexte** (pathset, omitted, tokens before/after, résumé mandat) et **Coût** (tokens/cost `TaskMetrics` session ou sprint-task ; `unknown` si `cost: 0` publié / absent). Interdit : afficher `0` ou `$0.00` faute de mesure. Hors onglets : Git, Serveurs, Permissions (DA10-009 / DA40-019 / DA30-014).
7. **Honnêteté.** Réutiliser les états `measured | estimated | partial | unknown`. Ne pas brancher l’inspecteur sur `SessionContextUsage` / `session.cost`. Un pack vide de pathset n’est pas un dump repo.
8. **Tests.** HTTP : pack `unknown` sans value ; path hors worktree → omitted. App : bandeau idle vs running, Interrupt appelé seulement running, tokens `unknown` ≠ `"0"`. Typecheck schema / opencode / app + generate. Smoke : session liée, bandeau, inspecteur, Interrupt idle absent.

## Hors périmètre (confirmé)

Chrome 0.3 (rail, terminal, secondaire). `$` honnêtes DA30-014. EventManifest `drain.ended`. Persister le pack dans le runner. `TaskExecution.resume`. Push/merge/staging.

## Pathset probable

- Schema : contrat lecture pack (réemploi `ContextPack.Pack`) + éventuellement vue bandeau
- Protocol / handlers `session` + tests HTTP
- Client généré (pas d’édition `src/generated`)
- App : bandeau, inspecteur, i18n `en.ts`, tests
- APEX `blocs/` + smoke/verify

## Risques

- Runner actuel → pack pauvre (pathset vide, tokens unknown) : **C1 accepte unknown**, pas un estimateur UI second.
- `session.cost === 0` aujourd’hui : traiter comme non mesuré → `unknown`.
- Generate SDK après HttpApi.
- Ne pas coller le bandeau au cockpit fixtures Sprint 4.

## Décisions ouvertes

Aucune métier. À valider : les 8 décisions ci-dessus.
