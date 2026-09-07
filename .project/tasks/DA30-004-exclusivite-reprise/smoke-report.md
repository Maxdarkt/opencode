# Smoke report — DA30-004

## Smoke technique enfant

### Environnement et préconditions

- Worktree `/Users/leanbot/Documents/40_Daidalon/features/s2-30-ownership`, branche
  `execution-ownership`, DA20-003 intégrée au commit local
  `eceeb7dd7734f60491e09cdac72fa297993f4c4b`.
- Bun `1.3.9`; installation `bun install --frozen-lockfile`, `bun.lock` inchangé.
- Base SQLite isolée du harness Core; aucun serveur, compte, fournisseur LLM ou mutation Git requis.

### Parcours exercé

Le smoke crée un projet, une session et un `TaskBinding`, puis :

1. acquiert le premier jeton `owner-a/generation=1` et rejoue exactement cette acquisition;
2. lance deux acquisitions concurrentes avec des propriétaires différents et observe un seul
   gagnant ainsi qu'une seule ligne persistée;
3. refuse un second task/session sur le même worktree et un binding au HEAD divergent;
4. admet un effet `pending`, refuse son rejeu incertain, puis le confirme idempotemment;
5. simule l'interruption après `begin` et refuse la reprise sans preuve ou avec preuve `uncertain`;
6. réconcilie atomiquement deux effets, l'un `confirmed` et l'autre `absent`, transfère la propriété
   à `owner-b/generation=2`, puis refuse l'ancien jeton;
7. refuse binding, identité de jeton et preuves dupliquées/superflues sans mutation partielle.

### Résultats

- Tests ciblés Core (`task-execution`, `task-binding`, `local-context`, `database-migration`) :
  PASS, 44 tests / 176 assertions.
- Suite Core complète : PASS, 1122 tests / 3138 assertions sur 147 fichiers.
- Typechecks Schema et Core : PASS.
- Migration check : PASS; aucun changement incrémental non capturé.
- Oxlint ciblé : PASS, 0 warning / 0 erreur; Prettier ciblé et `git diff --check` : PASS.
- Suite Schema : 13 PASS / 2 FAIL, les deux rouges `event-manifest` préexistants documentés dans
  `problems.md`.

## Limites

- Le jeton fence les appels passant par `TaskExecution`; il ne transforme pas automatiquement tout
  outil arbitraire en effet protégé.
- L'observation `confirmed|absent|uncertain` vient de l'appelant; le service n'invente ni sonde
  externe ni réparation Git.
- Aucun TTL, vol silencieux, consensus, multi-hôte, route HTTP ou UI n'est livré ici.

## Plan de smoke visuel parent

- **Environnement** : candidate Sprint 2 intégrant DA20-003, DA30-004 et DA10-003; runtime local
  sur base de test neuve, sans compte externe.
- **Préconditions/fixtures** : projet Git et worktree liés, carte MT/APEX/session cohérente, HEAD
  attendu, `owner-a/generation=1`; fixtures avec effet confirmé, effet pending interrompu et second
  propriétaire concurrent.
- **Route/action** : ouvrir le contexte actif DA10-003; afficher le propriétaire/génération et les
  effets. Tenter une acquisition `owner-b`, reprendre successivement avec observations confirmée,
  absente et incertaine, puis tenter une action avec l'ancien jeton.
- **Viewport** : desktop `1440×900`, puis `1024×768` si le contexte actif est responsive.
- **Attendus** : contexte exact visible; conflit concurrent bloqué avant action; `confirmed` n'est
  pas rejoué, `absent` redevient exécutable, `uncertain` reste bloqué; génération incrémentée et
  ancien propriétaire refusé; aucune mutation métier ou Git sur les refus.
- **Régressions** : binding/HEAD/worktree divergent, session supprimée, rechargement de page entre
  `begin` et `confirm`, double clic/requête concurrente, absence de preuve, preuve dupliquée.
- **Preuves à capturer** : captures contexte initial/conflit/reprise, traces API avec erreur et
  champs divergents, snapshot ownership/effets avant-après, HEAD/commit de la candidate.

## Reprise/correction

En cas d'échec parent, remettre DA30-004 en `in_progress`, relire `STATE.md` et le snapshot fautif,
puis rouvrir un bloc borné dans `packages/core/src/task-execution.ts` et
`packages/core/test/task-execution.test.ts`. Une demande UI reste dans DA10-003; une demande
multi-hôte exige un nouveau scope.
