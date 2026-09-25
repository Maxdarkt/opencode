# DA40-005 — Concevoir la mémoire durable de projet et le cycle Markdown/MT Tasks

Scope validé par demande utilisateur du 2026-09-06 ; MT DA40-005 todo, backlog sans sprint.
Worktree futur : /Users/leanbot/Documents/40_Daidalon/features/40-tooling ; branche 40-tooling.

# Mémoire durable de projet — besoin et briefing

2026-09-06. Besoin utilisateur confirmé : adapter et repenser dans Daidalon le workflow réellement pratiqué pour suivre tâches APEX, plans, releases, sprints, clôture, rotation et archivage. Proposition de conception à valider ; aucune implémentation livrée ni extension implicite du Sprint 1.

## Intention
Un nouvel agent ou un humain doit retrouver ce qui est prévu, décidé, livré, abandonné et encore ouvert, avec les preuves, sans relire tous les chats. MT Tasks via le connecteur est la mémoire métier visible : toute tâche APEX suivie conserve sa carte, son identifiant et son external_ref. Les documents Markdown apportent contexte, raisons, contrats et preuves.

## Répartition proposée
| Support | Responsabilité | Mise à jour |
|---|---|---|
| MT Tasks | Identifiants, statut métier, affectation sprint, priorité ; accès visuel aux cartes | Transitions explicites avec relecture |
| PLAN-GENERAL.md | Vue courte du travail courant, dépendances et prochain mouvement | Projection des autorités ; rotation à la clôture |
| sprint.md | Index des sprints, état et liens vers bilans | Création, activation et clôture |
| docs/product/releases/<version>.md | Résultat produit, critères de sortie, incréments et version réellement reçue | Décision de périmètre et réception |
| docs/product/sprints/<id>.md | Mandat, membres, démonstration, bilan, décisions et reports | Planification puis clôture |
| .project/tasks/<id>/ | Scope, STATE, Analyze/Plan, blocs, checks, smokes et dettes | Frontières de phase/bloc et interruption |
| .project/runtime/<sprint>-checkpoint.md | État compact de reprise : statuts, décisions, révisions, modèles et prochaine action | Transition significative et changement de contexte |
| docs/decisions/<id>.md (proposé) | Pourquoi une décision a été prise, alternatives, impact, décision remplacée | Décision significative ; historique explicite |
| .project/archives/ | Snapshots de rotation et index des éléments archivés | Archivage ; aucune suppression des preuves |
| Git / sessions | Code et révisions / conversations et effets observés | Autorités propres ; jamais déduits du plan |

Pas de duplication autoritative : un statut recopié porte source et date, un STATE pointe vers ses preuves, un plan résume et renvoie. Les chats soutiennent une décision mais ne doivent pas en être l'unique lieu durable. Archivage est un état de visibilité distinct du résultat accepté ; conserver done_at/résultat et membres du sprint même si l'API masque les cartes archivées.

## Cycle intelligent à concevoir
1. Une idée est inscrite avec sa provenance ; une tâche approuvée reçoit son ID MT puis son scope lié.
2. Au lancement, charger les règles projet, le checkpoint compact, le mandat du sprint et uniquement le scope/STATE/decisions nécessaires ; approfondir par liens. Ne pas injecter toutes les archives dans chaque prompt.
3. À chaque bloc significatif : consigner résultat, preuve, décision, limite et prochaine action ; conserver les checkpoints d'interruption.
4. Avant mutation : relire les autorités et leurs révisions ; écrire une intention d'opération stable ; observer les effets ; relecture après écriture. Si MT est indisponible, signaler la réconciliation incomplète sans fabriquer un succès.
5. À la réception : preuve parent, statut métier relu, synthèse du résultat et dette restante. Une tâche done ne signifie ni défaut produit corrigé hors scope, ni branche intégrée.
6. À la clôture : figer bilan/membres/SP acceptés, disposition des inachevés, fermer le sprint MT, faire la rotation du plan et archiver les cartes/chats terminés selon mandat.
7. À la reprise : détecter projections obsolètes, fichiers déplacés, décisions remplacées et écriture interrompue ; reconstruire les index sans rejouer aveuglément les effets.
8. À l’allocation : classer la charge de raisonnement et fixer explicitement Luna/Terra/Sol/Astra ainsi que l’effort. Vérifier après création le modèle réellement employé ; escalader selon preuves, jamais par importance ou taille seules.

