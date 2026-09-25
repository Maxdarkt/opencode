# STATE — DA40-008

- Phase APEX : closed ; C01 reçu, contrôles locaux verts et guide global actif.
- Statut MT observé : `archived`, hors sprint ; réouverture puis review relues, clôture corrective
  `1ac4b3a6-5075-4932-8b37-19a4783ec6f4`, relecture done `08a4d6c5-47ce-4c52-8a6e-a8f328a747cc`,
  archivage `64395e08-1d88-4fb5-97be-1a7ca3a8f728`, relecture archived `b6064366-a67f-4d5f-b3fc-274744fba623`.
- Référence stable : `.project/tasks/DA40-008-integrer-contrat-sprint-orchestrator` ; worktree `40`, branche `40-tooling`, HEAD observé `b7111b6e973d7200e70990c6f32a1a4d4b4a64de`.
- Routage : demandé et attesté par le parent avant Build : `gpt-5.6-terra` / `high`. Motif : évolution d'orchestration et de contrat multi-autorités standard ; aucune escalade.
- Baseline : sale avant tâche — 12 fichiers suivis modifiés, des archives/livrables APEX non suivis et les dossiers DA40-005/008/009 ; aucun chemin tiers ne sera modifié.
- Analyse/plan/blocs : `analyze.md`, `plan.md`, `blocs/B01-lancement.md`,
  `blocs/B02-reprise.md`, `blocs/B03-verification.md`; contrat existant et ressources lus,
  optimisations actuelles préservées (cache reconstruisible, un propriétaire/worktree, suivi pendant
  exécution, smoke parent, finalisation sûre).
- Décisions / limites : le parent garde `PLAN-GENERAL.md`, `sprint.md`, projections et clôture ; ne pas créer de sprint/carte/chat, ni commit/push/merge/rebase/promotion ; pas de modification produit ou staging.
- Checks/smoke : quick validator compatible PASS, liens locaux PASS, simulation comportementale
  locale PASS ; détail dans `smoke-report.md`. Aucune UI, carte, sprint, chat ou runtime créé.
- Dettes : aucune dette in-scope ; voir `debts.md`.
- Correctif : ajouter une ressource d'onboarding portable et un routage léger dans `SKILL.md`; conserver
  toutes les règles préexistantes du skill et ne modifier aucune projection parent.
- Preuves correctif : `blocs/C01-project-bootstrap.md`, `smoke-report.md`; structure, 4 liens,
  portabilité et scénarios absent/partiel/complet PASS.
- Handoff : `handoff.md`, `smoke-report.md` et `blocs/C01-project-bootstrap.md`; la revue parent
  porte sur les trois références conditionnelles et la préservation du contrat principal.
- Prochaine action exacte : utiliser `project-bootstrap.md` pour auditer ou mettre à niveau les autres projets avant leur prochain sprint.
- Reprise : relire ce STATE, la carte MT, `blocs/C01-project-bootstrap.md` et la nouvelle référence;
  comparer checkpoint/autorités avant toute mutation et ne pas rejouer une mutation inconnue.
