# Analyze — DA40-008

Date : 2026-09-07. Modèle demandé puis attesté par le parent avant Build : `gpt-5.6-terra` / `high`.

## Objectif et portée

Intégrer de façon étroite dans le skill global `sprint-orchestrator` la mémoire de reprise compacte,
la lecture de contexte progressive, la fraîcheur/reconciliation et le routage déterministe des
modèles. Les surfaces autorisées sont `SKILL.md`, son contrat référencé si nécessaire, et les preuves
APEX de cette tâche.

Sont exclus le produit Daidalon, le connecteur MT, les projections parent (`PLAN-GENERAL.md`,
`sprint.md`), toute création de sprint/carte/chat et tout acte Git sensible.

## Faits mesurés

- Profil APEX : `tracked`, projet MT `DA`; le dossier APEX et MT doivent être synchronisés. Le parent
  détient les projections globales et la clôture.
- MT a été lu `todo` (`2cc34436-10cb-4a1a-9065-2c453e5a76f5`), passé à `in_progress`
  (`1436702b-c79e-4b56-b042-2c0d37d832d6`) puis relu `in_progress`
  (`343dd0b3-084b-4a08-bb33-2fc4a155d58a`). Carte : DA40-008, external_ref stable, worktree 40,
  backlog sans sprint.
- `sprint-orchestrator` contient déjà : cache runtime reconstruisible et non autoritatif, ordre de
  délégation, supervision continue, reprise par relecture des autorités, visual smoke parent,
  permissions Git/worktree et archivage explicite. Ces optimisations sont le baseline à préserver.
- DA40-005 fixe les ajouts compatibles : checkpoint Markdown sous 120 lignes, ordre de lecture ciblé,
  comparaison de fraîcheur avant reprise, journal en cas de divergence, modèle/effort demandés et
  observés, et Astra seulement après difficulté exceptionnelle prouvée.
- Baseline Git : `40-tooling` à `b7111b6e973d7200e70990c6f32a1a4d4b4a64de`, sale avant cette tâche
  (12 chemins suivis, archives/livrables APEX non suivis). Aucun changement hérité n'est dans le
  périmètre.

## Risques et protections

| Risque | Protection |
|---|---|
| Skill gonflé ou règles dupliquées | Garder le routage et les déclencheurs dans `SKILL.md`; placer la procédure conditionnelle dans le contrat déjà chargé. |
| Reprise qui rejoue une mutation incertaine | Comparer checkpoint aux autorités, marquer `stale`, journaliser/réconcilier avant toute réexécution. |
| Escalade arbitraire | Grille basée sur difficulté observée; consigner motif, demandé/observé et divergence; arrêt avant Build sans attestation. |
| Régression d'orchestration existante | Comparaison explicite avant/après des invariants cache, worktrees, autorités, permissions, smoke et archivage. |

## Validation Analyze

Le mandat enfant résout la portée, le modèle, les dépendances et les limites; aucun point métier ou
risque nouveau n'exige une décision parent. Analyze est donc validé autonomement selon le contrat de
handoff. Le prochain jalon est le plan borné ci-dessous.
