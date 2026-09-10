# Analyze — DA40-003
Mandat de démarrage reçu le 2026-09-06 ; gate autonome validée dans scope.
Objectif : dépendances verrouillées, runtime identifié, baseline ciblée et recette parent.
HEAD 702bf7dcd7468638c17fd95b110deb38bd253e9a, branche 40-tooling, index vide. Héritage empreinté dans evidence/initial-dirty.json avant toute édition.
macOS 15.5 arm64 ; Bun global 1.3.9 contre packageManager 1.3.14. Backend existant PID 20357 sur 4096 à préserver. UI locale séparée nécessaire : dev web distant ne sert pas packages/app.
Installation frozen-lockfile autorisée. Éviter prepare/husky qui peut modifier la configuration Git partagée : installation --ignore-scripts puis scripts natifs explicitement inspectés si nécessaires. Bun exact privé au worktree. Aucun changement produit/public API prévu.
Checks ciblés : app worktree/server-health/directory-picker-domain ; llm endpoint ; core sélection après lecture des fixtures. Typecheck des paquets concernés pour baseline, échecs existants conservés.
Risques : disponibilité de Bun exact et artefacts verrouillés, modules natifs, initialisation de données/config utilisateur. Isoler XDG et désactiver téléchargements/plugins externes au lancement. Aucun appel modèle.
Recette interbranches : chaque client/backend possède un manifest et ports dédiés ; aucun parcours intégré revendiqué avant candidate assemblée explicitement autorisée par parent.
Aucune décision métier restante. Échec d’installation non corrigeable sans changement lockfile => NO-GO au parent.
