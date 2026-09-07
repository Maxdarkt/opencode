# Plan — DA30-004

## Mandat et contrats

Le message parent du 2026-09-07, journalisé dans
`../../journals/OP-DA30-004-execution.md`, autorise ce plan complet : intégration exacte de DA20-003,
Analyze/Plan/Build, checks, smoke technique, commit local borné et transition MT jusqu'à `review`.
Le service doit appeler `TaskBinding.resume` avant toute acquisition/reprise, persister un jeton de
fencing monotone et ne jamais classer implicitement un effet interrompu comme absent.

## Périmètre fichiers

Cibles fonctionnelles :

- `packages/schema/src/task-execution.ts` et export public dans `packages/schema/src/index.ts` ;
- `packages/core/src/task-execution.ts` et `packages/core/src/task-execution/sql.ts` ;
- migration SQLite et artefacts générés par le script canonique ;
- `packages/core/test/task-execution.test.ts` ;
- preuves APEX DA30-004 et journal d'exécution.

Exclus : UI, serveur/HTTP, clustering, réparation Git, projections Sprint/release/plan, dette
`event-manifest` préexistante, code DA20-003 hors correction de régression strictement nécessaire.

## Blocs

### B1 — Contrat et ownership durable

- Ajouter le contrat Schema `TaskExecution` : identifiants propriétaire/effet, jeton de fencing,
  information d'ownership, décision de démarrage et résolution de reprise.
- Ajouter les tables ownership/effect avec FK vers `task_binding`, clés et index exacts.
- Implémenter `acquire` après `TaskBinding.resume`, rejeu exact et refus typé d'un autre propriétaire.
- Générer la migration canonique.
- Tests : acquisition/rejeu, binding absent/divergent, concurrence locale, absence de mutation sur
  conflit.

### B2 — Frontières d'effet et reprise

- Implémenter `begin`/`confirm` sous jeton courant.
- Implémenter `resume` transactionnel : résolutions complètes obligatoires, `uncertain` fail-closed,
  `confirmed` conservé, `absent` supprimé pour rejeu explicite, puis incrément de génération.
- Tests : effet confirmé idempotent, interruption après `begin`, trois résolutions, résolution
  manquante/superflue, ancien jeton fenced et aucun changement partiel sur erreur.

### B3 — Verify et handoff enfant

- Rejouer tests DA30 et DA20, migrations, typechecks Schema/Core, lint/format ciblés et
  `git diff --check`.
- Produire `smoke-report.md`, `verify.md`, `handoff.md` et `problems.md` avec contrat UI et plan de
  smoke parent complet.
- Inventorier le pathset exact, exclure les projections, créer le commit local conventionnel, relire
  le commit/dirty puis passer MT en `review`.

## Checks et smoke

- Depuis `packages/core` : tests ciblés DA30 + DA20 + migration DB, puis `bun typecheck`.
- Depuis `packages/schema` : `bun typecheck`.
- Depuis `packages/core` : `bun run script/migration.ts --check`.
- Format/lint ciblés selon les commandes du monorepo ; `git diff --check` sur le pathset.
- Smoke technique : base SQLite isolée, acquisition, conflit, interruption `pending`, reprise
  confirmée/absente/incertaine, fencing de l'ancien propriétaire.
- Smoke parent : candidate intégrant DA20/DA30/DA10, contexte exact visible, conflit sans mutation,
  reprise avec état explicite et captures/logs avant-après.

## Risques, corrections et arrêt

- Une contrainte SQLite/concurrence inattendue est corrigée dans B1 avec preuve transactionnelle.
- Une ambiguïté d'effet ne doit jamais être auto-résolue ; elle bloque la reprise et reste visible.
- Deux corrections bornées au même échec maximum avant révision du plan selon la politique APEX.
- Arrêt uniquement sur changement de contrat, conflit non mécanique, cible divergente ou échec
  hors périmètre empêchant les checks requis.

## Validation

Le scope, le contrat DA20-003 et le mandat parent déterminent tous les choix. Aucune décision
supplémentaire n'est ouverte ; le Plan est validé sous l'autorité Sprint et peut enchaîner Build,
Smoke et Verify.
