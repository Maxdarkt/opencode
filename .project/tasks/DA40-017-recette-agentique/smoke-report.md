# Smoke — DA40-017

- Status: PASS
- Surfaces: `http://127.0.0.1:4417` (App) + `http://127.0.0.1:4117` (serve)
- Session: `ses_f61499d87ffewu1m2C3CmCVLS0`
- Worktree observé: `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA40-017`
- Launch: `POST /global/task-chat/open` (mtTaskID=DA40-017), pas de rewrite fixtures A/B

## Idle

Bandeau : **Inactif**, outil `unknown`, cwd = worktree DA40-017.
**Interrupt absent**.

## Inspecteur

Toggle Contexte : worktree observé, mandat `unknown`, pathset vide, jetons
avant/après `unknown`. Pas de `$0.00` ni de faux zéro. Onglet Coût : click
intercepté (overlay) ; preuve jetons/coût = pack HTTP + panneau Contexte.

## Pack / interrupt HTTP

`GET /api/session/:id/pack` : worktree observé, `tokensBefore.state === unknown`
sans `value`. `POST …/interrupt` idle → 204, `GET /api/session/active` vide.

## Limite

Interrupt visuel **running** non smoké (pas de clé provider). Preuve run =
check B3 (`TestLLMServer.hang`).
