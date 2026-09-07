# Plan — DA40-010

## Contrat d'assemblage

La candidate reste un diff non committé sur `baseline-integration` à partir de `702bf7dcd`. Chaque livraison est importée comme delta mécanique borné puis vérifiée contre son commit source. DA10 est l'unique source des 15 fichiers produit DA20 identiques ; DA20 conserve sa provenance par son dossier APEX uniquement. Les trois commits DA40 sont appliqués dans leur ordre de filiation.

Les documents canoniques sont lus et copiés depuis `/Users/leanbot/Documents/40_Daidalon/Daidalon` sans aucune écriture vers cette racine. En cas de contenu divergent sur `docs/product/worktrees.md`, la candidate conserve à la fois la table/commande de ports validée par DA40-006 et la section de projections canoniques ajoutée par la racine.

## Blocs bornés

### B01 — Contrat local/Git partagé

- Importer depuis DA10 les 15 chemins produit identiques à DA20 : Schema, Core, routes/tests HTTP, SDK généré/tests.
- Vérifier que chaque blob de la candidate égale celui de DA10 et DA20 ; `git diff --check`.

### B02 — Parcours UI DA10

- Importer uniquement les chemins `packages/app` de DA10.
- Vérifier pathset et blobs contre `e22d72389` ; lancer les tests unitaires ciblés du contexte/ouverture quand les dépendances sont disponibles.

### B03 — Provenance APEX DA10/DA20

- Importer les dossiers `.project/tasks/DA10-002-ouverture-projet-explicite` depuis DA10 et `.project/tasks/DA20-002-contexte-local-verifiable` depuis DA20.
- Vérifier qu'aucun chemin produit DA20 n'est réappliqué et que les dossiers APEX correspondent aux arbres sources.

### B04 — DA40-003

- Appliquer le delta complet `702bf7dcd..1b3278898` : dossier APEX de baseline locale.
- Vérifier le pathset et l'égalité des blobs.

### B05 — DA40-007

- Appliquer le delta `1b3278898..50019f223` : architecture, conception et dossier APEX.
- Vérifier les liens et `git diff --check`.

### B06 — DA40-006

- Appliquer le delta `50019f223..b7111b6e9` : `.gitignore`, `.make.env.example`, Makefile, documentation worktrees et dossier APEX.
- Créer une `.make.env` locale ignorée pour le code 50 et les ports 4150/4450 seulement si elle est absente.
- Vérifier `make config-check`, `make ports`, `make context`, `make preflight-ports`, les dry-runs, `make -n dev` et l'absence de listeners créés.

### B07 — Snapshot canonique et réconciliation documentaire

- Importer les documents nécessaires à la continuité : release 0.1, bilan/index Sprint 1, routine/mémoire durable, décision et modèles, archives utiles, checkpoint/registre runtime et dossier APEX parent Sprint 1.
- Ne pas écraser les ports DA40-006 : fusionner la section projections de la version canonique dans `docs/product/worktrees.md`.
- Garder `PLAN-GENERAL.md` et `sprint.md` identiques à la projection parent fraîche ; consigner tout nouvel écart sans les publier depuis l'enfant.

### B08 — Générations et Verify

- Installer uniquement si requis par le lockfile (`bun install --frozen-lockfile`, sans upgrade).
- Régénérer le SDK legacy par `./packages/sdk/js/script/build.ts`, puis vérifier que la génération ne modifie pas le contrat intégré.
- Depuis les packages concernés : tests ciblés Core, HTTP/OpenAPI, SDK et app ; `bun typecheck` pour Schema/Core/opencode/SDK/app selon les scripts disponibles.
- Exécuter format/lint connus en distinguant les échecs hérités, puis `git diff --check`.

### B09 — Smoke technique intégré et handoff

- Avec ports 4150/4450 libres, lancer uniquement les processus nécessaires depuis ce worktree et les arrêter après le smoke.
- Vérifier API `/global/context` sur checkout réel et fixtures normal/non-Git/absent, puis le parcours UI automatisable d'ouverture/affichage sans initGit.
- Produire `smoke-report.md`, `debts.md`, `handoff.md`, preuves, état Git, préservation des worktrees source et plan Pass B parent.
- Après preuves vertes et plan visuel complet, synchroniser l'APEX et demander MT `in_progress -> review`, jamais `done`.

## Gates et corrections

Chaque bloc met à jour `STATE.md` et écrit `blocs/<id>.md`. Un conflit de contenu non résolu, une divergence de modèle, une mutation inattendue d'un worktree source ou une décision produit arrête le Build et remonte au parent. Un échec technique en scope ouvre un bloc correctif borné, puis rejoue les contrôles affectés. Aucun commit, push, merge, rebase, promotion, suppression ou nettoyage n'est autorisé.

## Validation Plan

Le mandat fixe les révisions, frontières, comportement attendu, contraintes Git et rôle du parent. Aucune question métier n'est ouverte. Plan validé autonomement le 2026-09-07 conformément au contrat enfant.
