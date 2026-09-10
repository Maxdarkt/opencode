# STATE — DA40-006

- Phase : Correctif B05, Smoke et Verify terminés ; handoff review prêt.
- Statut MT : review, mis à jour puis relu le 2026-09-06 (requêtes `79a36f87-5973-45fc-a431-079a47a202b8` et `87416009-4e04-467a-bc42-9483948ad03d`).
- Sprint : `da-release-0.1-sprint-1` (`a3fac11a-49ed-455f-9d7c-dcd213467b6a`).
- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/40-tooling` ; branche `40-tooling`.
- Modèle effectif : `gpt-5.6-terra`, effort `medium`, vérifié par le parent avant le Build initial.
- Build terminé avant correction : B01 façade/configuration, B02 commandes déléguées, B03 convention/fichiers locaux et B04 préflight enfant sont documentés sous `blocs/`.
- Correctif B05 : terminé, preuve dans `blocs/B05.md`. `dev` possède les PID directs Bun/Vite via `exec`, détecte la fin de l'un, arrête/reap le survivant; `dev-app` et `dev-server` restent indépendants.
- Preuves initiales conservées : format/typecheck app+opencode, dry-runs, guards de configuration, ignores et `git diff --check` verts. Lint global baseline rouge (4902 warnings, 1 error) : dette hors scope dans `debts.md`.
- Smoke B05 : parsing shell, expansion structurelle, préflight, dry-run, absence de listeners, format et `git diff --check` verts, sans lancement de service.
- Prochaine action exacte : parent exécute la revue finale, puis décide du commit local borné et de la clôture métier; aucun commit ni clôture enfant.
- Synchronisation : `PLAN-GENERAL.md`, `sprint.md`, documents globaux sprint/release et registre runtime laissés intacts; aucun commit, push, merge, rebase, promotion ou suppression.
