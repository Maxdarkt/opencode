# Plan — DA30-015 — Adaptateurs d’abonnement LLM

Amendé 2026-09-25 après le Smoke FAIL. `runtime_profile: none` jusqu’au Smoke. Pas de serveur en Build. Pas de `bun run generate`. Pas de nouveau fournisseur. Schéma, protocole et client hors chemin. Ne pas éditer le `.make.env` de staging.

B1 est conservé. Le Build reprend à B2.

## B1 — Canal dérivé (fait)

`billingChannel` : `api`, `key`, `wellknown` → `api` ; `oauth` → `abo`. Mixte → pas de libellé. 6 tests PASS. On n’y retouche pas.

## B2 — Libellé sur le catalogue affiché

Le premier smoke a ouvert « Sélectionner un modèle », puis « Voir plus de fournisseurs ». L’écran réel était le formulaire du fournisseur personnalisé, pas la liste de méthodes ni le cockpit.

Chemin :

- `packages/app/src/components/dialog-custom-provider.tsx` — le formulaire est une méthode clé : libellé `API` visible sur cet écran. S’il expose un oauth, libellé `abo`.
- `packages/app/src/components/dialog-connect-provider.tsx` — garder le libellé à côté d’une ligne `key` ou `oauth` quand cette liste est affichée.
- `packages/app/src/components/dialog-select-model.tsx` — libellé à côté du fournisseur seulement si le canal connecté est unique. `openai` (`api`+`oauth`) reste sans libellé.
- Clés déjà posées : `billing.channel.api`, `billing.channel.subscription` (`en.ts`, `fr.ts`).

Le libellé est calculé à l’affichage. Il ne s’écrit pas dans `Session.location`, la branche, ni `.project/tasks`.

Contrôle, depuis `packages/app` : `bun typecheck`, puis `bun test src/pages/session/billing-channel.test.ts`.

## Smoke

Profil `web-api`. Ports de ce worktree dans `6400–6499` (`6400` / `6402`, fichier `.make.env` local ignoré, `HOST=0.0.0.0`). Le fichier de staging reste intact.

Chemin : `/L1VzZXJzL2xlYW5ib3QvRG9jdW1lbnRzLzQwX0RhaWRhbG9uL2ZlYXR1cmVzL3Rhc2tzL0RBMzAtMDE1LWFkYXB0YXRldXJzLWFibw==/session`, puis nouvelle session → « Sélectionner un modèle » → « Voir plus de fournisseurs » → formulaire personnalisé. Le mot `API` ou `abo` est visible là. Pas de `/sprint/cockpit`.

`git status` ne montre aucun fichier d’auth ni de fournisseur. Sleep `dev-stop` dry-run puis `APPLY=1` sur les PID de cette carte. `runtime_profile: none` avant le rapport.

## Hors chemin

Cockpit sprint, coûts, CPU/RAM, pack de contexte, choix d’un vendeur unique.
