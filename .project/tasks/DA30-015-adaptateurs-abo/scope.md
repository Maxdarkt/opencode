# DA30-015 — Adaptateurs d’abonnement LLM sans capter le produit

Recadré 2026-09-25 après Smoke FAIL. Même carte MT, même worktree. Pas de nouveau `display_id`.

## Objectif

E3 : API ou abo = adaptateur, pas l’identité. Changer de moteur sans perdre Git ni APEX. Un libellé `API` ou `abo` est visible sur le chemin session réel.

## Contexte et preuves

- Carte Sprint 8, 5 SP, `in_progress`. Worktree `features/tasks/DA30-015-adaptateurs-abo`, branche `task/DA30-015-adaptateurs-abo`, HEAD `8db56f535`, arbre sale, pas de commit.
- B1 livré : `billing-channel.ts` dérive `api`/`key`/`wellknown` → `API`, `oauth` → `abo`. Mixte → pas de libellé. 6 tests PASS.
- B2 amorcé : libellé dans `dialog-select-model.tsx` et `dialog-connect-provider.tsx` (à côté de la **liste de méthodes**). i18n `billing.channel.api` / `billing.channel.subscription`.
- Smoke FAIL : `/sprint/cockpit` n’a pas de contrôle modèle. Dialogue session « Sélectionner un modèle » sans libellé. Catalogue connexion affiché = fournisseur personnalisé seulement ; son formulaire n’est pas la liste de méthodes. `openai` connecté mélange `api`+`oauth` (libellé volontairement absent). `github-copilot` est `oauth` seul mais n’était pas dans le catalogue affiché.

## Périmètre

- Conserver B1. Ne pas recâbler schéma, protocole, client, Core.
- Recaler l’acceptation **hors cockpit** : session de ce worktree → « Sélectionner un modèle » → « Voir plus de fournisseurs ».
- Rendre le libellé `API` ou `abo` visible sur le catalogue **réellement affiché** : formulaire du fournisseur personnalisé (méthode clé → `API`, oauth → `abo`) et/ou toute ligne de méthode unique déjà listée.
- Dialogue modèle : libellé seulement si le canal connecté est unique ; mixte = rien.
- Preuve E3 : changer de moteur (modèle / méthode) ; `git status` du produit et `.project/tasks/DA30-015-adaptateurs-abo` ne gagnent aucun fichier d’auth ni de fournisseur. `.make.env` de staging intact.

## Hors périmètre

- Contrôle modèle dans le cockpit sprint.
- Nouveau fournisseur, plugin LLM, capter un vendeur unique.
- Coûts (DA30-014, done), CPU/RAM (DA40-020, done), pack de contexte.
- Écrire le canal dans `Session.location`, la branche, ou les fichiers APEX.
- Fixture d’auth réelle / secrets. `bun run generate`. Éditer le `.make.env` lié à staging.

## Acceptation

1. Au moins un libellé `API` ou `abo` visible sans quitter le chemin session + connexion de ce worktree.
2. Un fournisseur mixte (`api`+`oauth`) reste sans libellé.
3. Changer de moteur ne salit pas Git/APEX/auth du dépôt.
4. Typecheck `packages/app` + tests `billing-channel` verts.

## Surfaces

- `packages/app/src/pages/session/billing-channel.ts` (+ tests)
- `packages/app/src/components/dialog-connect-provider.tsx`
- `packages/app/src/components/dialog-select-model.tsx`
- `packages/app/src/i18n/en.ts`, `fr.ts`

## Dépendances, risques

- Dépendances faites : DA30-013, DA10-007. Frères 014 et 020 **done**, hors chemin.
- `.make.env` est un lien vers staging : fichier local ignoré seulement, comme au premier Smoke.
- Smoke = `web-api` (le libellé lit `/provider/auth`). 014/020 `none` → `runtimes_ge_api: 1` GREEN.
- Ne pas ouvrir un second chat ni un second worktree.

## Smoke

Profil `web-api`, ports de **ce** worktree (plage 6400–6499). URL session de cet arbre, pas `/sprint/cockpit`. Sleep `APPLY=1` ensuite. `runtime_profile: none`.

## Relation

Même carte que Analyze/Plan/B1/B2. Le Plan enfant doit amender la section Smoke (et B2 si le formulaire custom n’expose pas la méthode), attendre validation, puis Build → Smoke → Verify. Commit local seulement si Verify vert. Pas de push/merge.
