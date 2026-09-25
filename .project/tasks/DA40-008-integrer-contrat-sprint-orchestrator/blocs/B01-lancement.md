# B01 — Entrée et lancement

Statut : terminé le 2026-09-07.

## Réalisation

`/Users/leanbot/.codex/skills/sprint-orchestrator/SKILL.md` charge désormais les sources dans l'ordre
utile à la prochaine action et ne charge archives/logs/chats que par preuve liée. Il oriente les
opérations de lancement, checkpoint et reprise vers la ressource conditionnelle. Chaque lancement
fixe `model` et `thinking`, consigne le motif et impose l'attestation du modèle observé avant Build.

## Invariants préservés

Le cache reste reconstruisible et non autoritatif; MT/APEX/Git gardent leurs autorités; un seul
propriétaire agit par worktree; le parent conserve le visual smoke et les règles Git/archivage ne
changent pas.

## Preuve et suite

Voir `../smoke-report.md` : validation de structure, liens et comparaison des clauses existantes.
Prochaine action exécutée : B02.
