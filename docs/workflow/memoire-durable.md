# Protocole opérationnel — mémoire durable Markdown / MT

La racine documentaire canonique est
`/Users/leanbot/Documents/40_Daidalon/Daidalon`. Les chemins Markdown y sont
canoniques sauf les dossiers APEX, qui restent à leur worktree métier stable.

## Autorités et écrivains

| Fait | Autorité | Écrivain |
|---|---|---|
| Carte, statut, priorité, sprint | MT Tasks | acteur autorisé, puis relecture |
| Phase, scope, blocs, checks, smokes, dette | dossier APEX | enfant/worktree métier jusqu'à `review` |
| Branche, HEAD, diff, commit | Git + filesystem | Git, mesuré seulement |
| Plan, index sprint/release, décision, archive, checkpoint | racine canonique | parent de coordination |

Une copie est une projection, jamais une coautorité. Les répertoires
`.project/templates/durable-memory/`, `.project/journals/`, `.project/runtime/`
et `.project/archives/` portent respectivement modèles, réconciliations, reprises
et index. Les documents existants ne sont pas migrés de force.

## Projections de worktree

Le [registre canonique](../../.project/runtime/canonical-projections.md) identifie
chaque `PLAN-GENERAL.md` et `sprint.md` copié avec `canonical_ref`,
`observed_at`, `observed_revision`, `freshness` et `read_only: true` par
convention. Un worktree peut stocker son pointeur local sous `.project/projections/`.
Il ne peut jamais publier le canonique en réécrivant sa copie.

- `fresh` : la copie concordait avec le canonique à l'observation.
- `stale` : une mutation ultérieure ou une divergence est connue; relire le
  canonique avant toute décision.
- `unknown` : date ou revision insuffisante; traiter comme `stale`.

## Mutation et reprise

1. Lire les autorités touchées et leurs révisions.
2. Pour une transition multi-support, créer un journal avec cible stable,
   préconditions et effet attendu.
3. Écrire une seule étape, observer l'effet, puis relire; ne pas déduire un succès
   de l'accusé d'envoi.
4. Conclure `reconciled`, `reconciliation_incomplete` ou `conflict` avec une
   prochaine action unique.
5. Après une transition significative, actualiser le checkpoint compact. Une
   reprise charge règles → checkpoint → MT → STATE → dernier bloc/preuve; les
   archives et chats ne sont ouverts que par lien.

### Timeout MT ou mutation incertaine

Ne pas renvoyer la mutation. Relire MT par `display_id` ou `external_ref`, puis
APEX et Git. Garder le journal `reconciliation_incomplete` tant que l'effet n'est
pas observé; ne reprendre que si l'absence de l'effet ou l'idempotence est prouvée.

### Carte archivée masquée

Une liste active ne suffit pas. Consulter l'[index d'archives](../../.project/archives/index.md),
puis le `display_id`, le résultat, l'external_ref et le dossier APEX stable. Le
chat absent est une preuve indisponible, jamais la perte du résultat.

## Routage et rapport parent

Chaque enfant est créé avec modèle et effort explicites, observés et attestés avant
Build. Le parent conserve le format : **Objectif**, **Réalisé**, **Décision en
attente**. Les détails de routage et de fraîcheur restent ceux de
`sprint-orchestrator`.
