# Plan — DA40-003
Gate autonome validée par mandat Sprint 1, après Analyze. Aucun changement produit.
1. B01 : préparer Bun 1.3.14 isolé et installer frozen-lockfile sans scripts implicites ; vérifier lockfile et héritage. Livrables evidence/install.log, manifest.json, blocs/B01.md.
2. B02 : exécuter baseline ciblée et typechecks depuis paquets, documenter résultats sans corriger hors scope. Livrables evidence/checks*, baseline.md, blocs/B02.md.
3. B03 : lancer backend/client isolés si dépendances disponibles, GET health et source locale, enregistrer PID/cwd/ports ; procédure rejouable et recette interbranches. Livrables runbook.md, manifest.json, blocs/B03.md.
4. Smoke/Verify : contrôler héritage et lockfile, preuves techniques ; smoke-report.md avec Pass B parent, debts.md, handoff.md et STATE ; MT review uniquement si preuves suffisantes.
Aucun restart existant, commit, Git sensible, appel fournisseur ni intégration implicite. Toute indisponibilité bloquante est documentée et transmise.
