# Scope — DA40-008

## Titre et objectif

Intégrer les checkpoints compacts et le routage modèle dans `sprint-orchestrator`, en conservant les optimisations déjà présentes. Le skill doit orchestrer un sprint depuis une mémoire Markdown reconstruisible, limiter le contexte chargé et choisir explicitement Luna, Terra, Sol ou Astra selon la difficulté démontrée.

## Contexte mesuré

- DA40-005 a validé le contrat d'autorités, la reprise par checkpoint, le journal de réconciliation et la grille de modèles.
- Le skill actuel possède déjà un cache runtime reconstruisible, un contrat d'orchestration et des checkpoints par phase, mais il ne fixe pas encore explicitement `model` et `thinking`, n'atteste pas le modèle observé avant Build et ne formalise pas le budget de contexte.
- Le skill est installé dans `/Users/leanbot/.codex/skills/sprint-orchestrator`; le travail doit préserver ses ressources et son invocation actuelle.

## Inclus

- Revue du skill actuel et des ressources liées.
- Intégration concise du checkpoint Markdown compact, de l'ordre de chargement du contexte et des règles de fraîcheur.
- Routage déterministe Luna → Terra → Sol → Astra, avec motif et attestation avant Build.
- Règles d'économie de tokens pour les suivis, reprises et rapports de décision.
- Validation `quick_validate.py` et scénario comportemental ciblé sans effet externe.

## Exclus

- Modification du produit Daidalon, de MT Tasks ou de son connecteur.
- Création/activation d'un sprint, migration des documents projet ou changement de modèle par défaut global.
- Réécriture complète du skill ou suppression de règles existantes.

## Acceptation

1. Le skill persiste l'état nécessaire dans un checkpoint Markdown compact et rechargeable après perte de contexte.
2. Chaque tâche enfant reçoit modèle et effort explicites ; le modèle observé est attesté avant Build.
3. Luna/Terra/Sol/Astra sont routés selon une difficulté prouvée, sans Astra par défaut.
4. Le suivi utilise des lectures ciblées et des snapshots compacts, avec point parent `objectif / réalisé / décision en attente`.
5. La validation du skill passe et une comparaison montre que les optimisations existantes sont conservées.

## Surfaces, risques et validation

- Surface : `/Users/leanbot/.codex/skills/sprint-orchestrator/SKILL.md` et, seulement si nécessaire, ses références/schémas.
- Risque principal : gonfler le skill ou contredire les permissions existantes ; appliquer `skill-creator` et garder les détails conditionnels dans les références.
- Validation : quick validator, inspection des liens, simulation locale de lancement/reprise sans créer de carte, chat ou sprint.

## Dépendances

- Entrée : DA40-005 archivée et ses livrables.
- Sortie : DA40-009 utilisera le contrat final. Exécution exclusive sur le worktree 40 ; aucun autre écrivain simultané.
