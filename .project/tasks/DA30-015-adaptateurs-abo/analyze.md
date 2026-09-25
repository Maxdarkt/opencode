# Analyze — DA30-015 — Adaptateurs d’abonnement LLM

## Contexte

- Carte MT `DA30-015`, sprint `da-release-0.1-sprint-8`, 5 SP, release 0.5 (E3).
- Worktree `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA30-015-adaptateurs-abo`, branche `task/DA30-015-adaptateurs-abo`, HEAD `8db56f535`.
- Arbre produit propre. `bun.lock` identique au checkout source. `node_modules` (racine, `.opencode`, 26 paquets) et `.make.env` sont des liens vers staging. Éditer `.make.env` modifierait staging.
- `runtime_profile: none`. Aucun serveur lancé.
- Dépendances `DA30-013` et `DA10-007` : archived, présentes dans cet arbre (Sprint 5).

## Preuve E3

`docs/product/livrable.md` : API ou abo = adaptateur, pas l’identité. Changer de moteur sans perdre Git ni APEX. Hors périmètre du scope : capter un fournisseur unique. `DA30-014` porte E1/E2 (coûts). `DA40-020` porte E4 (CPU/RAM).

## Déjà séparé dans OpenCode

- `Session.Info.location` est le répertoire du worktree. `Session.Info.model` est un `Model.Ref` optionnel (`id`, `providerID`, `variant`) dans `packages/schema/src/session.ts` et `packages/schema/src/model.ts`.
- Les méthodes de connexion sont `oauth` ou `api` (`packages/opencode/src/provider/auth.ts`, classe `Method`).
- Les secrets vivent dans `auth.json` global (`packages/opencode/src/auth/index.ts`) : `oauth`, `api`, ou `wellknown`. Ce fichier n’est pas le dépôt Git ni le dossier APEX.
- Les plugins fournisseur restent un catalogue. Aucun n’est l’identité du produit.

## Trou

Rien n’étiquette le canal (clé API vs abo OAuth) comme adaptateur de paiement. Rien ne prouve qu’un changement de moteur laisse la branche, le statut Git et `.project/tasks` intacts. La question ouverte de `conception.md` (« quel niveau d’adaptateur sans captivité ») reste ouverte.

## Lecture proposée

1. Dériver le canal des méthodes déjà là : `api` = clé, `oauth` = abonnement. Pas de nouveau fournisseur, pas de plugin LLM.
2. Le canal reste collé au modèle de la session. Il ne s’écrit pas sur le worktree, la branche, ni les fichiers APEX.
3. Preuve : même arbre, changer `providerID` et la méthode ; `git status` du produit et le dossier de la carte ne bougent pas.
4. Libellé visible API ou abo, sans nommer un vendeur comme produit.

## Hors chemin

Coûts et budgets, CPU/RAM, pack de contexte, choix d’un fournisseur unique, édition de `.make.env`.
