# Analyze — DA40-006

Analyse réalisée le 2026-09-06 dans `/Users/leanbot/Documents/40_Daidalon/features/40-tooling`.

## Autorité et périmètre

- Carte MT `DA40-006` passée de `todo` à `in_progress`, puis relue : requête de mise à jour `1919c12d-3f33-4da7-b7e6-bf372f59c991` ; la liste MT renvoie bien `in_progress`.
- Racine d'écriture unique : ce worktree, branche `40-tooling`, HEAD observé `50019f223`.
- APEX tracked v2 ; le parent est propriétaire de `PLAN-GENERAL.md`, `sprint.md`, des documents sprint/release et du registre runtime. Ces surfaces sont donc exclues de toute écriture enfant.
- État Git initial : modifications/artefacts hérités nombreux, dont le dossier de la présente carte déjà non suivi. Ils sont préservés ; aucune modification hors surface ne sera réécrite.

## Objectif et contrat mesuré

Créer une façade Make racine qui charge une configuration locale sans secret, rend le contexte et les ports explicites, délègue les commandes aux paquets valides et ne lance jamais les tests depuis la racine protégée.

La recette DA40-003 est la référence : depuis `packages/opencode`, le backend est lancé avec `serve --hostname 127.0.0.1 --port 4140` ; depuis `packages/app`, Vite reçoit `VITE_OPENCODE_SERVER_HOST=127.0.0.1`, `VITE_OPENCODE_SERVER_PORT=4140`, `--host 127.0.0.1 --port 4440 --strictPort`. Les processus historiques ne sont plus présumés actifs : le préflight `lsof` n'a affiché aucun listener pour 4140, 4440, 4150 ou 4450.

## Constat du code et des références

- Aucun `Makefile`, `.make.env` ou `.make.env.example` n'existe encore dans ce worktree. Les cinq racines Daidalon (staging et worktrees 10/20/30/40) ne contiennent pas de `.make.env` : les fichiers locaux pourront donc être créés sans écrasement, seulement après le Build autorisé.
- Le `.gitignore` ne contient pas `.make.env` ; l'exemple versionné devra rester traqué et la configuration locale sera ajoutée explicitement à l'ignore.
- `packages/app/package.json` fournit `dev`, `typecheck` et des tests ; `packages/opencode/package.json` fournit `dev`, `typecheck` et des tests. Le `package.json` racine interdit expressément `test`; il ne faut donc créer aucune cible Make qui exécute test/typecheck à la racine.
- `packages/app/vite.config.ts` a un port par défaut, mais les arguments Vite passés par la façade peuvent le surcharger et `--strictPort` évite une dérive silencieuse.
- Maxxaro montre le chargement d'un `.make.env` local et Lean Construct la façade `help`/`ports`/`context`, l'échec si une variable manque, et un chemin `DRY_RUN=1` avant lancement.

## Convention de ports proposée

Les couples lisibles et déterministes sont `backend = 4100 + code`, `UI = 4400 + code`, où le dépôt source a le code `00` et les worktrees ont les codes `10`, `20`, `30`, `40`.

| Racine | Backend | UI |
| --- | ---: | ---: |
| dépôt source (staging) | 4100 | 4400 |
| 10-product-ui | 4110 | 4410 |
| 20-workspace-git | 4120 | 4420 |
| 30-agent-runtime | 4130 | 4430 |
| 40-tooling | 4140 | 4440 |
| réservé, prochain code 50 | 4150 | 4450 |

Cette règle préserve exactement les couples historiques `4140/4440` et `4150/4450`, sépare toujours UI et backend, et ne dépend pas de l'ordre de création des worktrees.

## Risques et protections

1. Collision de port : une cible de préflight contrôlera les deux listeners avant tout lancement, sans tuer de processus.
2. Enfants orphelins : `dev` utilisera un trap POSIX pour transmettre l'arrêt à ses deux enfants et attendra leur fin.
3. Mauvaise cible de check : `typecheck`, `lint` et `format` délégueront explicitement aux outils/paquets autorisés, sans `bun test` ni `bun typecheck` racine.
4. Secret ou écrasement : `.make.env.example` ne portera que les valeurs de ports/host ; chaque `.make.env` sera créé uniquement après une vérification d'absence.

## Décision de passage

Le mandat enfant autorise l'enchaînement Analyze/Plan. Le Build demeure conditionné par le contrôle explicite du modèle effectif demandé dans le scope.
