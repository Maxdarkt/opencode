# Analyze — DA30-009 — File séquentielle et autorité multi-tâche

## Objectif, autorité et périmètre

Le Sprint 4 autorisé le 2026-09-10 demande une file locale A → B, sans parallélisme : une tâche active à la fois, une transition observable et reprenable, et aucune confusion entre les autorités MT, APEX, session, worktree, owner, effets ou action suivante. Le présent enfant est limité à Analyze : aucun code produit, commit, push, mutation MT ou Build n'est exécuté.

Le runtime Sprint 4 `CURRENT.json` relu à la génération `4` est frais jusqu'à `2026-09-10T07:37:12+02:00` et observe DA30-009 comme `in_progress / analyze`, sur ce worktree et ce HEAD. Son statut ne remplace pas MT/APEX : MT reste l'autorité métier, APEX les phases/preuves et le runtime un cache d'observation.

Inclus au prochain parcours : contrat déterministe d'éligibilité/sélection/passage A → B et projection fail-closed des autorités exactes par tâche. Exclus : exécution parallèle, multi-hôte, MT distant, UI, métriques Sprint (DA30-010), ownership/reprise du worktree (DA20-004), Build sur staging, push, intégration et opérations Git destructives.

## Point de départ et preuves

- Worktree : `/Users/leanbot/Documents/40_Daidalon/features/tasks/DA30-009-file-sequentielle-autorite-multitache`; branche `task/DA30-009-file-sequentielle-autorite-multitache`; base/HEAD `57da5e0d156c1b6f73c2c4528b502d6b764d9891` (`fix(opencode): read authority fixture`).
- Scope : `features/30-agent-runtime/.project/tasks/DA30-009-file-sequentielle-autorite-multitache/scope.md`; acceptation : A et B ne partagent jamais identité/effet/action, transition/reprise testées, divergence bloquante.
- Contrat Sprint : `docs/product/sprints/sprint-4-proposal.md`; DA30-009 précède DA20-004, DA10-005 et DA30-010.
- Artefacts Sprint : `.project/runtime/sprints/5059b73b-d8e8-40db-b9d5-1cbfb5c6424e/CURRENT.json`, génération `4`.
- Cibles initiales : `packages/schema/src/task-pilot.ts` blob `5e6e9325`; `packages/core/src/task-pilot.ts` `a510c66f`; `packages/schema/src/task-authority.ts` `3c1c9030`; `packages/core/src/task-authority.ts` `617df2d0`; leurs tests `5cf83c4d` et `0b31f54e`.

## Constat technique

`TaskBinding` rend déjà l'identité durable bijective : MT, `apexExternalRef`, session, projet, emplacement, dépôt, branche, worktree et HEAD sont comparés avant reprise. `TaskExecution` ajoute un owner/fencing et des effets `pending|confirmed` liés à cette identité; ses contraintes uniques session/worktree empêchent une attribution concurrente.

En revanche, `TaskPilot.evaluate` ne reçoit qu'une tâche et retourne seulement son action de cycle. `TaskAuthority.observe` sélectionne une seule entrée d'un snapshot frais, vérifie son couple worktree/HEAD, puis réduit son observation à MT/APEX. Ni l'un ni l'autre ne peut aujourd'hui désigner une tâche active parmi A/B, prouver que l'autre est inactive, ou rejeter une entrée dupliquée/divergente avant sélection. Le handler HTTP `global/context` expose l'observation d'une session liée, pas une vue de file.

## Contrat à préserver au Build

1. Une file est ordonnée, non vide et sans identifiant dupliqué. Elle produit exactement une sélection : l'unique entrée active, sinon la première éligible; aucun résultat ambigu n'est interprété comme une sélection par défaut.
2. Une entrée est éligible uniquement si son observation MT/APEX est fraîche, valide, concordante avec sa propre identité de binding et dans un état de cycle admissible. Une identité, génération, worktree, HEAD, session ou référence APEX absente/divergente bloque la file entière.
3. Le passage A → B n'est permis que si A a atteint un état de clôture admissible et si B est la prochaine entrée ordonnée éligible. Il conserve l'état A pour consultation et ne transfère aucun champ d'identité, owner, effet ou action à B.
4. Rejouer exactement le même snapshot/ordre donne le même résultat. Snapshot expiré, statut/phase impossible, deux actives, A inachevée devant B, ou contexte incomplet donne un résultat typé `blocked`, sans écriture.
5. Cette tâche n'écrit ni MT ni APEX; elle évalue et expose une décision. Les mutations de cycle, de worktree et d'interface restent respectivement aux tâches/couches propriétaires.

## Régressions et checks à préparer

- A active, B todo : A sélectionnée; B ne reçoit aucune action/identité de A.
- A clôturée, B éligible : B sélectionnée; A demeure consultable et inchangée.
- Reprise au même snapshot : même sélection; entrée active unique conservée.
- Deux actives, ID dupliqué, ordre vide, snapshot expiré/malformé, MT/APEX invalide et divergence worktree/HEAD/session/référence APEX : blocage fail-closed sans mutation.
- Contrats existants `TaskPilot`, `TaskAuthority`, `TaskBinding` et `TaskExecution` restent verts; checks ciblés Core/Schema, typechecks paquet et `git diff --check` après Build.

## Découpage proposé pour le parent

Le prochain Plan peut borner le travail à deux blocs sans dépasser l'autorité actuelle :

1. **B1 — contrat de file pur (Luna / medium)** : introduire dans Schema/Core une entrée de file, états de sélection/blocage et évaluateur pur; étendre les tests `task-pilot` aux séquences A/B, à l'idempotence et à tous les refus. Aucun stockage ni endpoint.
2. **B2 — projection d'autorité (Luna / medium)** : faire valider par `TaskAuthority` une file complète contre le snapshot et les bindings exacts, puis exposer une observation utilisable par les consommateurs existants sans modifier le cycle de session; tests de fraîcheur, identité et non-fuite A → B.

L'intégration HTTP/UI, les transitions d'ownership/reprise et l'agrégat de métriques ne sont pas des corrections de ces blocs : ils restent DA10-005, DA20-004 et DA30-010.

## Risques et questions

- Le snapshot actuel porte MT/APEX/worktree/HEAD, mais pas session ni `apexExternalRef`. La validation complète APEX/session doit donc recevoir l'identité `TaskBinding` durable en entrée ou enrichir explicitement le contrat de snapshot; aucun champ ne doit être inféré d'une autre tâche.
- La notion exacte de « clôture admissible de A » doit réutiliser les états déjà acceptés par `TaskPilot` (`review|done` avec `verify`) plutôt que créer une seconde machine d'état. Le Plan devra fixer ce mapping et ses erreurs typées.
- Aucune décision métier supplémentaire n'est ouverte : le contrat Sprint impose le choix fail-closed, local et séquentiel. L'autorité de passer au Plan/Build appartient au parent.
