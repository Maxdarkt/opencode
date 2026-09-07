# Smoke technique — DA10-003

- HTTP : `bun test ./test/server/httpapi-control-plane.test.ts ./test/server/httpapi-global.test.ts ./test/server/httpapi-local-context.test.ts` — 7 PASS.
- UI : `bun test --conditions=solid --preload ./happydom.ts ./src/components/active-task-context-state.test.ts ./src/components/active-task-write-guard.test.ts` — 4 PASS / 20 assertions.
- Les états incomplet, divergent et reprise refusent le chemin effectif `sendFollowupDraft`; seul le contexte concordant atteint l’écriture. Shell, commande personnalisée et reprise de follow-up emploient la même garde.

## Smoke visuel parent

Candidate locale avec binding/session/worktree/HEAD concordants et owner génération 1; viewport 1440×900 puis 1024×768. Ouvrir le contexte actif, vérifier projet/tâche/session/worktree/branche/HEAD/owner/génération/effets; vérifier sprint explicitement indisponible. Rejouer fixture HEAD divergent puis effet pending : alerte et écriture désactivée, sans réparation proposée.

## Re-smoke B2.2

Avec la fixture effet `pending`, saisir un prompt et son contexte fichier, cliquer Envoyer : vérifier le toast de blocage, zéro message créé, puis retour exact du texte et du contexte. Le bouton peut rester activable : le blocage est effectué au submit et le libellé indique désormais que l’écriture est bloquée, non désactivée.
