# Smoke documentaire et technique — DA40-007

Date : 2026-09-06. Aucun serveur n’a été démarré, redémarré ou arrêté par cette tâche.

## Pass A — documentation et cohérence statique

| Contrôle | Résultat | Preuve |
|---|---|---|
| Architecture présente et tokens requis | PASS | Script Bun : `packages/app`, `packages/opencode`, `SQLite`, `Drizzle`, `Global.Path`, `Server.listen`, tables/session, backend/BDD distant |
| Mermaid | PASS | 1 bloc `mermaid`, 41 lignes de graphe, 4 lignes de clôture de fences |
| Liens produit | PASS | `docs/product/conception.md` → `./architecture.md` ; quatre cibles `docs/product/*` présentes |
| `git diff --check` | PASS | aucune erreur d’espace/diff sur fichiers suivis |
| Diff du document non suivi | PASS | `git diff --no-index --check /dev/null docs/product/architecture.md` sans erreur |
| Schéma/migrations Drizzle | PASS | `cd packages/core && bun run script/migration.ts --check` : `No schema changes, nothing to migrate` ; schéma complet généré |
| Typecheck app | PASS | `cd packages/app && bun run typecheck` → exit 0 |
| Typecheck core | PASS | `cd packages/core && bun run typecheck` → exit 0 |
| Typecheck opencode | PASS | `cd packages/opencode && bun run typecheck` → exit 0 |

Le runtime Bun visible dans le shell est `1.3.9`, alors que le manifest déclare `bun@1.3.14`. Les trois typechecks et le check de migration passent néanmoins ; l’empreinte de référence DA40-003 avec Bun privé `1.3.14` est conservée comme preuve de baseline. Aucun lockfile n’a été modifié.

## Pass B — endpoint local

Tentative en lecture seule le 2026-09-06 :

- `curl http://127.0.0.1:4140/global/health` : échec connexion, port non à l’écoute ;
- `curl http://127.0.0.1:4440/` : échec connexion, port non à l’écoute ;
- `ps`/`lsof` : PID 27514/27515/27516 et listeners absents au moment de la tentative.

Cette indisponibilité ne signale pas un défaut documentaire et n’autorise pas un redémarrage enfant. La preuve technique antérieure reste consultable dans DA40-003 : `evidence/http-smoke.json` établit health/UI/entry HTTP 200, `evidence/health.response` établit `{"healthy":true,"version":"local"}`, et `evidence/listeners.txt`/`process-cwd.txt` établissent les ports, PID et cwd de la candidate alors active.

## Verdict

**PASS documentaire et checks ; smoke HTTP actuel non rejouable car l’instance n’est plus active.** Aucun défaut in-scope ni aucune correction produit requis. Le parent peut effectuer une relecture statique et, s’il réactive une instance selon sa propre procédure, un smoke visuel/HTTP séparé ; cette action n’est pas incluse dans le handoff enfant.
