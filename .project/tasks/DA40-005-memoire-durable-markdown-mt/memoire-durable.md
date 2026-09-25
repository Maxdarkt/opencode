# Mémoire durable Markdown / MT Tasks — protocole proposé

Statut : proposition documentaire, pilote DA40-005. Adoption par la racine canonique et tout changement du skill `sprint-orchestrator` : décision parent séparée.

## 1. Principes non négociables

1. **Une autorité par fait.** Une copie est une projection et porte sa source, sa date/revision observée et sa fraîcheur.
2. **Un seul écrivain par fichier canonique.** Un worktree produit les fichiers de ses tâches ; une seule racine documentaire publie les vues projet. Les autres worktrees ne modifient pas les projections.
3. **Aucun succès sans observation.** Toute mutation multi-supports passe par intention, écriture, observation, relecture et réconciliation.
4. **Aucune preuve effacée.** L'archivage retire de la vue courante, jamais du dossier APEX, du journal ou de l'index d'archive.
5. **Le contexte est jetable.** Les chats soutiennent le travail mais les checkpoints, décisions et preuves permettent une reprise sans transcript.

## 2. Autorités et projections

| Fait | Autorité d'écriture | Projection autorisée | Règle |
|---|---|---|---|
| ID, titre, priorité, assignee, statut métier, sprint | MT Tasks | plan, sprint, STATE, checkpoint | Toujours citer `display_id`, `external_ref`, `observed_at`; relire après mutation. |
| Scope, phase APEX, blocs, checks, smoke, dette, prochaine action | `.project/tasks/<id>/` | MT description, plan, checkpoint | L'enfant écrit jusqu'à `review`; seul le parent fait `done`/archive. |
| Mandat/résultat de release et sprint | documents canoniques projet | plan/checkpoint/projections worktree | La liste MT est relue, mais ne remplace pas le bilan Markdown. |
| Décision et remplacement | `docs/decisions/` canonique | STATE/checkpoint | Immuable dans le fond : une décision remplacée pointe vers sa remplaçante. |
| HEAD, branche, diff, commit | Git + filesystem | STATE/checkpoint | Observé, daté ; jamais déduit du plan. |
| Placement, session, cache runtime | runtime/session | checkpoint | Cache reconstruit et non autoritatif. |
| Conversation | système de chats | checkpoint avec ID/résultat | L'absence du chat ne supprime pas le résultat durable. |

## 3. Arbre cible et propriété

