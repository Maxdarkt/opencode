# Smoke — DA30-015

Résultat : **PASS**.

## Préparation

- Pas de migration, pas de fonction Edge.
- `.make.env` local ignoré : `UI_PORT=6400`, `BACKEND_PORT=6402`, `HOST=0.0.0.0`. Plage `6400–6499`. Staging intact (`4100` / `4400`, `127.0.0.1`).
- `make dev` de ce worktree. Écoute `0.0.0.0`. Profil `web-api`.

## Navigateur

URL `http://100.112.223.7:6400/L1VzZXJzL2xlYW5ib3QvRG9jdW1lbnRzLzQwX0RhaWRhbG9uL2ZlYXR1cmVzL3Rhc2tzL0RBMzAtMDE1LWFkYXB0YXRldXJzLWFibw==/session`. Titre OpenCode. Nouvelle session.

« Sélectionner un modèle » → « Voir plus de fournisseurs » → fournisseur personnalisé. Le dialogue affiche, sur deux lignes : `Fournisseur personnalisé` puis `API`.

## Git

`git status` : pas de fichier d’auth ni de fournisseur.

## Sommeil

Dry-run puis `APPLY=1` : SIGTERM `68526`, `68531`, `68532`. kill count 3. `runtime_profile: none`.
