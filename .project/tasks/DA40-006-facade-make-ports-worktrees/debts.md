# Debts — DA40-006

## D1 — Lint global amont rouge

- Sévérité : moyenne, hors scope.
- Impact : `make lint` délègue fidèlement à `bun run lint`, mais la baseline retourne exit 1 après `4902 warnings and 1 error` sur 3281 fichiers.
- Preuve : exécution du 2026-09-06, après `make format`; les changements DA40-006 sont exclusivement Make, configuration locale ignorée, documentation et artefacts APEX, sans fichier TypeScript/JavaScript de ces diagnostics.
- Propriétaire : maintenance amont / tâche dédiée.
- Décision : ne pas masquer ni modifier la configuration lint pour faire réussir cette carte.
- Condition de réouverture : une tâche de qualité mandatée pour isoler puis corriger l'erreur baseline.

Aucune autre dette de code dans le périmètre.
