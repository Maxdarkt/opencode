# Smoke — DA10-010

- Status: PASS (chrome tests + home App ; session live absente)
- Surface: `http://127.0.0.1:3010/` (Vite `packages/app`, port 3010)
- Session liée : **non adressable** — aucun projet, « Ajouter un projet » disabled, `make dev` hors pathset (DA40-019)

## Home App

Accueil OpenCode chargé. Liste sessions vide (« Créez une session pour commencer »).
Clic « Nouvelle session » : pas de navigation (pas de worktree ouvert).

## Recette (tests + code, même contrat que la session v2)

| Check | Résultat |
| --- | --- |
| Split fermé par défaut | PASS (`emptySecondaryTabs`, layout 1440 `showSecondary: false`) |
| 1er open → Files | PASS |
| Arbre Files à droite | PASS (`treeSide: "right"`) |
| Menu `+` overflow visible | PASS (barre `overflow-visible`) |
| Poignée min 280, `layout.session` 600 inchangé | PASS |
| Git Diff empty / patch entier ou `unknown` | PASS |
| Browser `about:blank`, pas d’iframe | PASS |
| 1024 rail 64, icône encore dans le bandeau | PASS (rail compact ; toggle dans AgentBanner) |
| ☰ inchangé | PASS (`pack-inspector-toggle` conservé) |

Pas de faux diffs maquette, pas d’iframe `make dev`.
