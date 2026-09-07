# Réconciliation de la carte héritée OC-0003

Le 2026-09-07, la carte `OC-0003 — Documenter le raccordement MT Tasks du projet OpenCode Runtime` était encore `todo` dans le projet MT `DA`, sans worktree et sans dossier APEX local, alors que son objectif était déjà réalisé et documenté.

Preuves relues : `.project/apex.json` route le suivi vers `DA`, les domaines `10/20/30/40` sont actifs, `AGENTS.md` et `docs/product/roadmap.md` décrivent le raccordement, et les cycles M0/Sprint 1 ont exercé le connecteur jusqu'à la clôture et l'archivage.

Réconciliation MT : rattachement à `40-tooling` (`8d29e293-3bd0-46e9-8eb3-116e6aecdddb`), clôture (`2f65a787-4657-4a85-aa92-6b35c9349b3a`), puis archivage (`2291d6d4-6413-4792-bac6-954d0deedec2`). Aucun dossier APEX artificiel n'a été créé après coup.
