# Dettes et limites
Aucune dette corrective connue dans le périmètre après checks.

D1 — faible, qualification multiplateforme non faite. Preuve : fixtures réelles exécutées sur macOS arm64/Bun 1.3.14 ; aucun Windows/Linux live. Impact : permissions et conventions de chemins restent à qualifier sur ces hôtes. Propriétaire : parent/DA20 lors de l’extension des plateformes. Décision : conserver comme limite acceptée de la recette locale ; réouverture avant revendication de support testée sur un autre hôte.

Limites de conception hors scope : observation non atomique et pas de lease/fencing ; qualification des sessions avec workspace conservée unknown ; aucun rebind ni protection universelle des outils. Ces limites sont explicites dans le contrat et ne sont pas masquées par MT ou TTL. Propriétaire Sprint 2 selon cadrage DA30. L’intégration UI DA10 est la dépendance prévue, pas un parcours intégré déjà validé.
