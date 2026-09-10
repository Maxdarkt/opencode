# Analyze — DA40-011 Candidate intégrée Sprint 2

## Objectif et autorité

Assembler sur `sprint2-integration`, depuis la baseline
`9ba850b68b49bd20e2e40d24ceba39dd5fb19af2`, les commits acceptés DA20-003,
DA30-004 puis DA10-003. Le mandat parent autorise Analyze, Plan, Build, les checks, le smoke
technique et un commit local borné; il exclut staging, push, merge/rebase des branches métier,
promotion, reset, nettoyage destructif et suppression de worktree.

MT est l'autorité métier : DA40-011 est `in_progress` et les trois sources `done` selon
`85bbb204-967c-439e-af96-4e1ff113d323`. Le parent attribue la transition
`todo → in_progress` à `d9fa2d57-b123-4d90-88b2-e91252eec766`.

## Entrées acceptées et provenance

- DA20-003 : `a70bf26adc4ece7645e3654452c0f034f78d05ac`, parent exact baseline, 19 chemins.
- DA30-004 : `1de05c0239357fb5796935460b89bfd9deec939b`, 21 chemins. Son parent
  `eceeb7dd7734f60491e09cdac72fa297993f4c4b` a le même arbre
  `704fb7c5d534470d75a413f3804e5c4566a73edb` et le même patch-id que DA20 source.
- DA10-003 : huit commits linéaires, dans l'ordre : `bafde2951518309d176809fc460dddd7386da3a5`,
  `213cccd97c4a40a080bf3a91e74232216c8e29a6`,
  `6f7cace528bd3ffb7c6ed2269d4100311f9563f8`,
  `5247b61c456fa29a9b0f33ba6817c5355d024e12`,
  `c7079f2ca849e3b29155ad7e19629624652040e0`,
  `9c9dcb7172ed4f0e6c2559a12846ea1490bbb8f3`,
  `6cc3f03fc5ed437c867c106944b46cbd56a46583`,
  `f4b7b44d81d22e020b1c1f259e73385ee74c2665`. Leur parent de départ
  `b914e645aee0643ee430fbf18d4f8d943315e030` a le même arbre
  `df640bf46386feeda42b95adf8b71147ba7fef42` et le même patch-id que DA30 source.

La suite reconstitue les arbres sources sans reprendre les cherry-picks intermédiaires. Les pathsets
portent Schema/Core/migrations, OpenCode/HTTP, App/UI, SDK généré et preuves APEX. Aucun chemin de la
chaîne ne chevauche le dirty courant.

## Contrats à préserver

- Binding DA20 : identité exacte tâche/external_ref/session/projet/location/dépôt/branche/worktree/HEAD;
  `adopt` et `resume` idempotents; divergence refusée avant mutation.
- Ownership DA30 : propriétaire unique, génération monotone et fencing; effets
  `pending|confirmed`; reprise `confirmed|absent|uncertain` fail-closed.
- UI DA10 : contexte actif fondé sur les contrats réels; relire avant prompt/commande/shell/reprise;
  bloquer les écritures non concordantes et restaurer le brouillon après refus.

## État local, risques et protections

Worktree `sprint2-integration` au HEAD baseline, index vide. Dirty à préserver :
`PLAN-GENERAL.md`, `docs/product/releases/0.1.md`, `sprint.md`,
`docs/product/sprints/sprint-2.md` et le dossier APEX DA40-011. Aucun code produit modifié.

Risques principaux : chevauchement des fichiers générés Schema/Core entre DA20 et DA30, cohérence
du SDK après le contrat HTTP DA10, ordre des migrations, et conservation exacte du dirty. Les
égalités d'arbres/patch-id réduisent le risque d'intégration; chaque étape devra néanmoins vérifier
le nouvel arbre et le pathset. Tout conflit non mécanique ou changement fonctionnel retourne au
parent au lieu d'étendre une tâche source.

Régressions : tests ciblés binding/ownership/local-context/migrations, suite Core, tests HTTP
OpenCode, tests App contexte/garde/submit, typechecks Schema/Core/OpenCode/App, générations
Client/SDK, migration check, format/lint ciblés et `git diff --check`. Le smoke couvre concordance,
divergence, ownership, effet pending et restauration du brouillon.

## Dettes héritées et décision

- `event-manifest` : deux échecs Schema préexistants reproduits sur la baseline; dette DA20 héritée,
  hors périmètre DA40-011 et à garder distincte des résultats de la candidate.
- Le STATE source DA10 conserve une ligne « statut MT observé in_progress » tout en enregistrant
  ensuite la transition `done`; la relecture MT courante fait autorité et confirme `done`.
- Aucun blocage ni question fonctionnelle. Analyze est validé par le mandat existant.

Prochaine frontière : compaction parent contrôlée, puis Plan concret d'intégration et de vérification.
