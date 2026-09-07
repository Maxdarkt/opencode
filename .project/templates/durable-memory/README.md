# Modèles — mémoire durable

Version : `1`. Racine canonique :
`/Users/leanbot/Documents/40_Daidalon/Daidalon`.

Ces modèles servent aux nouvelles écritures ou révisions explicitement mandatées;
ils n'imposent aucune migration des preuves existantes. Les champs `authority`,
`sources` et `observed_at` sont obligatoires.

| Modèle | Destination canonique | Usage |
|---|---|---|
| `decision.md` | `docs/decisions/<id>.md` | Décision et remplacements. |
| `reconciliation-journal.md` | `.project/journals/<operation-id>.md` | Intention, observation, reprise. |
| `checkpoint.md` | `.project/runtime/<id>-checkpoint.md` | Reprise compacte. |
| `archive-index.md` | `.project/archives/<period>/index.md` | Retrouver l'archivé. |
| `worktree-projection.md` | `.project/projections/<name>.md` | Projection read-only. |

MT porte l'état métier; APEX porte phases/preuves; Git porte les faits Git. Une
projection ne remplace aucune de ces autorités.
