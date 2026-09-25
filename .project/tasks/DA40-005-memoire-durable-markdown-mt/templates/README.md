# Modèles Markdown minimaux

Copier le modèle adapté dans la racine canonique définie par `memoire-durable.md`. Les champs `authority`, `sources` et `observed_at` sont obligatoires dès qu'un document projette un état externe.

## `PLAN-GENERAL.md`

```md
# <projet> — plan général

Mis à jour : <ISO-8601>. Autorité métier : MT Tasks ; cette vue est une projection.

## Travail courant
| Carte | Domaine | Statut MT observé | Dépendance / prochaine action | Source |
|---|---|---|---|---|
| <ID> | <code> | <status@date> | <action> | <external_ref> |

## Décisions actives
- <decision-id> — <résumé>.

## Historique rotaté
- <sprint/release> — <bilan + archive>.
```

## `docs/product/releases/<release>.md`

```md
---
id: release-<version>
type: release
document_status: active
authority: product-docs
sources: []
observed_at: <ISO-8601>
supersedes: []
superseded_by: null
---
# Release <version> — <nom>

## Mandat et critères de sortie
## Incréments / sprints
## Résultat réellement reçu
## Décisions, limites et prochaine décision
```

## `docs/product/sprints/<sprint>.md`

```md
---
id: <sprint-ref>
type: sprint
document_status: active
authority: product-docs
mt: { project: DA, sprint_ref: <ref>, status_observed: <status> }
sources: [<mt-list request/revision>]
observed_at: <ISO-8601>
---
# <sprint> — <objectif>

## Mandat, début et propriétaire
## Membres (ID MT, external_ref, statut relu)
## Démonstration et preuves reçues
## Reports et dettes
## Clôture / lien d'archive
```

## `.project/tasks/<id>-<slug>/STATE.md`

```md
# STATE — <ID>

- Phase APEX : <allocated|analyze|plan|build|smoke|verify|review|closed>.
- Statut MT observé : `<status>` ; source/relecture : <request-id, date>.
- Écrivain et worktree : <owner>, <relative root>, branche/HEAD observés <...>.
- Bloc actif ou dernier bloc : <path + résultat>.
- Décisions / limites : <liens>.
- Checks/smokes : <commande + résultat + preuve>.
- Réconciliation : <reconciled|incomplete|conflict>, <journal lien>.
- Prochaine action exacte : <une action>.
- Reprise : <prompt compact, liens uniquement nécessaires>.
```

## `.project/runtime/<sprint>-checkpoint.md`

```md
# Checkpoint compact — <sprint ou tâche>

Mis à jour : <ISO-8601>. Fraîcheur : <fresh|stale|unknown>.

## Objectif et autorité relue
- MT : <request/revision> ; APEX : <STATE> ; Git : <HEAD/status>.

## État utile
| ID | MT | APEX | décision/bloc | prochaine action |
|---|---|---|---|---|

## Routage observé
- Demandé : <model/effort>; observé : <model/effort>; attestation : <source>.

## Blocages, dettes et liens de preuve
## Reprise minimale
1. <action unique>
```

## `docs/decisions/<id>.md`

```md
---
id: DEC-<nnn>
type: decision
document_status: active
authority: decision-record
sources: [<evidence links>]
observed_at: <ISO-8601>
supersedes: []
superseded_by: null
---
# DEC-<nnn> — <titre>

## Contexte et décision
## Alternatives écartées
## Effets, propriétaire, date de révision
## Preuves et documents impactés
```

## `.project/journals/<operation-id>.md`

```md
---
id: OP-<stable-id>
type: reconciliation-journal
document_status: active
authority: operation-owner
observed_at: <ISO-8601>
---
# OP-<stable-id> — <transition>

## Intention idempotente
- cible : <display_id/external_ref>; propriétaire : <acteur>.
- préconditions : <MT/APEX/Git revisions>.
- effet attendu : <transition>.

## Étapes observées
| Étape | Support | Effet observé | Preuve | État |
|---|---|---|---|---|

## Conclusion
- `reconciled|reconciliation_incomplete|conflict`; prochaine action : <...>.
```

## `.project/archives/<period>/index.md`

```md
# Archive — <period>

Archivage le <date>, après résultat `done` relu. Cet index ne supprime aucun dossier APEX.

| ID MT | Résultat | Dossier APEX stable | Bilan / décision | Chat ID | Motif de visibilité |
|---|---|---|---|---|---|

## Snapshot du plan sortant
- <lien, hash/revision, date>.
```
