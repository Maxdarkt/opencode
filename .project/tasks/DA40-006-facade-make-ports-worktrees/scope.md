# Scope — DA40-006

## Titre et objectif

Standardiser les commandes projet et les ports par worktree. Fournir à la racine de Daidalon une façade `Makefile` simple et une configuration locale `.make.env`, selon les conventions éprouvées dans Maxxaro et Lean Construct.

## Contexte mesuré

- Daidalon est un monorepo Bun ; les commandes utiles sont aujourd'hui dispersées entre le `package.json` racine et les packages `app` et `opencode`.
- Le parcours local validé par DA40-003 lance un backend `opencode serve` et une UI Vite avec un couple de ports dédié.
- Maxxaro charge un `.make.env` gitignoré par worktree ; Lean Construct expose `help`, `ports`, `context` et des commandes de développement explicites.
- Les worktrees permanents Daidalon utilisent les codes `10`, `20`, `30` et `40`. Les services déjà actifs doivent être préservés.

## Dans le scope

- Créer un `Makefile` racine avec au minimum `help`, `ports`, `context`, `install`, `dev`, `dev-app`, `dev-server`, `typecheck`, `lint`, `format` et des checks ciblés adaptés aux gardes du dépôt.
- Charger `.make.env` depuis la racine du worktree et échouer clairement lorsque les ports requis manquent ou sont occupés.
- Définir une convention de ports lisible à partir du code de worktree, incluant le dépôt source et les worktrees `10/20/30/40`.
- Ajouter `.make.env` au gitignore et fournir un exemple versionné sans secret.
- Créer les `.make.env` locaux des cinq racines sans écraser une valeur existante.
- Documenter l'usage et la relation entre port UI, port backend et worktree.

## Hors scope

- Arrêter ou redémarrer les serveurs existants.
- Modifier le comportement produit, les protocoles, la BDD ou le lockfile.
- Ajouter Docker, déploiement, publication, push, merge, rebase ou suppression de worktree.

## Critères d'acceptation

1. `make help`, `make ports` et `make context` fonctionnent depuis le worktree `40-tooling` et exposent clairement la branche, le HEAD et les ports actifs.
2. `make dev-app` injecte le port backend dans Vite ; `make dev-server` passe le port backend au serveur ; `make dev` orchestre les deux et propage correctement les arrêts.
3. Le schéma des ports suit le numéro du worktree et ne collisionne pas avec les couples déjà réservés `4140/4440` et `4150/4450`.
4. `.make.env` reste local et gitignoré ; un fichier exemple et une table documentaire rendent la convention reproductible.
5. Les commandes non mutatrices et leurs dry-runs/preflights sont vérifiés ; aucun serveur existant n'est interrompu.

## Surfaces probables

`Makefile`, `.gitignore`, `.make.env.example`, `.make.env` local, documentation de développement et preuves APEX de cette tâche.

## Dépendances, risques et validation

DA40-003 fournit la recette locale de référence. DA40-007 peut citer le résultat final, mais ne bloque pas cette implémentation. Risques : collision de ports, commande racine lançant des tests interdits, processus enfants orphelins. Valider par parsing Make, sorties `help/ports/context`, dry-run des commandes et contrôle des listeners sans tuer de processus.

## Relation au sprint

Carte ajoutée au Sprint 1 le 2026-09-06 après demande utilisateur. Worktree exclusif : `/Users/leanbot/Documents/40_Daidalon/features/40-tooling`, branche `40-tooling`. Modèle prévu : `gpt-5.6-terra`, effort `medium`.
