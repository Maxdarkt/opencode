# Manifeste d'intégration — DA40-010

## Candidate

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/50-integration`.
- Branche : `baseline-integration`.
- Base/HEAD : `702bf7dcd7468638c17fd95b110deb38bd253e9a`.
- État : diff non committé remis au parent ; aucune mutation de `staging` ou des branches source.
- Ports locaux : backend 4150, UI 4450, code 50 via `.make.env` ignorée.

## Provenance appliquée

| Ordre | Source                                          | Pathset appliqué                                    | Vérification                                                          |
| ----: | ----------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------- |
|     1 | DA10 `e22d723895e3a8537f9bf21d5d6e4561ff630de1` | 15 chemins Schema/Core/HTTP/SDK partagés            | 15/15 blobs égaux aussi à DA20                                        |
|     2 | DA10 `e22d72389`                                | 18 chemins `packages/app`                           | 18/18 blobs égaux à DA10                                              |
|     3 | DA10 / DA20                                     | dossiers APEX, 66 + 78 fichiers                     | chaque blob égal à sa source ; aucun produit DA20 réappliqué          |
|     4 | DA40 `1b327889841111256dfbc88f9cb063f848cc661b` | delta complet depuis la base, 35 fichiers           | 35/35 blobs égaux                                                     |
|     5 | DA40 `50019f223b575164873c67dcc8894286066ab30c` | delta depuis `1b3278898`, 14 fichiers               | 14/14 blobs égaux                                                     |
|     6 | DA40 `b7111b6e973d7200e70990c6f32a1a4d4b4a64de` | delta depuis `50019f223`, 17 fichiers               | 17/17 blobs égaux                                                     |
|     7 | racine canonique `Daidalon`                     | coordination Sprint 1, release, mémoire et workflow | copies comparées à la source ; fusion locale bornée de `worktrees.md` |

## Réconciliation DA10/DA20

DA10 et DA20 ont le même parent `702bf7dcd`. Les 15 chemins produit du commit DA20 ont chacun le même blob ID dans DA10. La candidate applique ces chemins une seule fois depuis DA10, qui ajoute aussi l'UI, et importe le dossier APEX DA20 depuis son commit autonome. Cette stratégie conserve le comportement et les preuves sans fausse double intégration.

## Documents canoniques

`PLAN-GENERAL.md` et `sprint.md` sont des projections read-only rafraîchies par le parent en review à `2026-09-07T12:16:04+0200` ; leurs hashes observés sont respectivement `a808a55d9613bf942f244de87eb8008e54e67f6c761281d6a7770124b7b22362` et `2ab7c5979ee7a2114e36add1b1da5cc209d04fb42d6043191511f59d61e02b85`. Le checkpoint runtime local a été recopié depuis le canonique après handoff (sha256 `df8338e54f7ef1a0c2bb22b3fe29c189e02960b64c8b44b3d2ccb5e883686528`). La candidate inclut release 0.1, bilan Sprint 1, archives utiles, mémoire durable et dossier parent DA40-004. `docs/product/worktrees.md` fusionne les ports DA40-006 avec le contrat de projection canonique et le worktree 50.
