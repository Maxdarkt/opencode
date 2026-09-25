# B1 — contrat du manifeste

- Cibles modifiées :
  `packages/schema/src/event-manifest.ts` et
  `packages/schema/test/event-manifest.test.ts` dans le worktree `schema-manifest`.
- Décision appliquée : les trois Revert events sont des événements current et durables
  du segment Session, placés avant les événements V1 live. Le manifeste Server
  canonique contient donc 58 IDs, dans l'ordre désormais entièrement asserté.
- Aucun changement de définition, de rôle protocolaire ou de compatibilité V1.
- Check ciblé : `bun test --cwd packages/schema test/event-manifest.test.ts` — PASS,
  2 tests / 22 assertions.
- Suite : typecheck, suite Schema entière et `git diff --check` avant handoff.
