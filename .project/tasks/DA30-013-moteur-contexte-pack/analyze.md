# Analyze — DA30-013 Packer le contexte

## Objectif, mandat et limites

Livrer le moteur de contexte C2, C3 et C5 dans le worktree
`/Users/leanbot/Documents/40_Daidalon/features/tasks/DA30-013`, branche
`context-pack`, base/HEAD `493f3aa31`. Un tour envoie un pack minimal borné au
worktree, compacte/prune avant overflow, et réutilise un préfixe cache-stable
(cwd, règles, outils). Preuve tokens avant/après ; `unknown` honnête, jamais un
faux zéro.

Hors périmètre : chrome mockup, Interrupt UI (DA10-008), bornes tours/budget
(DA30-012), adaptateurs d’abonnement. C1 (inspecteur visible) consommera le
contrat ; cette carte livre le moteur et le pack lisible, pas le bandeau.

## Évidence et point de départ

- OpenCode a déjà les briques. V1 `SessionCompaction` (`packages/opencode/src/session/compaction.ts`)
  prune les sorties d’outils au-delà de `PRUNE_PROTECT` (40k) si le gain dépasse
  `PRUNE_MINIMUM` (20k), tronque à 2k caractères, et compacte sur overflow.
  V2 Core (`packages/core/src/session/compaction.ts`) appelle `compactIfNeeded`
  **avant** `llm.stream` et résume l’historique trop long, mais **ne prune pas**
  les sorties d’outils persistées. `to-llm-message.ts` renvoie le contenu outil
  intégral. Un tour V2 peut donc recoller tout l’historique outil tant qu’aucune
  compaction n’a tourné.
- `SessionHistory` coupe déjà au dernier message `compaction` (sauf updates
  system postérieures). C’est la sélection d’historique, pas un pathset métier.
- `SystemContext` + builtins + `InstructionContext` forment le préfixe système :
  cwd, racine projet, date, fichiers `AGENTS.md` de `location.directory` jusqu’à
  `location.project.directory`. `Project.resolve` pose `project.directory` sur
  `repo.worktree` (`git rev-parse --show-toplevel`) : un checkout carte n’est
  pas le common dir. Le risque de fuite `staging` n’est pas le common dir Git,
  c’est d’ouvrir la session sur `staging` ou d’attacher des chemins hors cwd.
- Aucun contrat **pack** n’existe. `session.context` renvoie les messages, pas
  mandat / pathset / tokens avant envoi. `TaskMetrics` (DA30-007) donne déjà
  `measured | estimated | partial | unknown` sans zéro inventé — à réutiliser
  pour les tokens du pack, pas à dupliquer une autre honnêteté.
- C5 aujourd’hui : `promptCacheKey` = ID de session
  (`packages/core/src/session/runner/llm.ts`). Invariant cwd / règles / outils
  absent. La date est dans le baseline builtins : un nouveau jour change le
  préfixe et brûle le cache. Les outils sont après le système ; un préfixe
  instable en tête annule le prompt cache.

## Contrat retenu

1. **Pack (C2)** — objet métier, pas un dump de messages. Champs : mandat
   (system agent + dernier input utilisateur visible), `worktree` =
   `Location.directory`, `pathset` = chemins **relatifs** strictement contenus
   dans ce worktree (instructions observées, pièces jointes, fichiers cités par
   le mandat). Tout chemin qui sort du worktree (y compris `.../Daidalon`
   staging ou un sibling) est omis et nommé dans la provenance, jamais envoyé.
   Pas d’inclusion automatique de l’arbre fichier.
2. **Compaction (C3)** — politique V2 avant overflow : (a) prune / troncature
   des sorties d’outils anciennes sur le request live, calquée sur les seuils
   OpenCode V1 ; (b) `compactIfNeeded` inchangé dans son rôle (résumé ancré).
   Preuve : à mandat égal, tokens d’entrée **estimés** du request après prune
   < avant prune ; un tour post-compaction ne renvoie pas les messages avant le
   résumé.
3. **Cache (C5)** — préfixe stable = cwd + hash des règles (instructions
   rendues) + identité des outils matérialisés. `promptCacheKey` dérive de ce
   préfixe (pas seulement l’ID session). Sources volatiles (date) restent
   **après** le préfixe (update system), jamais en tête. Moins de tokens
   d’entrée à mandat égal = cache.read mesuré si le provider le donne, sinon
   `unknown` (pas `0`).
4. **Preuve tokens** — le pack expose `tokensBefore` / `tokensAfter` avec les
   états DA30-007. Absence de mesure → `unknown` sans `value`. Estimateur
   existant : `Token.estimate` (4 chars). Ne pas inventer un second estimateur
   UI.

## Régressions à protéger

- pathset contient un fichier hors worktree ou un chemin `staging` → omis ;
- session ouverte sur le worktree carte → builtins / instructions ne lisent
  que cet arbre ;
- prune sous les seuils V1 → aucune sortie outil effacée ;
- historique après compaction → pas de messages pré-résumé dans le request ;
- tokens absents → `unknown`, jamais `0` ;
- `promptCacheKey` identique si cwd + règles + outils inchangés ; change si
  l’un des trois change ;
- `session.context` (liste de messages) et `TaskMetrics` inchangés.

## Risques et décisions

- Ne pas attendre DA10-007 pour borner le pack : la borne est
  `Location.directory` de la session. Le binding chat↔worktree est une autre
  carte ; le moteur refuse déjà les chemins hors cwd.
- Ne pas porter le prune V1 dans le runtime V1 ; la politique métier s’applique
  au runner V2 (celui que Daidalon utilisera).
- Ne pas mettre la date dans la clé de cache. La garder visible via update
  system, derrière le préfixe stable.
- Pas d’UI inspecteur ici. Exposer le pack via Schema + assemblage Core + tests
  ; route HTTP seulement si le Plan la juge nécessaire pour DA10-008. Sinon
  fonction Core testable suffit.
- Aucune mutation `TaskExecution.resume`. Pas de Build sur staging.

## Entrée Plan

Borner des blocs : contrat Schema `ContextPack` ; assemblage Core (pathset,
tokens honnêtes, préfixe cache) ; prune/troncature V2 + clé cache dans le
runner ; tests `packages/core` (et OpenCode seulement si route HTTP). Checks :
`bun typecheck` + tests ciblés depuis le package, jamais la racine.
