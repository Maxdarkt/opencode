# Analyze — DA10-002

Mandat parent courant 01a076a4-b458-72a3-8e2b-bf975091a840 reçu le 2026-09-06. Gates autonomes dans scope selon sprint-child-handoff. Racine 10-product-ui, HEAD 702bf7dcd7468638c17fd95b110deb38bd253e9a ; index vide. Empreintes héritage dans evidence/initial-dirty.json. MT trois dépendances done relues eb8c4c2f ; début Analyze / update in_progress b9687b74.

## Faits et choix
- home-controller.add appelle file.list puis initGit lorsque vide ; sélection/persistance précèdent la réponse et catch silencieux.
- useDirectoryPicker utilise le sélecteur historique sur web ; le V2 existant sépare navigation et sélection mais ne désactive pas la confirmation après saisie non naviguée. Réutiliser le V2 sur web, conserver son mode fichier et le picker natif desktop.
- Le projet courant est résolu par api.project.current ; la validation de disponibilité/canonical exige global.context DA20. Aucun fallback directory vers cwd ni base HEAD inventée.
- Backend pilote V1 server-compat : seul sdk.client.global.context (SDK legacy) possède le contrat DA20 ; sdk.api et ses gardes V2 ne conviennent pas. Contrat lu dans 20-workspace-git, non importé/copié.
- Commit DA20 2d973aeaf6a289ba1f343663a758d7c70b1bcc11 absent ici ; aucune intégration autorisée. UI4440/API4140 existants servent 40-tooling, aucun restart.

## Scope et protections
Ouverture explicite, aucun initGit implicite, erreurs visibles, réponses obsolètes ignorées, confirmation du chemin, puis contexte demandé/canonique/session/Git après décision d'intégration. Préserver récents et historique des dossiers absents. Aucun changement session/timeline avant benchmark production requis. Pas de redesign, parité OS, lease, routage V2 ni réparation.

## Gate
Analyze validé autonomement pour B01/B02 indépendants. Contrat accepté comme spécification ; B03/B04 suspendus à décision parent sur candidate et environnement. Découvertes et désynchronisations des projections signalées au parent. Les autorités hors worktree restent au parent.
