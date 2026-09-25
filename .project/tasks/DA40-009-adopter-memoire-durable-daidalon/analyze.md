# Analyze — DA40-009

Date : 2026-09-07. Modèle demandé et attesté par le parent avant Build :
`gpt-5.6-terra` / `high`.

## Objectif et frontières

Matérialiser sans migration destructive le protocole de DA40-005 :
`/Users/leanbot/Documents/40_Daidalon/Daidalon` devient la racine documentaire
canonique; MT reste l'autorité métier, APEX l'autorité de phase/preuve et Git
l'autorité des faits Git. Le parent conserve `PLAN-GENERAL.md`, `sprint.md`, les
bilans et la clôture. Cette tâche ne les modifie pas, ne lance aucun sprint et ne
change ni produit, ni connecteur MT, ni skill global.

## Faits relus

- MT : DA40-009 était `todo`, puis a été passé à `in_progress` (écriture
  `1b34f2fc-820c-4178-a29f-0bff2cf38057`) et relu `in_progress`
  (`8df53624-ca38-4b2b-bfd9-164293e6e5cf`), sans sprint, avec l'external_ref
  stable du dossier APEX de `40-tooling`.
- DA40-005 fournit le contrat : autorité par fait, journal idempotent,
  checkpoint court, archivage non destructif, projections avec source/date/
  fraîcheur et reprise sans transcript. DA40-008 fournit le contrat de routage
  et de reprise sûre, déjà lu.
- Les cinq copies actuelles de `PLAN-GENERAL.md` ont le hash
  `f30505ff2731d5336b3756315959974e787c29111c286dbd3e2678b8fb56cdd1`; les cinq
  copies de `sprint.md` le hash
  `35b2bd47a7edc7c2f241167eab56537d1f0e1a9bc5d23354255b23b9c2e3deb3`.
  Elles sont égales aujourd'hui, sans pour autant constituer cinq autorités.
- Baseline mesuré : `40-tooling` est à
  `b7111b6e973d7200e70990c6f32a1a4d4b4a64de`, déjà sale (états APEX,
  archives et livrables hérités); `Daidalon/staging` est à
  `702bf7dcd7468638c17fd95b110deb38bd253e9a` et déjà sale. Ces changements ne
  sont pas attribués à DA40-009.

## Risques et protections

| Risque | Protection vérifiable |
|---|---|
| Une projection écrase le canonique | Registre central avec `canonical_ref`, revision, observation et fraîcheur; instruction explicite de ne jamais écrire depuis une projection. |
| Timeout ou reprise rejoue une mutation | Journal à intention stable, lecture ciblée de MT/APEX/Git et conclusion `reconciliation_incomplete` tant que l'effet n'est pas observé. |
| Carte archivée disparaît de la liste active | Index d'archives avec ID MT, résultat, external_ref, dossier APEX et chat; recherche ciblée MT avant toute conclusion. |
| Réécriture rétroactive ou perte de preuve | Aucun déplacement/suppression; adoption seulement des nouveaux documents et des mises à jour explicitement prévues. |

## Validation Analyze

Le mandat enfant, les exclusions et l'attestation parent résolvent le comportement
et les risques. Analyze est validé de manière autonome selon le contrat enfant.
Le plan ci-dessous découpe l'adoption documentaire, la projection et la preuve de
reprise.