Les Markdown restent lisibles et modifiables par un humain. Métadonnées minimales proposées : identifiant stable, type, statut documentaire, liens métier, sources/révisions, date et remplace/remplacé_par. Le format exact et la validation restent à choisir. Index/recherche peuvent être reconstruits ; aucun besoin de base vectorielle n'est établi.

## Problème particulier des worktrees
Aujourd'hui les plans sont copiés dans cinq racines ; cela expose aux divergences et aux mises à jour concurrentes. Le produit doit définir une racine documentaire canonique et des projections locales identifiées, sans rendre tous les worktrees écrivains du même fichier. Références portables résolues par le projet ; chemins absolus locaux seulement comme observation. Dossiers de tâches non déplacés à l'archivage ; liens MT stables. Ne pas imposer une architecture de stockage avant l'étude.

## Briefing proposé pour une tâche de conception
Titre : Concevoir la mémoire durable de projet et le cycle Markdown/MT Tasks.
Domaine pilote : 40-tooling ; contributions de contrat 30-agent-runtime et expérience 10-product-ui.
Placement conseillé : backlog de cadrage avant détaillage du Sprint 2, sans ajout automatique au Sprint 1 ni promesse de livraison en 0.1.
Entrées : modèle APEX/Sprint DA30-002, routine de suivi actuelle, incident des projections historiques de M0, demande utilisateur présente.
Livrables : responsabilités et arbre documentaire ; schémas/templates minimaux ; transitions et journal de réconciliation ; stratégie multi-worktree ; sélection du contexte agent ; routage déterministe des modèles et politique d’escalade ; prototype documentaire complet idée → release → sprint → tâche → reprise → clôture → archive.
Acceptation : un nouveau chat reconstitue état/décisions/preuves depuis un checkpoint compact ; timeout MT et crash entre écritures sont réconciliables ; tâche archivée retrouvable avec son résultat ; plan courant sans contradictions ; aucun effacement de preuve ; concurrence de projections expliquée ; modèle prévu et modèle observé concordent.
Hors scope : implémentation produit, refonte MT Tasks, recherche vectorielle, migration/suppression d'archives ou lancement de sprint.
Suite après validation du briefing : carte MT allouée par le connecteur, dossier APEX et plan synchronisés ; implémentation découpée après revue de conception.

Références : [routine actuelle](../workflow/suivi-sprints.md), [modèle M0](/Users/leanbot/Documents/40_Daidalon/features/30-agent-runtime/.project/tasks/DA30-002-modele-apex-sprint/modele-donnees.md), [index des sprints](../../sprint.md).

## Exécution et validation

Ne pas démarrer pendant DA40-003 : un seul écrivain actif dans 40-tooling. Type non-code, estimation à Analyze. Relire AGENTS, .project/apex.json, sources DA30-002 et routine suivi-sprints. Préserver les livrables M0 et Sprint 1.

Tests : scénario documentaire idée→carte→sprint→release→interruption→reprise→archivage ; cas MT indisponible, timeout, doublon, état obsolète, deux worktrees, carte archivée masquée et chat perdu. Vérifier liens et responsabilités. Parent valide la lisibilité et l’exhaustivité.

Risques : duplication d’autorités, dérive des index, contexte excessif et rupture des external_ref. Aucun choix de stockage définitif avant analyse ; aucun développement, migration, suppression ou acte Git sensible dans ce scope.
