# Analyze — DA10-003

## Objectif et autorité

Afficher le contexte actif réel d’une session et refuser visuellement toute écriture quand la
concordance n’est pas prouvée. Le message parent du 2026-09-07 autorise Analyze, Plan, Build,
checks, smoke technique, commit local borné et remise en review; la carte MT est relue
`in_progress` par `c0916998-44fe-433e-af54-478559f4cdc6`.

## Faits relus

- `ActiveProjectContext` lit déjà `GET /global/context` et affiche dossier/session/Git.
- DA20 fournit `TaskBinding.get({ type: "session", value })`, contenant tâche, projet Core,
  session, worktree, branche et HEAD.
- DA30 fournit `TaskExecution.get(mtTaskID)`, contenant owner, génération et effets
  `pending|confirmed`; aucune route HTTP/UI ni historique de conflit n’est livré par DA30.
- Le champ sprint n’est pas porté par les contrats DA20/DA30. L’UI doit donc le signaler comme
  indisponible/incomplet, pas l’inventer.

## Décision et risques

Le pathset ajoute une projection HTTP en lecture seule au contrat `LocalContext.Info` existant.
Elle ne modifie ni `TaskBinding`, ni `TaskExecution`, ni Git : le handler retrouve le binding par
session, puis son snapshot d’exécution. C’est l’intégration finale explicitement hors pathset
DA20/DA30 et nécessaire à DA10.

Risques protégés : absence de binding/exécution, divergence session/worktree/branche/HEAD et effet
pending doivent rester visibles et désactiver l’écriture. Un conflit/fencing non persistant ne peut
pas être réinventé : l’UI qualifie les faits observables de divergence ou reprise nécessaire.

## Régressions et smoke

- test HTTP : observation sans binding reste valide et non mutatrice;
- tests UI purs : concordant, incomplet, divergent et reprise bloquent/autorise l’écriture selon les
  faits;
- smoke parent : candidate locale, fixture binding+owner, viewport 1440×900 puis 1024×768,
  vérification des champs et des états sans action de réparation.

## Questions ouvertes

Aucune décision métier : les limites du sprint et du contrat imposent déjà une présentation
fail-closed.
