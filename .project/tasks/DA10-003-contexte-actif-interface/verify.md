# Verify — DA10-003

- `bun typecheck` dans `packages/opencode` : PASS.
- `bun typecheck` dans `packages/app` : PASS.
- Générations `packages/client` et `packages/sdk/js` : PASS.
- Tests HTTP/UI ciblés : PASS; `git diff --check` : PASS.
- Correction B2.1 : `bun typecheck` dans `packages/app` : PASS. `active-task-context-state.test.ts` et `active-task-write-guard.test.ts` : 4 PASS / 20 assertions. Le second test vérifie le chemin réel `sendFollowupDraft` : aucune écriture pour `incomplete`, `divergent` ou `resuming`, une écriture pour `concordant`.
- Régression ciblée : `prompt-input/submit.test.ts` ne démarre pas, son harness important un export `toaster` absent de `packages/ui/src/components/toast.tsx`; aucune assertion applicative n’est exécutée. Écart préexistant/hors périmètre, à traiter séparément.
- Dette : aucune nouvelle; sprint indisponible est une limite explicitement rendue, non inventée.
