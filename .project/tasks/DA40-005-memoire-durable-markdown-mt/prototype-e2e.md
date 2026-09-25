# Prototype documentaire E2E — idée → archive

Ce scénario est fictif, ne crée aucune carte ni sprint et ne modifie aucune archive réelle. Les identifiants illustrent les liens stables, non une nouvelle tâche à lancer.

## 1. Idée et décision de cadrage

`DEC-042` conserve la provenance de l'idée « rendre l'historique de décision retrouvable », les alternatives (chat seul, wiki sans MT, base vectorielle) et le choix : pilote Markdown + MT, sans migration. La release `0.2` référence la décision et liste ce besoin comme incrément potentiel, sans lui attribuer de statut MT.

## 2. Release, sprint et carte

Le parent crée le document release, puis le sprint `da-release-0.2-sprint-1` et son mandat. Après accord, MT alloue `DA40-042`, avec `external_ref: .project/tasks/DA40-042-index-decisions`. Le scope est créé dans le worktree `40` et cite exactement cet ID. Le parent consigne dans le checkpoint : demande `gpt-5.6-terra/high`, modèle observé et attestation avant Build.

## 3. Démarrage et bloc borné

L'enfant relit MT (`todo`), son scope et le checkpoint, puis écrit l'intention `OP-042-start` : précondition `todo`, cible `DA40-042`, propriétaire worktree 40. Il passe MT à `in_progress`, relit la carte, met STATE à Analyze et produit son bloc. Le checkpoint contient seulement le résultat du bloc, la décision active, le HEAD/baseline utile et « prochaine action : relire le plan puis rédiger le modèle ».

## 4. Interruption et reprise dans un nouveau chat

Un crash survient après l'écriture du bloc, avant la mise à jour du checkpoint. `OP-042-build-01` est sans conclusion. Le nouveau chat ne rejoue rien : il charge règles → checkpoint → MT → STATE → journal, constate que le bloc est présent et met le journal à `reconciled` après relecture. Il régénère le checkpoint et poursuit le bloc suivant. Le transcript absent est noté comme indisponible, pas reconstruit.

## 5. Réception et clôture

L'enfant rend `review` avec smoke/checks et dette. Le parent relit la preuve, décide la réception, passe MT à `done`, relit MT et actualise le bilan sprint/release. Si une écriture échoue, le journal reste `reconciliation_incomplete`; la clôture ne se poursuit pas.

## 6. Rotation et archivage

Le parent fige les membres, SP, résultat et dettes dans le bilan. Il sauvegarde le plan sortant sous `.project/archives/<sprint>/`, retire la carte de la vue courante sans retirer son dossier APEX, puis archive la carte et le chat autorisés. L'`index.md` garde `DA40-042`, le résultat, `done_at`, `external_ref`, liens de bilan/journal et ID de chat. Une recherche de carte active peut ne plus la voir, mais l'index et MT ciblé permettent toujours sa reconstruction.

## Critères démontrés

| Critère | Trace du prototype |
|---|---|
| Reprise sans historique de chat | §4 : checkpoint + STATE + bloc + journal + MT. |
| Timeout/crash réconciliable | §4, matrice de panne. |
| Carte archivée retrouvable | §6 : index non destructif. |
| Pas de contradiction de plan | le plan est une projection réécrite à partir de MT/bilan relus. |
| Multi-worktree sûr | seul le worktree 40 écrit le dossier de tâche ; parent seul publie le canonique. |
| Routage attesté | §2 : demandé, observé, attestation avant Build. |
