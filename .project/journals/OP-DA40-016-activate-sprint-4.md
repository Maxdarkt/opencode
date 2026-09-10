# Journal — OP-DA40-016-activate-sprint-4

- Target: Sprint MT `5059b73b-d8e8-40db-b9d5-1cbfb5c6424e` / `da-release-0.1-sprint-4`.
- Started: `2026-09-10T06:03:25+02:00`.
- Authority: validation explicite de l'utilisateur « ok go. je valide ce sprint » le `2026-09-10`; périmètre Sprint 4 validé, hors push/tag/déploiement, opérations Git destructives et Build sur staging.
- Preconditions: MT relu `planning`, six cartes `todo`, 29 SP, aucun sprint DA `active`; STATE parent génération 2 et runtime v2 génération 2 relus. Candidate Sprint 3 propre à `57da5e0d156c1b6f73c2c4528b502d6b764d9891`.
- Intended effect: activer atomiquement ce Sprint MT exact, sans changer ses cartes ni allouer un enfant.
- Allocation constraint discovered: le registre commun ne contient pas DA et `validate-apex-profile.mjs` refuse le profil `mtProject: DA`; aucun worktree Sprint 4 n'existe. Cette divergence interdit pour l'instant la création tracked d'un enfant ou d'un worktree dédié.
- Observed effect: activation MT réussie (`request_id` `d68e49d4-26c4-4640-9944-a6448c4d7f46`) ; relecture du Sprint à `2026-09-10T06:03:47+02:00` : `active`, six cartes toujours `todo`, 29 SP et aucune mutation de membership.
- Status: `reconciled`.
- Next action: démarrer le suivi parent DA40-016 ; ne pas lancer DA30-009 tant que le routage registre/profil n'est pas réconcilié.
