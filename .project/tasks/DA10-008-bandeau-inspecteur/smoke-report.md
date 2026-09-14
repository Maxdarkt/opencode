# Smoke — DA10-008

- Status: PASS
- Surfaces: `http://127.0.0.1:4408` (App) + `http://127.0.0.1:4108` (serve)
- Session: `ses_f6413c169ffe46W6XugSEH3FNo`
- Worktree observé: `…/features/tasks/DA10-008`

## Idle

Bandeau : **Inactif**, outil `unknown`, cwd = worktree DA10-008.
**Interrupt absent**.

## Inspecteur

Toggle Contexte : worktree observé, pathset vide, jetons `unknown`.
Onglet Coût : jetons `unknown`, coût `unknown`. Pas de `$0.00` ni de faux zéro.

## Pack HTTP

`GET /api/session/:id/pack` : worktree observé, `tokensBefore.state === unknown` sans `value`.
