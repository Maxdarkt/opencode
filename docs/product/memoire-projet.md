# Mémoire durable de projet — besoin et briefing

2026-09-07. Besoin utilisateur confirmé, conception reçue dans DA40-005, contrat intégré au skill par DA40-008, puis protocole adopté sans migration destructive par DA40-009 : workflow Markdown/MT, autorités, modèles, réconciliation, reprise et routage modèle sont opératoires. Aucun Sprint 2 n'est lancé implicitement.

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
| docs/decisions/<id>.md (proposé) | Pourquoi une décision a été prise, alternatives, impact, décision remplacée | Décision significative ; historique explicite |
| .project/archives/ | Snapshots de rotation et index des éléments archivés | Archivage ; aucune suppression des preuves |
| Git / sessions | Code et révisions / conversations et effets observés | Autorités propres ; jamais déduits du plan |

Pas de duplication autoritative : un statut recopié porte source et date, un STATE pointe vers ses preuves, un plan résume et renvoie. Les chats soutiennent une décision mais ne doivent pas en être l'unique lieu durable. Archivage est un état de visibilité distinct du résultat accepté ; conserver done_at/résultat et membres du sprint même si l'API masque les cartes archivées.

## Cycle intelligent à concevoir
1. Une idée est inscrite avec sa provenance ; une tâche approuvée reçoit son ID MT puis son scope lié.
2. Au lancement, charger les règles projet, le plan courant, le mandat du sprint, la release et uniquement le scope/STATE/decisions nécessaires ; approfondir par liens. Ne pas injecter toutes les archives dans chaque prompt.
3. À chaque bloc significatif : consigner résultat, preuve, décision, limite et prochaine action ; conserver les checkpoints d'interruption.
4. Avant mutation : relire les autorités et leurs révisions ; écrire une intention d'opération stable ; observer les effets ; relecture après écriture. Si MT est indisponible, signaler la réconciliation incomplète sans fabriquer un succès.
5. À la réception : preuve parent, statut métier relu, synthèse du résultat et dette restante. Une tâche done ne signifie ni défaut produit corrigé hors scope, ni branche intégrée.
6. À la clôture : figer bilan/membres/SP acceptés, disposition des inachevés, fermer le sprint MT, faire la rotation du plan et archiver les cartes/chats terminés selon mandat.
7. À la reprise : détecter projections obsolètes, fichiers déplacés, décisions remplacées et écriture interrompue ; reconstruire les index sans rejouer aveuglément les effets.

Les Markdown restent lisibles et modifiables par un humain. Métadonnées minimales proposées : identifiant stable, type, statut documentaire, liens métier, sources/révisions, date et remplace/remplacé_par. Le format exact et la validation restent à choisir. Index/recherche peuvent être reconstruits ; aucun besoin de base vectorielle n'est établi.

## Problème particulier des worktrees
Aujourd'hui les plans sont copiés dans cinq racines ; cela expose aux divergences et aux mises à jour concurrentes. Le produit doit définir une racine documentaire canonique et des projections locales identifiées, sans rendre tous les worktrees écrivains du même fichier. Références portables résolues par le projet ; chemins absolus locaux seulement comme observation. Dossiers de tâches non déplacés à l'archivage ; liens MT stables. Ne pas imposer une architecture de stockage avant l'étude.

## Briefing proposé pour une tâche de conception
Titre : Concevoir la mémoire durable de projet et le cycle Markdown/MT Tasks.
Domaine pilote : 40-tooling ; contributions de contrat 30-agent-runtime et expérience 10-product-ui.
Placement conseillé : backlog de cadrage avant détaillage du Sprint 2, sans ajout automatique au Sprint 1 ni promesse de livraison en 0.1.
Entrées : modèle APEX/Sprint DA30-002, routine de suivi actuelle, incident des projections historiques de M0, demande utilisateur présente.
Livrables : responsabilités et arbre documentaire ; schémas/templates minimaux ; transitions et journal de réconciliation ; stratégie multi-worktree ; sélection du contexte agent ; prototype documentaire complet idée → release → sprint → tâche → reprise → clôture → archive.
Acceptation : un nouveau chat reconstitue état/décisions/preuves ; timeout MT et crash entre écritures sont réconciliables ; tâche archivée retrouvable avec son résultat ; plan courant sans contradictions ; aucun effacement de preuve ; concurrence de projections expliquée.
Hors scope : implémentation produit, refonte MT Tasks, recherche vectorielle, migration/suppression d'archives ou lancement de sprint.
Suite après validation du briefing : carte MT allouée par le connecteur, dossier APEX et plan synchronisés ; implémentation découpée après revue de conception.

Références : [routine actuelle](../workflow/suivi-sprints.md), [modèle M0](/Users/leanbot/Documents/40_Daidalon/features/30-agent-runtime/.project/tasks/DA30-002-modele-apex-sprint/modele-donnees.md), [index des sprints](../../sprint.md).

## Matérialisation

Briefing validé, carte DA40-005 créée au backlog le 2026-09-06. [Scope](/Users/leanbot/Documents/40_Daidalon/features/40-tooling/.project/tasks/DA40-005-memoire-durable-markdown-mt/scope.md). Aucun ajout au Sprint 1 ni démarrage de cette conception.

## Protocole adopté

La racine documentaire canonique est `Daidalon/`; les plans et index présents dans
les worktrees sont des projections read-only, conservées sans réécriture
rétroactive. Les modèles versionnés, la décision, le registre de fraîcheur,
checkpoint, journal et index d'archives se trouvent dans la racine canonique.
Voir le [protocole opérationnel](../workflow/memoire-durable.md) et la
[décision DA40-009](../decisions/DEC-DA40-009-canonical-memory-root.md).
