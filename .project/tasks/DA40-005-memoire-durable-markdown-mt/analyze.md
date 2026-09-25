# Analyze — DA40-005

Date : 2026-09-07. Modèle attesté par le parent : `gpt-5.6-terra`, effort `high`.

## Objectif

Concevoir un protocole documentaire durable qui permet de retrouver, reprendre, réconcilier et archiver le travail Daidalon sans faire d'un chat ou d'un cache une autorité. Le pilote porte sur Markdown + MT Tasks ; il ne crée ni runtime, ni stockage vectoriel, ni migration.

## Constats mesurés

- Le profil est `tracked` (`.project/apex.json`) : MT, le dossier APEX et le plan sont trois projections à tenir cohérentes ; MT alloue les identifiants.
- MT a été relu avant et après transition : `DA40-005`, external_ref `.project/tasks/DA40-005-memoire-durable-markdown-mt`, worktree `40`, backlog sans sprint, est passé de `todo` à `in_progress` (requêtes `68a09be3-8178-4427-8d38-22ed25105a25`, `8f2ef1ba-194a-448b-b75f-ad4a098ac3dc`, `86124303-56ed-46cf-b4b2-27b57240d5e0`).
- La routine de suivi impose déjà : MT = statut métier, APEX = phases/preuves, Git = faits Git ; checkpoint compact, relecture post-transition et archivage distinct de `done`.
- DA30-002 apporte les invariants utiles : un seul écrivain actif, external_ref stable, journal d'opération, projection reconstruisible et reprise par observation plutôt que rejeu.
- Le Sprint 1 est clos ; les archives conservent son roster parce que les cartes archivées peuvent disparaître des listes. DA40-005 reste hors sprint, donc ce travail ne lance ni Sprint 2 ni release.
- Worktree observé : branche `40-tooling`, HEAD `b7111b6e973d7200e70990c6f32a1a4d4b4a64de`; état sale hérité : 13 fichiers suivis modifiés (STATE historiques, `AGENTS.md`, `PLAN-GENERAL.md`, log DA40-003) et des archives/livrables M0 non suivis, plus le dossier DA40-005 initialement non suivi. Aucun de ces chemins tiers n'est modifié par cette tâche.

## Portée

Inclus : contrat d'autorité, arbre et modèles Markdown, journal de transition/réconciliation, propriété multi-worktree, sélection de contexte, routage des modèles, prototype E2E, scénarios de panne et contrôles documentaires.

Exclus : code produit/runtime, modification du connecteur MT, base vectorielle, migration/nettoyage/suppression d'archives, démarrage de sprint, changement des projections globales ou du skill installé `sprint-orchestrator`.

## Risques et protections

| Risque | Protection du prototype |
|---|---|
| Deux autorités pour un statut | Table d'autorité par champ et copies datées/non autoritatives. |
| Écriture concurrente de worktrees | Racine canonique unique, propriétaire déclaré, projections lecture seule. |
| Timeout/crash entre MT et Markdown | Journal d'opération avec préconditions, effets observés et état `reconciliation_incomplete`. |
| Contexte démesuré ou chat perdu | Checkpoint court, paquet de reprise déterministe, approfondissement par liens. |
| Escalade de modèle arbitraire | Grille Luna → Terra → Sol → Astra, preuve d'échec/difficulté et attestation du modèle observé. |

## Décision de production

Le parent a explicitement validé la poursuite après l'attestation du modèle. Les blocs suivants produisent uniquement les spécifications et modèles sous ce dossier APEX. Les propositions qui toucheraient le skill global ou les fichiers parent sont formulées comme changements à revoir, non appliqués.