La **racine documentaire canonique** est le checkout projet de coordination (aujourd'hui `Daidalon/`). Les chemins ci-dessous sont relatifs à cette racine ; ils restent portables. Un chemin absolu peut figurer dans une observation, jamais comme identifiant.

```text
PLAN-GENERAL.md                         # projection courte du travail ouvert
sprint.md                               # index des sprints et liens de bilans
docs/
  product/releases/<release>.md         # mandat, réception, incréments
  product/sprints/<sprint>.md            # mandat, membres, bilan, reports
  decisions/<decision-id>.md             # décision durable et remplacements
.project/
  runtime/<sprint>-checkpoint.md         # paquet court de reprise, reconstruisible
  tasks/<display-id>-<slug>/             # propriété du worktree métier alloué
    scope.md STATE.md analyze.md plan.md blocs/ smoke-report.md debts.md
  archives/<period-or-sprint>/           # index + snapshots de rotation, jamais suppressif
  journals/<operation-id>.md             # intentions/effets/réconciliation si nécessaire
```

| Zone | Propriétaire écriture | Autres worktrees |
|---|---|---|
| `.project/tasks/DA40-*` | worktree `40-tooling` affecté par MT | Lisent via chemin canonique ; ne copient pas le STATE pour le modifier. |
| `.project/tasks/DA10-*`, `20-*`, `30-*` | worktree métier correspondant | Même règle. |
| `PLAN-GENERAL.md`, `sprint.md`, `docs/product/*`, `docs/decisions/*`, `.project/runtime/*`, `.project/archives/*` | parent de coordination, dans la racine canonique | Projections explicitement marquées lecture seule ; aucune édition concurrente. |
| `.project/journals/*` | acteur qui détient l'opération, puis parent à la clôture | Création seulement après propriétaire/chemin confirmés. |

Les projections actuellement copiées dans les worktrees sont transitoires : elles doivent contenir `canonical_ref`, `observed_at`, `observed_revision` et `read_only: true`. Une projection périmée est un signal de relecture, jamais une permission d'écraser le canonique.

## 4. Métadonnées Markdown minimales

Chaque document canonique commence par un front matter lisible :

```yaml
---
id: DA40-005
type: task-state
document_status: active # active | superseded | archived
authority: apex
mt:
  project: DA
  display_id: DA40-005
  external_ref: .project/tasks/DA40-005-memoire-durable-markdown-mt
sources:
  - kind: mt-task
    revision: request-id-or-observed-at
observed_at: 2026-09-07T00:00:00+02:00
supersedes: []
superseded_by: null
---
```

Les documents APEX existants peuvent rester sans front matter : le modèle s'applique aux nouvelles créations ou aux révisions explicitement décidées, sans migration forcée.

## 5. Transition et journal de réconciliation

Une transition produit un journal seulement lorsqu'elle traverse plusieurs autorités, échoue, ou est sensible (statut, sprint, clôture, archivage). Une modification locale d'un bloc peut rester tracée dans `STATE.md`.

1. **Lire** les autorités et noter leurs révisions/observations.
2. **Formuler l'intention idempotente** : cible exacte, transition, préconditions, propriétaire et effet attendu.
3. **Écrire un support** avec une clé stable (`operation_id`, `display_id`, `external_ref`).
4. **Observer** le résultat effectif ; ne pas inférer depuis l'accusé d'envoi.
5. **Écrire/réconcilier l'autre support** avec la source de l'observation.
6. **Relire toutes les autorités nécessaires** ; conclure `reconciled`, `reconciliation_incomplete` ou `conflict` et consigner la prochaine action.

L'ordre privilégié lors d'un lancement enfant est MT `todo → in_progress`, relecture MT, puis APEX `Analyze`. À la réception : APEX preuves → parent review → MT `done` → relecture MT → bilan/document de sprint → archive seulement après la rotation approuvée. Il n'existe pas de transaction atomique MT/Markdown/Git.

## 6. Contexte et reprise

Un nouveau chat charge en ordre, en s'arrêtant dès que la question est résolue :

1. règles `AGENTS.md`, profil APEX et chemin du worktree ;
2. checkpoint compact de sprint ou de tâche ;
3. carte MT relue et `STATE.md` de la tâche ;
4. scope, dernière décision active, dernier bloc/check/smoke ;
5. Git/MT spécifiques à la prochaine mutation ;
6. archives, logs ou chats seulement par lien de preuve ciblé.

Le checkpoint tient idéalement en moins de 120 lignes et contient : objectif, autorité/heure de relecture, tâches/statuts, décisions actives, HEAD/baseline pertinents, modèle observé, blocage/dette et **prochaine action unique**. Il ne recopie pas les logs ; il lie l'évidence.

Avant reprise, comparer le checkpoint aux autorités. Une divergence rend le checkpoint `stale`; le nouveau chat ouvre un journal de réconciliation et ne rejoue aucune mutation inconnue.

## 7. Routage déterministe des modèles

| Classe de travail démontrée | Modèle / effort initial | Escalade permise |
|---|---|---|
| Inventaire ciblé, mise à jour mécanique, vérification documentaire | `gpt-5.6-luna` / low à medium | Terra si plusieurs autorités ou raisonnement insuffisant observé. |
| Implémentation standard, orchestration, documentation de conception | `gpt-5.6-terra` / medium à high | Sol si arbitrage/échec technique démontré. |
| Migration risquée, bug difficile, arbitrage d'architecture complexe | `gpt-5.6-sol` / high | Astra seulement après limite/échec raisonné consigné. |
| Difficulté exceptionnelle confirmée | `gpt-6-astra` / high+ | Pas d'escalade automatique. |

À la création : fixer `model` **et** `thinking`, puis lire les métadonnées de session. Consigner `requested_model`, `requested_effort`, `observed_model`, `observed_effort`, horodatage, motif et divergence. Si le modèle observé est indémontrable ou divergent, ne pas commencer Build : le parent vérifie/corrige les métadonnées. La taille, l'urgence et l'importance métier ne suffisent pas à déclencher une escalade.

## 8. Changement proposé au skill global (non appliqué)

Ajouter au contrat `sprint-orchestrator` : « Toute création de tâche fixe modèle/effort, atteste le modèle observé avant Build, inscrit un checkpoint compact avec décisions/next action et applique la grille d'escalade ci-dessus. » Cette proposition est volontairement confinée ici : elle doit être revue puis intégrée par le parent dans le skill installé, jamais modifiée depuis ce worktree.
