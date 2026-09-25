# Smoke report — DA40-009

Date : 2026-09-07. Type : recette documentaire et de coordination; aucune UI,
aucun runtime produit, sprint, connecteur MT, commit ou action Git sensible.

| Scénario | Méthode | Résultat |
|---|---|---|
| Canon et modèles | existence des cinq modèles v1, décision et protocole | PASS |
| Projections | SHA-256 des dix copies + registre `canonical_ref`/date/revision/fraîcheur | PASS; divergence initiale détectée puis réconciliée sans écriture |
| Reprise à froid | règles → checkpoint → MT → STATE → journal, sans transcript | PASS |
| Timeout MT | procédure de non-rejeu et journal idempotent | PASS documentaire |
| Archive masquée | index, external_ref et liste MT `archived` ciblée | PASS réel, DA40-005/008 retrouvées |
| Hygiène diff | `git diff --check` dans les deux dépôts | PASS |

## Pass B / smoke visuel parent

Non requis : le livrable est Markdown et ne possède ni écran, route, viewport,
fixture ni compte. Le parent peut relire décision, registre, checkpoint et routine.
Les bords de régression sont l'autorité MT/APEX/Git, la fraîcheur des projections,
l'absence de suppression et les plans/sprints conservés.
