# Handoff parent — DA40-007

## Résultat

Livrable documentaire prêt pour revue : l’architecture distingue le monorepo OpenCode amont, la candidate locale réellement observée (`packages/app` Vite → `packages/opencode` HTTP) et la cible Daidalon. Elle répond aux questions backend/BDD et conclut que le local suffit pour Sprint 1 mono-utilisateur ; elle définit les critères et impacts avant toute centralisation.

## Fichiers

- `docs/product/architecture.md` — document durable, carte des modules, flux Mermaid, tables/chemins SQLite/XDG/JSON, réponses et matrice de décision ;
- `docs/product/conception.md` — lien stable vers l’architecture auditée ;
- `.project/tasks/DA40-007-audit-architecture-application/analyze.md`, `plan.md`, `blocs/A01-analyze.md`, `blocs/P01-plan.md`, `blocs/B01.md`, `blocs/B02.md`, `blocs/B03.md`, `smoke-report.md`, `debts.md`, `STATE.md` — mémoire APEX complète.

## Preuves

- MT : `DA40-007 todo → in_progress` relu ; passage `in_progress → review` à relire après l’appel de transition final.
- Modèle observé : `gpt-5.6-luna`, conforme au prévu ; aucun arrêt pour divergence.
- Checks : migration check exit 0, typechecks app/core/opencode exit 0, liens/fences/diff checks PASS.
- Technique : DA40-003 prouve historiquement health/UI 200, PID/cwd/ports 4140/4440 ; tentative actuelle échoue car les serveurs ne sont plus actifs. Aucun restart enfant.

## Limites et relecture parent

- Revoir les assertions cloud versus local ; ne pas rattacher PlanetScale/Athena/SST à la BDD des sessions locales.
- Revoir le graphe Mermaid et le lien depuis la conception.
- Si une preuve live est requise, lancer la procédure parent dédiée et consigner les nouveaux PID/cwd/ports ; ne pas prétendre que le smoke enfant actuel est live.
- Ne pas passer `done` depuis l’enfant. Le parent réceptionne, commite éventuellement les seuls chemins exacts et clôture selon la routine Sprint.

## Interdits respectés

Aucun nouveau backend, BDD, schéma, migration, dépendance ou protocole ; aucun document global de sprint/plan ni registre runtime modifié ; aucun commit, push, merge, rebase, promotion, arrêt/redémarrage de serveur ou suppression.
