# Proposition Sprint 4 — Deux tâches successives, sans parallélisme

Statut : Sprint MT `5059b73b-d8e8-40db-b9d5-1cbfb5c6424e` activé le 2026-09-10. DA40-016 et DA30-009 sont `in_progress`; les quatre autres enfants sont `todo`. Le parent `01a08063-ecac-7b10-8a50-1cb4069c5266` a réconcilié le routage `DA`, créé le worktree task-owned et lancé l'Analyze seul de DA30-009 sous Terra/medium.

## Objectif

Faire évoluer la candidate locale acceptée au Sprint 3 vers un parcours démontrable de **deux tâches successives** : chacune conserve son identité MT/APEX, sa session et son worktree; le parent sait sélectionner la tâche active suivante, conserver la précédente et ne jamais confondre les autorités.

Ce sprint matérialise la première tranche 0.2 annoncée par la release. Il reste volontairement séquentiel : une seule tâche en écriture à la fois, aucun parallélisme distribué, aucune publication.

## Périmètre proposé — 29 SP

| Ordre | Domaine | Résultat | SP | Dépendances |
|---:|---|---|---:|---|
| 1 | DA30-009 / 30 agent-runtime | Contrat de file séquentielle : tâches éligibles, tâche active, passage sûr à la suivante et refus des identités/autorités périmées | 8 | candidate Sprint 3 |
| 2 | DA20-004 / 20 workspace-git | Ownership et reprise lors du passage A → B : aucun worktree ou effet de A n’est attribué à B | 5 | contrat runtime |
| 3 | DA10-005 / 10 product-ui | Vue Sprint pour deux tâches réelles : sélection lisible, tâche active, état de la précédente et action suivante sans doublon de chat | 5 | contrats 1–2 |
| 4 | DA30-010 / 30 agent-runtime | Agrégat Sprint de métriques par tâche, avec provenance et valeurs inconnues honnêtes | 5 | contrat de file |
| 5 | DA40-015 / 40 tooling | Candidate intégrée, fixtures A/B, checks et recette parent séquentielle aux deux tailles | 3 | lots 1–4 |
| 6 | DA40-016 / 40 tooling | Orchestration, réception, mémoire durable et rotation | 3 | aucune à l’entrée |

## Contrat de produit

1. La tâche A reste consultable et ses faits restent attachés à A après activation de B.
2. B ne reçoit aucun owner, worktree, session, effet, métrique ou prochaine action de A sans liaison explicitement prouvée.
3. Un snapshot absent, expiré, malformé ou divergent reste fail-closed pour chaque tâche.
4. Le passage A → B est une transition visible et reprenable; il ne crée pas de second chat si B en possède déjà un.
5. Les métriques par tâche et l’agrégat Sprint conservent provenance, état `unknown` et absence de faux zéro.
6. Le parent rejoue A active, passage à B, reprise, divergence et refus à `1440×900` et `1024×768`.

## Exclusions

Pas de parallélisme de tâches, multi-hôte, navigateur persistant, push, tag, déploiement, paiement, budget bloquant, suppression ou réalignement de worktree. Le parallélisme sûr reste une cible 0.3 séparée.

## Risques et validations

Le risque principal est une fuite d’identité ou de métrique entre A et B. Chaque lot doit donc couvrir les transitions et l’isolation par tests; la candidate intégrée doit fournir des fixtures locales temporaires, sans modifier MT ni l’instantané canonique de production locale. Les régressions i18n hors pathset restent inventoriées, jamais masquées.

## Prochaine action

Recevoir l'Analyze de DA30-009; son premier Build, seulement après plan précis, sera routé vers Luna avec checks.
