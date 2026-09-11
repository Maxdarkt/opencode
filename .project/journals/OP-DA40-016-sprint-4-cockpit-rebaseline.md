# OP-DA40-016 — Rebaseliner Sprint 4 vers le cockpit

- Date : `2026-09-11`
- Mandat : validation utilisateur d'une maquette cliquable avant tout Build du cockpit réel ; priorité au tableau Sprint réel, ouverture des chats existants et confirmation explicite des actions d'exécution/Git.
- Objectif : ajouter le jalon UX séparé `DA10-006`, rendre le Sprint 4 cohérent avec cette validation, puis ne lancer que son Analyze dans un worktree dédié.

## Intention idempotente

1. La carte MT `DA10-006` a été créée dans `da-release-0.1-sprint-4` avec la référence provisoire `.project/tasks/sprint-cockpit-clickable-prototype` (requête `db725fd3-25f1-4cd2-9256-3b688d2bde8a`).
2. Matérialiser son dossier APEX sous `10-product-ui`, conserver la référence provisoire comme chemin canonique : le connecteur ne permet pas la mise à jour de `external_ref` (`EMPTY_PATCH`); relire la carte.
3. Réviser le briefing, le plan général, l'index Sprint et l'état parent : DA10-006 précède tout nouveau Build de DA20-004/DA10-005; DA30-009 reste une fondation code à recevoir séparément.
4. Ne pas étendre DA10-005, ne pas intégrer DA30-009, ne pas modifier de code produit sur staging, ni lancer de terminal/navigateur réel depuis la maquette.

## État et reprise

- Statut : `in_progress`.
- Preuve préflight : registre `DA` PASS, profil APEX tracked PASS; Sprint MT actif et carte DA10-006 créée.
- Suite : écrire scope/STATE, réconcilier MT + documents, relire; le lancement Analyze est une action séparée après ces preuves.
