# Plan — DA30-003
Gate Plan autonome validée le 2026-09-06 selon mandat et sprint-child-handoff.

B01 — Manifest et parcours : lecture des routes UI/serveur V1, contraste V2, empreintes des sources, observation GET/provenance de l’instance DA40-003 sans mutation. Livrables manifest.json et diagnostic-runtime.md.
B02 — Contrôles et contrat : matrice admission/fichiers/shell/PTY/descendants/outils tiers, capacités MT, garde de lancement et reprise refusant la quiescence inconnue. Livrables controles-placement.md et contrat-sprint-2.md. Aucun lease implémenté.
B03 — Vérification : installer les dépendances frozen sans scripts dans ce worktree avec Bun 1.3.14, tests existants ciblés de compatibilité client, admission/coordinator et chemins/outils ; typecheck Core si exécutable. Environnement allowlist isolé, RECORD=false. Livrer evidence/checks.json, smoke-report.md, runbook.md, debts.md et handoff.md.

Chaque bloc produit blocs/B0N.md et checkpoint STATE. Pas de serveur neuf requis : tests de fixtures locaux et lecture de l’instance identifiée 40 sont distingués. Aucun prompt live ni fournisseur. Pass B parent : inspection route et preuves, sans jugement visuel enfant. Passage review après checks et limites documentés ; parent seul done/archived et synchronisation canonique. Aucun commit.
