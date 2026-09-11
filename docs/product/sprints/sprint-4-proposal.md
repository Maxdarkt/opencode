# Proposition Sprint 4 — Deux tâches successives, sans parallélisme

Statut : Sprint MT `5059b73b-d8e8-40db-b9d5-1cbfb5c6424e` actif. Le 2026-09-11, l'utilisateur a validé la maquette isolée du cockpit : parcours aux deux tailles et zéro requête hors origine Vite. DA30-009 et DA10-006 sont `review`; le cockpit réel reste un lot lecture seule, sans action Git/agent.

## Objectif

Faire évoluer la candidate locale acceptée au Sprint 3 vers un parcours démontrable de **deux tâches successives** : chacune conserve son identité MT/APEX, sa session et son worktree; le parent sait sélectionner la tâche active suivante, conserver la précédente et ne jamais confondre les autorités.

Ce sprint matérialise la première tranche 0.2 annoncée par la release. Il reste volontairement séquentiel : une seule tâche en écriture à la fois, aucun parallélisme distribué, aucune publication. Le cockpit est d'abord validé par prototype avant que les données et actions réelles n'y soient raccordées.

## Périmètre révisé — 38 SP

| Ordre | Domaine | Résultat | SP | Dépendances |
|---:|---|---|---:|---|
| 1 | DA30-009 / 30 agent-runtime | Contrat de file séquentielle : tâches éligibles, tâche active, passage sûr à la suivante et refus des identités/autorités périmées | 8 | candidate Sprint 3 |
| 2 | DA10-006 / 10 product-ui | Maquette isolée du cockpit Sprint, validée par l'utilisateur | 3 | décision produit du 2026-09-11 |
| 3 | DA20-004 / 20 workspace-git | Ownership et reprise lors du passage A → B : aucun worktree ou effet de A n’est attribué à B | 5 | contrat runtime |
| 4 | DA20-005 / 20 workspace-git | Snapshot Git lecture seule : dépôt source, branches configurables, worktrees, cible de merge, propreté, avance/retard et stats diff | 3 | DA20-004 |
| 5 | DA30-010 / 30 agent-runtime | Métriques, fraîcheur/provenance et signaux d’attention par tâche | 5 | contrat de file |
| 6 | DA10-005 / 10 product-ui | Cockpit réel en lecture seule : pile, canvas, Task status, contexte et topologie à partir des projections | 8 | DA20-004, DA20-005, DA30-009, DA30-010 |
| 7 | DA40-015 / 40 tooling | Candidate intégrée, fixtures A/B, checks et recette parent séquentielle aux deux tailles | 3 | lots 1–6 |
| 8 | DA40-016 / 40 tooling | Orchestration, réception, mémoire durable et rotation | 3 | aucune à l’entrée |

## Contrat de produit

1. La tâche A reste consultable et ses faits restent attachés à A après activation de B.
2. B ne reçoit aucun owner, worktree, session, effet, métrique ou prochaine action de A sans liaison explicitement prouvée.
3. Un snapshot absent, expiré, malformé ou divergent reste fail-closed pour chaque tâche.
4. Le passage A → B est une transition visible et reprenable; il ne crée pas de second chat si B en possède déjà un.
5. Les métriques par tâche et l’agrégat Sprint conservent provenance, état `unknown` et absence de faux zéro.
6. Le parent rejoue A active, passage à B, reprise, divergence et refus à `1440×900` et `1024×768`.
7. Le cockpit réel reprend la hiérarchie validée : rail avec activité/attention, canvas d'outils, `Task status`, contexte vérifiable et topologie de réintégration; les données sans preuve restent `unknown`.
8. Les actions restent lecture seule, confirmation simulée ou deep-link contrôlé : aucun commit, merge, lancement d'agent ou production n'est déclenché par le cockpit de ce Sprint.

## Exclusions

Pas de parallélisme d'écrivains, multi-hôte, push, tag, déploiement, paiement, budget bloquant, suppression ou réalignement de worktree. Le cockpit représente les espaces et peut ouvrir des références existantes; il ne les exécute pas. Le parallélisme sûr et les commandes réelles restent une cible 0.3 séparée.

## Risques et validations

Le risque principal est une fuite d’identité ou de métrique entre A et B. Chaque lot doit donc couvrir les transitions et l’isolation par tests; la candidate intégrée doit fournir des fixtures locales temporaires, sans modifier MT ni l’instantané canonique de production locale. Les régressions i18n hors pathset restent inventoriées, jamais masquées.

## Prochaine action

Clôturer techniquement DA10-006 dans son worktree propre, puis lancer Analyze de DA20-004. Créer et tenir le scope DA20-005 dans un worktree propre; DA10-005 sera re-scopée depuis le contrat de livraison ci-dessous avant son Analyze. DA30-009 reste en review code, avec smoke UI intégré réservé à DA40-015.
