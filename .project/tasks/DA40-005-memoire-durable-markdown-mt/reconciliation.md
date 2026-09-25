# Journal et réconciliation — règles opératoires

## Transitions usuelles

| Transition | Préconditions relues | Écritures / observations | Succès seulement si |
|---|---|---|---|
| Idée → carte | décision de cadrage, absence de doublon | MT crée l'ID ; scope reprend `external_ref` | MT et scope se référencent mutuellement. |
| Carte → Analyze | carte `todo`, propriétaire/worktree | MT `in_progress`, relecture ; STATE `analyze` | ID, statut et worktree concordent. |
| Bloc → checkpoint | scope/plan, fichiers cibles, baseline | bloc + STATE ; checkpoint si transition significative | prochaine action et preuve sont lisibles. |
| Enfant → review | checks/smoke, dettes | STATE `review`; MT `review`, relecture | le parent peut recevoir les preuves. |
| Réception → done | décision parent, preuve de réception | MT `done`, relecture ; bilan/projection | aucun état n'est déduit d'un chat fermé. |
| Rotation → archive | done relu, bilan et roster figés | snapshot/index, archive MT/chat, relecture | l'index permet de retrouver la carte masquée. |

## Matrice de panne

| Cas | Détection | Réponse sûre | Fin de réconciliation |
|---|---|---|---|
| Timeout MT | absence de réponse ou request non confirmée | ne pas réessayer aveuglément ; lire par `display_id`/`external_ref`, journal `incomplete` | reprendre seulement si l'effet est absent ou l'idempotence prouvée. |
| Crash entre deux écritures | journal sans conclusion, STATE/checkpoint ancien | relire MT, APEX, Git ; compléter depuis effets observés | noter quel support a gagné et la source/date. |
| Doublon | deux cartes ou scopes pour même intention | suspendre la plus récente, ne rien supprimer ; parent décide de la carte canonique | l'alias/lien est consigné dans les deux traces. |
| État périmé | `observed_at` antérieur à mutation ou divergence | marquer projection `stale`, relire l'autorité | réécrire la projection avec source/revision. |
| Deux worktrees | propriétaire/branche ou hash divergent | aucun second écrivain ; ouvrir conflit, parent choisit le propriétaire | checkpoint cite le root canonique et le worktree retenu. |
| Carte archivée invisible | liste active ne contient plus l'ID | consulter index d'archive et recherche ciblée MT | résultat, `done_at`, dossier et chat restent trouvables. |
| Chat perdu | ID inaccessible ou transcript absent | reconstituer depuis STATE, checkpoint, bloc, journal et Git | documenter le chat manquant comme preuve indisponible, jamais comme résultat perdu. |

## Invariants vérifiables

- Chaque journal contient une cible stable, des préconditions et une prochaine action.
- `reconciliation_incomplete` est un état utile, pas un échec masqué.
- Un archive indexe les preuves avant de réduire la visibilité ; le dossier APEX reste à son chemin stable.
- Une projection ne peut pas mettre à jour une autorité sans relecture actuelle de cette autorité.
