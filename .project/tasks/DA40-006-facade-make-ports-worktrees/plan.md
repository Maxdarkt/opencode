# Plan — DA40-006

Plan établi le 2026-09-06 après Analyze. Les écritures restent limitées au `Makefile`, `.gitignore`, `.make.env.example`, la documentation de développement et les artefacts APEX ; les cinq `.make.env` locaux ne sont créés qu'après vérification d'absence, et ne sont jamais versionnés.

## Contrat de sortie

- `make help`, `make ports` et `make context` affichent la racine, branche, HEAD et le couple de ports de ce worktree.
- `make dev-app` injecte les variables Vite du backend et démarre Vite en `--strictPort`; `make dev-server` appelle explicitement `opencode serve` avec le port backend ; `make dev` pilote les deux enfants avec propagation d'arrêt.
- `make preflight-ports` est une vérification non destructive ; `DRY_RUN=1` expose les commandes sans démarrer de processus.
- `install`, `typecheck`, `lint` et `format` délèguent aux emplacements valides. Aucune cible test racine n'est ajoutée.
- Une documentation et l'exemple rendent le mapping `00/10/20/30/40` reproductible ; les couples 4140/4440 et 4150/4450 restent inchangés.

## Blocs bornés

### B01 — Façade et configuration

Créer le `Makefile`, ajouter `.make.env` à `.gitignore` et ajouter `.make.env.example`. Le Makefile résout sa propre racine, inclut seulement son `.make.env`, exige `WORKTREE_CODE`, `BACKEND_PORT` et `UI_PORT`, valide des valeurs numériques et contrôle les ports avec `lsof` sans effet de bord.

Validation : `make -n` et `make help/ports/context`; préflight sur des ports libres/occupés contrôlé sans arrêt de processus.

### B02 — Commandes déléguées et orchestration

Implémenter les cibles `install`, `typecheck`, `lint`, `format`, `dev-app`, `dev-server` et `dev`. Les commandes de développement offrent un dry-run et les lancements réels restent précédés du contrôle des ports. La cible agrégée attend les deux enfants et un trap arrête uniquement les PID qu'elle a créés.

Validation : expansion Make et dry-run des trois commandes de développement ; aucun serveur existant démarré, arrêté ni redémarré.

### B03 — Convention, fichiers locaux et preuves

Documenter la table des couples dans une documentation de développement. Re-vérifier l'absence de `.make.env` dans les cinq racines, créer chaque fichier depuis l'exemple sans contenir de secret, puis vérifier qu'ils sont ignorés et que leurs valeurs suivent la table.

Validation : `git check-ignore`, parsing Make, sorties de contexte, listener check, `git diff --check`; consigner les résultats dans les blocs, smoke-report, debts, handoff et STATE.

## Ordre, risques et smoke

B01 → B02 → B03. Les blocs sont séquentiels car les fichiers locaux sont dérivés de la convention définitive. Le smoke ne lance aucun serveur : il se limite aux dry-runs, parsing Make, vérification de listeners et inspection de l'environnement injecté par l'expansion de commandes.

## Gate Build

Le mandat exige `gpt-5.6-terra`, effort `medium`, contrôlé avant tout Build. En cas de divergence ou d'impossibilité de confirmer le modèle, aucun bloc B01–B03 ne doit commencer : documenter le blocage et remettre le handoff au parent.
