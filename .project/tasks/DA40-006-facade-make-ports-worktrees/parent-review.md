# Revue parent — DA40-006

Date : 2026-09-06.

## Verdict

Acceptée après deux corrections bornées. La façade Make, la convention des ports et les cinq configurations locales satisfont le scope.

## Corrections de revue

1. Les recettes `dev-app` et `dev-server` préflightaient initialement les deux ports, ce qui créait une course après le lancement du premier service. Elles ne vérifient désormais que leur propre port ; `dev` conserve le préflight global.
2. `dev` lançait initialement deux sous-Make et ne garantissait pas l'arrêt du service survivant. Il lance maintenant directement Bun et Vite avec des PID fiables, détecte la fin de l'un, puis arrête et récupère l'autre.

## Smoke parent réel

- `make help`, `make ports`, `make context`, `make preflight-ports`, `DRY_RUN=1 make dev` et `make -n dev | bash -n` : PASS.
- `make dev` : Vite prêt sur `127.0.0.1:4440` et serveur Bun prêt sur `127.0.0.1:4140`.
- `GET /global/health` : `{"healthy":true,"version":"local"}` ; UI : HTTP 200.
- PIDs observés : Bun 9351, Node/Vite 9352.
- Après interruption contrôlée du processus Make : ports 4140 et 4440 libres ; aucun listener orphelin.
- Les cinq `.make.env` sont présents, sans secret, et ignorés par Git. Le couple visible `4150/4450` n'a pas été touché.

## Limite conservée

Le lint global du dépôt amont reste rouge avec sa baseline existante ; la façade n'introduit pas de source lintable et les checks ciblés/diff sont verts. Cette dette ne bloque pas la livraison de la commande projet.
