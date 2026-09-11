# OP-DA40-016 — Replanification après validation du cockpit

- Date : 2026-09-11
- Autorisation : l'utilisateur valide la maquette DA10-006 comme livraison de référence et demande
  de vérifier, créer et modifier les tâches APEX nécessaires pour atteindre le cockpit réel.
- Préflight : registre `DA` PASS sur la source `staging`; MT Sprint 4 relu actif. Les worktrees
  métier permanents sont sales avec des modifications non liées, donc leurs scopes existants ne
  sont pas édités directement.

## Changements de suivi

1. DA10-006 passe MT `review` : UX validée, smoke 1440×900/1024×768 et zéro requête hors origine
   Vite; elle attend seulement sa finalisation Git/APEX dans son worktree task-owned.
2. DA20-005 est créée en MT dans Sprint 4 (3 SP) avec le scope canonique
   `.project/tasks/DA20-005-topologie-git-lecture-seule-cockpit` : projection Git lecture seule
   séparée de l'ownership DA20-004.
3. DA10-005 devient « Cockpit Sprint réel en lecture seule » (8 SP); DA30-010 porte aussi les
   signaux d'attention/provenance; DA40-015 reçoit la recette cockpit A/B.
4. Le Sprint passe à 38 SP et son objectif exclut explicitement les actions Git/agent réelles.

## Reprise

- Les modifications de scope des cartes existantes sont portées par le briefing canonique Sprint
  et seront matérialisées dans leurs worktrees dédiés et propres à l'entrée en Analyze; ne pas
  écrire dans les worktrees métier sales.
- Séquence : finaliser DA10-006, puis DA20-004 → DA20-005 et DA30-010 → DA10-005 → DA40-015.
