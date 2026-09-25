# C01 — Onboarding portable de projet

Statut : terminé le 2026-09-07.

## Réalisation

Ajout de
`/Users/leanbot/.codex/skills/sprint-orchestrator/references/project-bootstrap.md` et d'un unique
routage conditionnel depuis `SKILL.md`. Le document différencie explicitement les règles globales du
skill et les fichiers détenus par un projet. Il décrit le profil minimal, les autorités MT/APEX/Git,
la racine canonique et les projections multi-worktree read-only, puis la classification
absent/partiel/complet.

L'adoption reste une tâche APEX tracée, non destructive et incrémentale : inventaire, propriétaire,
réconciliation, ajout/liens et validations de reprise à froid, fraîcheur, archive retrouvable et
attestation de modèle. Il ne lance pas de sprint ni ne reprend des valeurs locales comme universelles.

## Vérification

`Skill is valid!`; `PASS links=4 classifications=absent,partial,complete`; recherche de portabilité
PASS. Détails dans `../smoke-report.md`.

## Préservation

Les ressources de checkpoint/routage et le contrat principal restent inchangés. Le nouvel onboarding
ne s'applique pas au sprint ordinaire et ne modifie ni permissions, ni statut ownership, ni Git,
ni worktree, ni smoke parent, ni archivage.
