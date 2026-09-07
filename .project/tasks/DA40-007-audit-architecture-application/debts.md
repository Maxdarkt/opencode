# Dettes et limites — DA40-007

## D1 — Smoke HTTP courant indisponible (moyenne)

- Impact : impossible de rejouer aujourd’hui les GET health/UI sans relancer une instance.
- Preuve : `smoke-report.md`, curl refusé sur `4140` et `4440`, absence des PID/listeners.
- Décision : ne pas redémarrer dans le chat enfant ; réutiliser la preuve DA40-003 et laisser le parent choisir une nouvelle recette.
- Propriétaire : parent DA40-004 / réception Sprint 1.
- Réouverture : avant clôture Sprint 1 si la candidate doit être requalifiée sur une instance active.

## D2 — Renderer Mermaid dédié non identifié (faible)

- Impact : le graphe est validé structurellement et relu comme texte, mais aucun rendu graphique autonome du dépôt n’est attaché.
- Preuve : bloc Mermaid unique, fences équilibrées, vérification de présence ; aucun outil Mermaid déclaré par les manifests consultés.
- Décision : suffisant pour l’audit documentaire ; relecture visuelle parent recommandée.
- Propriétaire : parent pour le smoke visuel.
- Réouverture : si le rendu UI/documentation est une condition d’acceptation distincte.

## D3 — Modèle Daidalon non matérialisé dans le schéma (haute, hors scope)

- Impact : aucune table native MT Task/APEX/lease/génération écrivain n’est présente dans la BDD actuelle ; les liens cible restent documentaires.
- Preuve : tables Drizzle inventoriées dans `architecture.md` et `packages/core/src/database/schema.gen.ts`.
- Décision : ne pas implémenter ni migrer dans DA40-007 ; proposer des scopes APEX conditionnels dans `architecture.md`.
- Propriétaire : produit/parent, après décision explicite sur la cible.
- Réouverture : déclencheur multi-tâche/worktree ou besoin de rattachement durable accepté.

## D4 — Version Bun du shell courant (faible)

- Impact : le shell expose Bun 1.3.9 alors que le manifest exige 1.3.14 ; les checks passent, mais la reproductibilité exacte dépend de l’exécutable privé.
- Preuve : sortie `bun --version` du smoke ; manifest et baseline DA40-003.
- Décision : aucune installation ou lockfile touché ; conserver l’écart pour le parent.
- Propriétaire : tooling/DA40-006 ou parent de sprint.
- Réouverture : si un check échoue ou si une nouvelle candidate est mesurée hors Bun 1.3.14.

Aucune dette ne justifie une correction produit dans ce scope. Aucun backend, aucune BDD distante, aucune migration et aucune carte MT future n’a été créée.
