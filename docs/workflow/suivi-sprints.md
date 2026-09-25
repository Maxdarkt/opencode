# Suivi et rotation des sprints Daidalon

Instruction permanente utilisateur du 2026-09-06 : à chaque fin de tâche/sprint, tenir ensemble MT Tasks, APEX, PLAN-GENERAL.md et sprint.md à jour, effectuer la rotation du plan et archiver les chats terminés.

## Autorités et routine
1. Relire MT, STATE/checks/smokes, Git et chats avant transition. MT porte les statuts métier ; APEX les phases/preuves ; Git les faits ; caches reconstruisibles.
2. La racine documentaire canonique est `/Users/leanbot/Documents/40_Daidalon/Daidalon`. Les `PLAN-GENERAL.md` et `sprint.md` des worktrees sont des projections read-only : consulter `canonical_ref`, `observed_at`, `observed_revision` et `freshness` dans le [registre](../../.project/runtime/canonical-projections.md). Une projection `stale` ou `unknown` impose une relecture du canonique et n'autorise aucune écriture depuis la copie.
3. Avant une écriture qui traverse MT, APEX, Git ou les vues canoniques, relever les révisions et écrire une intention idempotente dans `.project/journals/` si la transition est sensible, échoue ou peut être interrompue. Après chaque étape, observer et relire; conclure `reconciled`, `reconciliation_incomplete` ou `conflict`, jamais un succès supposé.
4. Après revue parent et conditions de clôture remplies, passer done et relire ; pour code, respecter le commit local validé du contrat sprint-orchestrator.
5. Écrire le bilan du sprint dans docs/product/sprints/<sprint>.md : membres, résultats acceptés, preuves, dettes et suite. Conserver le nombre de livraisons et SP avant archivage car les listes de sprint peuvent exclure archived.
6. Clôturer le sprint dans MT avec disposition explicite de tout inachevé ; relire completed. Ne pas déclarer un sprint terminé sur la seule fin des chats.
7. L’utilisateur autorise désormais l’archivage de routine des cartes done validées et des chats de tâches terminées à la rotation. Ne pas archiver todo/in_progress/review/blocked par cette règle. Un chat `blocked` ou en attente de décision doit rester visible dans les tâches actives. Un chat parent encore utilisé pour le sprint courant reste ouvert jusqu’à son checkpoint et handoff final.
8. Mettre les STATE à archived en conservant le résultat done et les preuves. Ne pas déplacer/supprimer les dossiers APEX : external_ref et liens restent stables. Les copies historiques de scope dans les autres worktrees référencent le dossier effectif.
9. Sauvegarder le plan sortant dans .project/archives/ ; retirer les anciennes cartes du tableau courant de PLAN-GENERAL.md, conserver un lien vers le bilan. Remplacer les textes obsolètes, ne pas empiler des assertions contradictoires.
10. Mettre à jour sprint.md (index courant/historique), le document du sprint, le plan général et les projections des worktrees. Tenir la release à jour. Aucun lancement de sprint futur induit par la rotation.
11. Archiver les chats terminés par set_thread_archived ; conserver IDs et résultat. Après chaque archivage, vérifier que les chats non terminés restent visibles ; restaurer immédiatement tout chat `todo`, `in_progress`, `review` ou `blocked` masqué par erreur. Le parent sortant est archivé en dernier après transfert/checkpoint. Un chat arrêté n’est pas une preuve de done.
12. Pour une carte archivée masquée par une liste active, consulter d'abord l'[index d'archives](../../.project/archives/index.md), l'external_ref et le dossier APEX stable, puis rechercher la carte MT par cible exacte. Ne jamais recréer carte, chat ou preuve depuis l'absence d'une liste filtrée.
13. Reconstruire/valider le cache après les autorités, relire cartes archivées, plans et liens ; consigner toute divergence et prochaine action. Ne jamais réécrire MT pour faire correspondre un cache.
14. Lorsqu’une décision utilisateur bloque une tâche, le parent fait le point dans son propre chat avec trois rubriques explicites : **Objectif**, **Réalisé**, **Décision en attente**. Il indique l’effet exact de la décision et reprend le chat enfant existant après réponse ; aucun doublon de tâche ou de chat.

## Checkpoint compact et budget de contexte

- Maintenir un checkpoint Markdown court du sprint avec : objectif, tâches et statuts relus, décisions actives, HEAD/commits utiles, blocages réels, dettes et prochaine action exacte.
- Pour reprendre, charger dans cet ordre : règles/profil APEX, checkpoint, carte MT et STATE, puis seulement scope/décision/bloc utile. Timeout, journal ouvert ou divergence rendent le checkpoint `stale`; relire les autorités et ne jamais rejouer un effet incertain.
- Mettre ce checkpoint à jour après chaque transition significative et avant une reprise dans un nouveau contexte. Un nouveau parent commence par ce fichier puis vérifie MT/APEX/Git ; il ne recharge pas l’historique complet des chats.
- Chercher avant de lire, cibler les fichiers candidats, éviter les relectures inchangées et conserver les logs volumineux comme preuves consultées à la demande.
- Le contexte de travail est jetable ; MT Tasks, Markdown APEX/sprint et Git portent la mémoire durable. Aucun arrêt manuel n’est requis pour enchaîner les tâches.

## Routage des modèles

- Toute création de tâche Codex fixe explicitement `model` et `thinking` ; ne jamais omettre ces champs en laissant hériter le modèle par défaut.
- Luna traite recherches ciblées, inventaires, mises à jour documentaires et opérations mécaniques. Terra est le défaut pour une implémentation ou une orchestration standard. Sol est réservé aux bugs difficiles, migrations risquées et arbitrages d’architecture complexes. Astra est une escalade exceptionnelle pour le travail de plus haute difficulté ou après échec raisonné d’un niveau inférieur.
- La taille ou l’importance métier ne suffit pas à justifier une escalade. Le parent consigne modèle réel, effort, motif et éventuelle escalade dans le checkpoint et le registre runtime.
- Avant chaque lancement, comparer le modèle prévu au modèle réellement créé. Toute divergence est une anomalie d’orchestration à corriger avant de poursuivre.

Pas de push, merge, rebase, promotion, suppression de worktree ou nettoyage de fichiers **pendant** le sprint, ni par la rotation documentaire seule.

## Fin de sprint — Git (minimum, mandat 2026-09-12)

Après clôture MT et archivage des cartes `done`, le sprint n’est Git-clos que lorsque `staging` redevient la source saine :

1. Committer sur `staging` les docs de clôture (propres, `git diff --check`). Si le checkout `staging` est sale, le ranger **avant** tout merge candidate.
2. Merger **uniquement la candidate** du sprint (Sprint 8 : SHA Verify `cbdf61e67` / DA20-007), pas chaque worktree de carte. Arrêt au premier conflit non trivial. Jamais de force-push. Jamais merger vers `master` / `develop` / `main` / `dev` par cette porte.
3. `git push origin staging` (créer la branche distante si absente). Ne pas pousser vers `dev` / `develop` / `main` / `master`. Jamais `--force`.
4. `git worktree remove` seulement les worktrees `features/tasks/` du sprint clos, **propres**. Sprint 8 : 014, 015, 007 puis 020 (`--force`, locaux smoke/runtime hors produit). Branches locales conservées. Mandat 2026-09-25 : 7 worktrees `s3-*` propres retirés ; 9 `10-*`…`s2-*` sales exclus.
5. Déploiement `develop` (preview) ou `master` (prod) : **facultatif**, sprint par sprint. Non fait par la promotion staging.

Un Sprint suivant part de ce `staging` à jour. Sans cette promotion, les nouveaux worktrees naissent d’une base **sans** le code du sprint clos.

## Préflight de promotion et réalignement explicitement mandatés

Lorsqu'un utilisateur autorise explicitement la promotion locale d'une candidate de sprint vers
`staging` et le réalignement des worktrees, appliquer cette convention avant toute mutation :

1. inventorier les worktrees du sprint sortant avec branche, HEAD et `git status --porcelain` ;
2. refuser de merger ou rebaser un worktree sale, actif, `todo`, `in_progress`, `review` ou
   `blocked` ; consigner son exclusion et sa condition de reprise ;
3. versionner d'abord l'état canonique/documentaire prêt à être préservé, après `git diff --check` ;
4. fusionner seulement la candidate intégrée dont la branche, le HEAD, les checks et l'état propre
   ont été relus ;
5. rebaser ensuite uniquement les worktrees clos et propres, un par un, et arrêter/documenter au
   premier conflit ou écart ; aucun reset, clean, suppression ni réalignement forcé ;
6. relire Git, MT et APEX, puis mettre à jour plan, index de sprint, bilan et projections. Un
   Sprint suivant est préparé seulement après la clôture du Sprint courant et sa validation.
