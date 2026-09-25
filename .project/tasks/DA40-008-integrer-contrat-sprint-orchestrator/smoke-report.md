# Smoke report — DA40-008

Date : 2026-09-07. Type : recette locale documentaire du skill; aucun sprint, carte, chat, runtime
de sprint, produit ou UI n'a été créé/modifié.

| Scénario | Méthode | Résultat |
|---|---|---|
| Structure du skill | `quick_validate.py` sur le dossier global | PASS — le validateur est vert via un chargeur YAML éphémère compatible avec son unique front matter; son invocation directe reste bloquée par l'absence préexistante de `PyYAML`, sans installation. |
| Liens et ressources | résolution locale des liens Markdown de `SKILL.md`, du contrat et de la ressource ajoutée | PASS — 3 fichiers inspectés, aucun lien manquant. |
| Routage | simulation locale des quatre classes de difficulté | PASS — inventaire→Luna low–medium; orchestration standard→Terra medium–high; migration/incident difficile→Sol high; Astra seulement pour difficulté exceptionnelle confirmée. |
| Attestation | simulation de lancement | PASS — `model` et `thinking` explicites, demandé/observé/motif/horodatage consignés; divergence ou absence d'observation arrête avant Build. |
| Reprise | simulation `fresh`, divergence `stale`, effet inconnu | PASS — relecture ciblée des autorités, journal/réconciliation et aucun rejeu de mutation inconnue. |
| Régression d'orchestration | recherche des clauses baseline avant/après | PASS — cache non autoritatif/reconstruisible, un owner/worktree, chat arrêté non bloquant, visual smoke parent, interdictions Git et archivage explicite conservés. |

## Commandes et résultats

- `.../python3 quick_validate.py ...` : arrêté avant validation avec `ModuleNotFoundError: yaml`;
  limitation de runtime préexistante et non corrigée par installation.
- Le même `quick_validate.py` exécuté avec un module YAML minimal éphémère, limité au front matter
  simple du skill : `Skill is valid!`.
- Résolution des liens + quatre scénarios + invariants :
  `PASS links=3 routing_scenarios=4 resume_attestation=present`.
- `rg` de préservation : les six invariants baseline sont présents aux clauses relevées du skill.

## Pass B / visual smoke parent

Non requis : le résultat est une instruction Markdown sans surface graphique, route applicative,
viewport, fixture, compte ni état interactif. Si le parent souhaite une vérification additionnelle,
il peut ouvrir les trois fichiers du skill, suivre un lancement fictif sans appel de création, puis
vérifier que la ressource conditionnelle est lue seulement pour lancement/reprise. Les bords de
régression sont les autorités, worktree, permissions, smoke parent et archivage déjà contrôlés.

## Verdict

PASS technique documentaire. Le prochain propriétaire est le parent pour la revue du diff de skill;
l'enfant demande seulement la transition `review`, jamais `done`.

## Correctif C01 — onboarding projet

| Scénario | Méthode | Résultat |
|---|---|---|
| Structure + liens | `quick_validate.py` compatible et résolution des ressources du skill | PASS — 4 fichiers inspectés, aucun lien manquant. |
| Projet absent | simulation locale sans profil ni layout durable | PASS — le guide prescrit une tâche bootstrap tracée et l'obtention MT avant les chemins canoniques. |
| Projet partiel | simulation avec instructions/profil/tâches mais sans profil complet | PASS — le guide impose inventaire des autorités, ajout incrémental et conservation des preuves héritées. |
| Projet complet | simulation de tous les éléments du profil cible | PASS — le guide demande seulement une observation et l'orchestration normale, sans remigration. |
| Portabilité/permissions | recherche des chemins/IDs locaux et des garde-fous | PASS — aucun chemin absolu ni ID Daidalon; aucune permission, autorité ou règle d'archivage assouplie. |

Commande : `PASS links=4 classifications=absent,partial,complete`. La validation structurelle garde
la même limite connue : le script fourni nécessite un chargeur YAML éphémère parce que `PyYAML` est
absent des runtimes locaux; aucune dépendance n'a été installée.
