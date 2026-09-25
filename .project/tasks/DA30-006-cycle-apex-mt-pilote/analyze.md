# Analyze — DA30-006

## Objectif et mandat

Le mandat Sprint 3 autorise une livraison locale bornée du cycle APEX durable et d'une commande
pilote minimale. Elle doit rendre lisibles séparément la phase APEX (preuve durable), le statut MT
(autorité métier) et la prochaine action, reprendre exactement une tâche existante sans doublon et
refuser les combinaisons incohérentes. Le parent conserve le smoke visuel, la clôture, les documents
canoniques de sprint et toute opération Git sensible.

## Point de départ observé

- Produit : `/Users/leanbot/Documents/40_Daidalon/features/s3-30-apex-cycle`, branche `apex-cycle`,
  base/HEAD `10e1234b3b08b986ef966f01d04e25bbf1185433`.
- Preuves stables : ce dossier dans le worktree métier `30-agent-runtime`; il est l'unique identité
  APEX de `DA30-006`, conforme à l'external_ref MT. Aucun dossier n'est dupliqué dans le worktree
  Sprint.
- MT : Sprint 3 actif `415b28cf-2d9c-4162-9be7-f6502a453b8e`; la transition effective
  `DA30-006 todo → in_progress` a été relue (update `49b95af3-a5a3-4249-a7cf-9bcecdbfadc1`,
  relecture `752cc441-0860-40f1-b7fb-b620a1bf5575`).
- Héritage Sprint 2 : `TaskBinding` porte l'identité MT/APEX/session/worktree/HEAD; `TaskExecution`
  persiste owner, fencing et effets, et `GET /global/context` retourne déjà les deux sans phase ni
  prochaine action. L'UI protège les écritures si le contexte est incomplet, divergent ou en reprise.

## Contrat retenu

Le contrat partagé est publié dans `phase-contract.md` avant le Build DA10-004. Il distingue
strictement les autorités : le pilote ne transforme ni le statut MT ni les artefacts APEX; il évalue
la prochaine étape à partir d'observations explicites. Le runtime ne prétend donc pas synchroniser
un cache MT ou analyser silencieusement un Markdown APEX. Toute action proposée conserve la clé de
reprise `mtTaskID + apexExternalRef + sessionID + worktree + HEAD`; une divergence reste refusée par
le garde `TaskBinding` déjà livré.

## Régressions à protéger

- `todo`, `in_progress`, `review`, `done` et `blocked` restent distincts des cinq phases APEX;
- Analyse → Plan → Build → Smoke → Verify a une prochaine action déterministe;
- `review` est remis au parent, `done` n'est jamais produit par l'enfant;
- un statut/phase impossible, une phase inconnue ou un contexte divergent n'offre aucune commande;
- une même observation redonne exactement la même commande et ne crée aucune binding, ownership,
  session, worktree ou carte MT.

## Risques et limites

- Le runtime local n'a pas de connecteur MT ni de lecteur Markdown APEX : le contrat transporte des
  observations, pas une fausse réplication des autorités. Une intégration ultérieure devra fournir
  une fraîcheur/une provenance, pas seulement des chaînes de caractères.
- Les actions réelles (MT, fichiers APEX, Git, serveur externe) restent hors de la commande pilote;
  elle est consultative et fail-closed.
- DA10-004 consomme le contrat publié et affiche les causes de refus; il ne doit pas déduire `done`
  d'une phase `verify` ni exécuter une mutation en un clic.
- Découverte DA30-007 reçue pendant Analyze : `task_binding` ne porte pas l'appartenance Sprint, et
  `Step.Ended.cost = 0` n'a pas de provenance tarifaire durable. DA30-006 n'agrège ni sprint ni coût
  et son contrat ne doit donc pas accepter ces données comme vérité locale. Toute extension devra
  recevoir les IDs MT autoritatifs du caller et afficher un coût `unknown`, jamais un faux zéro.

## Décision ouverte

Aucune : le scope et le mandat Sprint déterminent le périmètre. Le Build sera limité au contrat
Schema/testable et à la surface minimale nécessaire à son exposition locale.
