# Smoke report — B5

## Environnement et lancement

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/s2-integration`.
- HEAD : `9d0decb2be8abd1d7e7a31b28117572b0d873606`; branche `sprint2-integration`.
- `.make.env` ignoré et conservé : code `51`, backend `127.0.0.1:4151`, UI
  `127.0.0.1:4451`.
- `make config-check`, `make context`, `make ports`, `make preflight-ports` et
  `DRY_RUN=1 make dev` : PASS; commandes et ports résolus exactement.
- `make dev` : Vite 7.1.4 prêt sur `4451`; backend prêt sur `4151`. Le backend sans mot de passe
  est resté limité à loopback pour ce smoke local.

## Smoke live

- `GET /global/health` : 200, `{ healthy: true, version: "local" }`.
- `GET /global/context` pour le worktree avec la base explicite : 200; racine, branche, HEAD et base
  exacts, `dirty: true` attendu pour C1/C3/C4, `conflicts: false`, `review: changed`.
- UI `/` : 200, `text/html`.
- Contexte d'un chemin absent : 200 avec `availability: absent`, `git: null`, `task: null`; le chemin
  n'a pas été créé.

## Scénarios isolés sans effet externe

- Core binding/ownership : 19 tests, 106 assertions — PASS. Couvre adoption exacte/concordance,
  refus des divergences, gagnant unique concurrent, fencing, effets pending/confirmed et reprise
  d'un effet uncertain seulement après résolution.
- HTTP local-context : 2 tests, 20 assertions — PASS. Couvre répertoire explicite, absence
  d'initialisation et comparaison de la session persistée avec le répertoire demandé.
- App : 13 tests, 46 assertions — PASS. Couvre concordant, incomplete, divergent, resuming,
  blocage d'écriture, zéro prompt lors du refus et restauration exacte brouillon/contexte.
- Aucun compte externe, paiement, intégration distante ou appel modèle.

## Arrêt

Listeners observés avant arrêt : backend PID `49420`, UI PID `49421`. `Ctrl-C` a arrêté la seule
session `make dev` lancée par B5; son code 130 est l'arrêt intentionnel. Les deux PIDs ont disparu,
aucun listener ne reste et `make preflight-ports` repasse. `.make.env` est conservé pour le parent.

## Plan visuel parent

Précondition : lancer `make dev`, ouvrir `http://127.0.0.1:4451` et utiliser une session locale liée
à une tâche, sans envoyer de prompt modèle. Répéter à `1440×900`, puis `1024×768`.

1. État concordant : vérifier projet, tâche, session, worktree, branche, HEAD, owner, génération et
   effets. Le sprint peut apparaître « indisponible » dans l'implémentation actuelle; le relever sans
   l'inventer. Attendre `data-active-task-state="concordant"` et aucun avertissement de blocage.
2. Fixture HEAD divergent : faire pointer le binding sur un HEAD différent du Git observé. Attendre
   `divergent`, alerte visible et écriture bloquée. Saisir un brouillon, tenter l'envoi, capturer
   écran + réponse `/global/context`; vérifier aucune requête prompt et brouillon intact.
3. Fixture effet pending : restaurer le HEAD puis exposer un effet `pending`. Attendre `resuming`,
   même refus, zéro écriture et brouillon/contexte conservés. La résolution uncertain se valide par
   le scénario Core; elle n'est pas un état UI distinct.
4. Reprise : restaurer ownership/effets concordants, rafraîchir le contexte et vérifier disparition
   de l'alerte sans envoyer de prompt.

Captures attendues pour chaque viewport : concordant initial, refus divergent, refus pending et
reprise. Conserver les traces réseau `GET /global/context`, l'absence de POST prompt aux refus et la
preuve avant/après du texte de brouillon.

## Limites et reprise

Le jugement visuel et la manipulation des fixtures appartiennent au parent. Dettes non bloquantes :
deux `event-manifest` suivis par DA30-005 et 35 warnings App antérieurs à la base. B6 n'est pas
commencé.
