# Procédure promotion Sprint 7 — journal (non exécutée ici)

Mandat destructif **différé**. Ce fichier est une checklist. Aucune commande Git externe pendant DA20-006 Build.

## Préconditions

- MT : cartes Sprint 7 clôturées / archivées selon `suivi-sprints.md`.
- Checkout source `Daidalon/` sur `staging` : **propre** (`git status` vide, `git diff --check`).
  Si sale (docs sprint non commitées) : versionner d’abord cet état **sur staging**, hors candidate.
- Candidate : branche `candidate-merge`, worktree
  `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA20-006`, SHA Verify `1292aafe9`.
- Confirmation user explicite (ex. « promeus maintenant »). Pas de bouton cockpit.

## Séquence (après confirmation)

1. Relire candidate : propre, ancêtres DA10-011 `da8c68597` + DA40-019 `d2fb5ea0f`, checks Verify PASS.
2. Sur le checkout `staging` propre : `git merge 1292aafe9` (uniquement cette candidate). Stop au premier conflit non trivial.
3. `git push origin staging`. Créer le remote si absent. Cible **staging seulement**. Jamais `dev` / `develop` / `main` / `master`. Jamais `--force`.
4. `git worktree remove` seulement si **propre** :
   - `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA10-011`
   - `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA40-019`
   - `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA20-006`
   Branches locales conservées. Métier / `s2` / `s3` intouchés.
5. Preview `develop` / prod `master` : facultatif, mandat séparé.

## Interdit

Force-push. Merge implicite depuis le cockpit. `Git.worktree.remove` SDK pour les cartes Daidalon. Nettoyage d’un worktree sale.
