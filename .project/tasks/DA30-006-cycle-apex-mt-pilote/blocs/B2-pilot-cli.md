# B2 — Commande pilote locale

## Résultat

- `packages/opencode/src/cli/cmd/task.ts` ajoute `opencode task pilot` sans instance projet ni I/O
  métier. Ses options observées sont `--mt-status`, `--apex-phase` et `--context`.
- L'entrée est décodée par le schéma public; la sortie est le `TaskPilot.Result` JSON discriminé.
  Aucun binding, owner, effet, session, worktree, document APEX ou statut MT n'est créé/modifié.
- L'index CLI enregistre le groupe `task`. La commande est utilisable comme prévisualisation
  reproductible du contrat v1 transmis à DA10-004.

## Corrections bornées

- Après installation reproductible, Effect v4 a refusé le nom API `Schema.decodeUnknown`; B2 utilise
  `Schema.decodeUnknownEffect`, l'API présente dans ce dépôt.
- Le mapping d'erreur retourne désormais `CliError` (et non un Effect imbriqué), ce que le typecheck
  OpenCode confirme. Ces corrections restent strictement dans la validation de l'entrée CLI.

## Checks

- `bun run src/index.ts task pilot --mt-status in_progress --apex-phase build` : PASS,
  `{"kind":"next","action":"run_smoke"}`.
- `bun run src/index.ts task pilot --mt-status review --apex-phase build` : PASS,
  `{"kind":"blocked","reason":"invalid_status_phase"}`.
- `bun typecheck` depuis `packages/opencode` : PASS.

## Suite

Exécuter Smoke sur la chaîne complète et les refus, puis Verify. Aucun serveur, navigateur, compte
ou mutation externe n'est nécessaire pour ce pilote consultatif.
