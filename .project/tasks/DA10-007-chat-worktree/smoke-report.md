# Smoke — DA10-007

- Status: PASS
- Surfaces: `http://127.0.0.1:4407/sprint/cockpit` + `POST /global/task-chat/open` sur `:4107`

## W1 — libellés

Rail + en-tête canvas (carte A) : `features/tasks/DA40-015-candidate-integree`.
Carte B : suffixe observé `features/tasks/…/fixtures/checkout-b`. Pas de chemin inventé.

## W2 — un chat / un worktree

Premier `open` DA10-007 : `created: true`, `sessionID=ses_f6542617dffenvfaeAdoJiZnl5`,
`location.directory === checkout.worktree === …/features/tasks/DA10-007`.
Reopen : même `sessionID`, `created: false`.

## Fail-closed A/B

Tests HTTP : hors convention / absent / non-checkout → 4xx, zéro seconde ligne.
Launch cockpit A/B (arbre ≠ `<display_id>`) : contrat fail-closed inchangé.
