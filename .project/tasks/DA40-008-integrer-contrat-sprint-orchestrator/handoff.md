# Handoff — DA40-008

## Résultat livré

Le skill global
[`SKILL.md`](/Users/leanbot/.codex/skills/sprint-orchestrator/SKILL.md) charge le contexte dans un
ordre ciblé, exige un `model` et un `thinking` explicites, atteste l'observé avant Build et impose un
suivi parent compact. La ressource conditionnelle
[`durable-checkpoints-and-routing.md`](/Users/leanbot/.codex/skills/sprint-orchestrator/references/durable-checkpoints-and-routing.md)
définit checkpoint, fraîcheur, reprise sûre et grille Luna/Terra/Sol/Astra.
La ressource conditionnelle `project-bootstrap.md` explique comment un projet adopte le contrat sans
importer de chemins, identifiants ou conventions d'un autre projet.

## Preuves

- Analyse, plan et trois blocs : `analyze.md`, `plan.md`, `blocs/`.
- Recette et limites du validateur : `smoke-report.md`.
- Dette : `debts.md` — aucune dette in-scope.
- Correctif C01 : profil minimal, autorités, classification, adoption incrémentale et validations de
  compatibilité; preuve dans `blocs/C01-project-bootstrap.md`.
- MT : DA40-008 relue `review` (`4ec4b653-70c1-43e7-bab0-d0418da60c91`).

## État et limites

- Worktree : `40-tooling`, HEAD observé `b7111b6e973d7200e70990c6f32a1a4d4b4a64de`.
- Baseline sale héritée préservée; aucun commit, push, merge, rebase, promotion, sprint, chat ou
  mutation produit effectué.
- L'invocation directe de `quick_validate.py` reste limitée par l'absence préexistante de `PyYAML`;
  son contrôle a passé avec un chargeur éphémère, sans installation.
- Le guide d'onboarding est portable : sa vérification absent/partiel/complet est locale et ne crée
  ni projet réel, ni sprint, ni carte ou chat.

## Pass B parent

Pas de visual smoke UI : le livrable est Markdown. La revue parent peut vérifier, sans lancer de
sprint, que la référence conditionnelle n'est demandée qu'au lancement/checkpoint/reprise et que les
clauses d'autorité, worktree, permissions, visual smoke parent et archivage sont toujours présentes.
Pour C01, vérifier également que l'onboarding ne se charge que sur une demande d'initialisation ou de
mise à niveau et qu'il garde global/projet, canonique/projection et adoption non destructive séparés.

## Entrée corrective

En cas de défaut, le parent remet MT `review → in_progress`, documente le défaut dans `STATE.md`,
demande un bloc correctif borné, puis exige les checks affectés et une nouvelle transition vers
`review`. Ne pas passer directement `done` depuis l'enfant.
