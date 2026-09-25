# Plan — DA40-008

Validation de poursuite : autonome le 2026-09-07, mandat enfant et attestation parent
`gpt-5.6-terra` / `high`. La portée et les permissions restent inchangées.

## Contrat de sortie

Un parent peut lancer chaque enfant avec `model` et `thinking` explicites, prouver le modèle observé
avant Build, et reconstruire la coordination depuis un checkpoint Markdown compact plutôt que le
transcript. Il charge seulement les autorités nécessaires, détecte un checkpoint périmé et poursuit
avec une seule prochaine action sans rejouer une mutation inconnue. Les garanties existantes restent
intactes.

## Blocs bornés

1. **B01 — Entrée et lancement.** Mettre à jour `SKILL.md` avec la sélection du modèle, l'attestation
   pré-Build, l'ordre de chargement ciblé et le point de décision parent compact.
2. **B02 — Contrat de reprise.** Ajouter une ressource conditionnelle liée au contrat avec la grille
   de difficulté, le contenu/fraîcheur du checkpoint, la reprise sûre et le suivi compact; conserver
   les autorités, permissions, worktrees et archivage établis.
3. **B03 — Vérification documentaire.** Exécuter `quick_validate.py`, vérifier liens/ressources,
   simuler lancement, divergence et reprise sans effet externe, puis comparer les invariants avant/après.

## Smoke technique

- Simulation locale : lancement standard → choix Terra/high justifié → attestation avant Build;
  inventaire mécanique → Luna; migration/incident prouvé → Sol; Astra seulement après preuve
  exceptionnelle.
- Simulation de reprise : checkpoint `fresh` charge les sources minimales; checkpoint divergent
  devient `stale`, les autorités sont relues et aucune mutation inconnue n'est rejouée.
- Inspection des clauses préexistantes : cache reconstructible, autorité MT/APEX/Git, un propriétaire
  par worktree, smoke visuel parent, aucun push/merge/rebase/promotion/suppression et archivage
  explicite.

## Limites

Les checks sont documentaire et locaux. Aucune tâche, carte, sprint, chat ou runtime de sprint ne
sera créé pour les simulations; aucune projection parent ne sera mise à jour par l'enfant.

## Correctif C01 — onboarding projet

Décision parent du 2026-09-07 : conserver le skill global léger et créer une référence conditionnelle
portable qui explique comment amener un autre projet au profil de mémoire durable. Le bloc vérifie
la séparation global/projet, le profil minimal, les autorités, la classification absent/partiel/complet,
l'adoption incrémentale et les preuves de compatibilité. Il ne migre ni ne crée un projet réel.
