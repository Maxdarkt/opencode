# Index global des archives Daidalon

Mis à jour : 2026-09-25. Plan vivant = aucun sprint actif (0.5 clos). Cet index est une
aide de retrouvabilité ; cartes MT et dossiers APEX restent en place. Aucun
archivage ne déplace ni ne supprime les preuves.

| Période / carte | Résultat | Dossier APEX stable | Bilan / trace | Chat ID | Visibilité |
|---|---|---|---|---|---|
| Sprint 8 | 4 cartes, 18 SP, candidate `cbdf61e67` | `.project/tasks/DA30-014-*` … `DA20-007-*` | `sprint-8/`, `docs/product/sprints/sprint-8.md` | parent Cursor `3668b277-3781-4430-afef-920874b35ada` | 014/015/020 archived ; 007 à archiver ; 020 worktree conservé (sale) |
| Sprint 7 | 4 cartes, 15 SP + 021, merge `4f1764b59` + `e9e2aed10` | `.project/tasks/DA40-019-*` … `DA40-021-*` | `sprint-7/`, `docs/product/sprints/sprint-7.md` | parent Cursor `3668b277-3781-4430-afef-920874b35ada` | 4 MT archived ; 4 worktrees `features/tasks/` S7 retirés |
| Sprint 6 | 3 cartes, 19 SP, merge `b7d70d3f8` | `.project/tasks/DA10-009-*` … `DA40-018-*` | `sprint-6/`, `docs/product/sprints/sprint-6.md` | parent Cursor `cc8b71bf-fc44-4c64-a875-c5806924b9fb` | 3 MT archived ; 3 worktrees `features/tasks/` S6 retirés |
| Sprint 5 | 5 cartes, 31 SP, merge `0014d62e1` | `.project/tasks/DA30-013-*` … `DA40-017-*` | `sprint-5/`, `docs/product/sprints/sprint-5.md` | parent Cursor sprint-support | 5 MT archived ; 4 worktrees propres retirés ; DA10-008 conservé tant que `bun.lock` sale |
| Sprint 4 | 7 cartes, 35 SP, merge `b3aa79245` | dossiers APEX dans le source et historiques | `sprint-4/`, `docs/product/sprints/sprint-4.md` | parent Cursor `30dae365-e035-4604-9113-53767fcb9c05` | 7 MT archived ; worktrees cartes retirés |
| Sprint 3 | 7 cartes, 34 SP acceptés, candidate `57da5e0d` | `.project/tasks/<id>` dans les worktrees 10/30/40 | `sprint-3/`, `docs/product/sprints/sprint-3.md` | parent `01a07d34-6e02-7a81-a3ed-0287a9ad3690`; six enfants dans le runtime | 7 MT/cards et chats archived après done |
| M0 | 6 cartes, 17 SP acceptés | `.project/tasks/<id>` dans leurs worktrees | `m0/`, `m0/archivage-preuves.json` | indexé dans la preuve | MT archived |
| Sprint 1 | 7 cartes, 26 SP acceptés | `.project/tasks/<id>` dans leurs worktrees | `sprint-1/`, `docs/product/sprints/sprint-1.md` | indexé dans runtime | MT archived |
| DA40-005 | protocole mémoire reçu | `features/40-tooling/.project/tasks/DA40-005-memoire-durable-markdown-mt` | `da40-005.md` | `01a07aca-658a-7092-90c4-dbf3e5bbb30d` | MT archived |
| DA40-008 | contrat orchestrateur reçu | `features/40-tooling/.project/tasks/DA40-008-integrer-contrat-sprint-orchestrator` | `da40-008.md` | `01a07ad6-8047-7311-9cf2-883c2ced3d20` | MT archived |
| DA40-009 | mémoire durable adoptée | `features/40-tooling/.project/tasks/DA40-009-adopter-memoire-durable-daidalon` | `da40-009.md` | `01a07ae1-9127-7833-96d7-30a75288785e` | MT archived |
| DA40-010 | baseline Sprint 1 assemblée et validée | `features/50-integration/.project/tasks/DA40-010-assembler-baseline-commune` | `da40-010.md` | `01a07b3f-d1eb-7400-b644-1af894277c0e` | MT archived |

## Carte archivée masquée

Si une liste MT active ne montre plus une carte, rechercher son `display_id` dans
cet index, ouvrir sa trace et son `external_ref`, puis relire MT par cible exacte.
Ne jamais conclure à une suppression depuis une liste filtrée, et ne pas recréer
de carte ou de dossier avant la réconciliation.
