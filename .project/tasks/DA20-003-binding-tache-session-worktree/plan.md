# Plan — DA20-003

## Mandat objectif

- Source : délégation parent Sprint 2 du 2026-09-07, complétée par l'attestation de routage explicite.
- Cible : `/Users/leanbot/Documents/40_Daidalon/features/s2-20-binding`, branche
  `task-session-binding`, base `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2`.
- Résultat : contrat et persistance locale fail-closed pour carte MT / external_ref APEX / session /
  location / projet-dépôt / branche / worktree / HEAD, avec adoption idempotente et reprise exacte.
- Parcours autorisé : Build borné, checks, smoke technique, commit local exact, transition MT vers
  `review`. Aucune opération sur staging, push, merge, rebase, promotion, reset, suppression ou
  nettoyage destructif.
- Conditions d'arrêt : dérive de scope, conflit concurrent sur une cible, migration destructive,
  check requis rouge après corrections bornées ou accès manquant.

## Contrats

- `@opencode-ai/schema/task-binding` expose une identité sérialisable versionnée et les faits
  checkout distincts. Les chemins sont `AbsolutePath`; session/projet/workspace réutilisent leurs
  identifiants canoniques.
- La table `task_binding` rend uniques `mt_task_id`, `apex_external_ref` et `session_id`, et référence
  `project`/`session`. Les autres faits restent explicites, non cachés dans JSON.
- `TaskBinding.adopt(identity)` : valide d'abord la session persistée, recherche toute collision,
  retourne l'existant exact sans écriture ou insère une seule ligne.
- `TaskBinding.resume(identity)` : valide la session, exige une ligne existante et compare tous les
  champs ; aucune création ni mise à jour.
- `TaskBinding.get(ref)` : lecture ciblée par exactement une identité stable, utile aux consommateurs.
- Les refus typés distinguent binding absent, session absente et divergences, avec liste de champs
  exploitable. Aucune divergence n'est corrigée ou adoptée implicitement.

## Blocs vérifiables

### B1 — Contrat et persistance

- Ajouter le contrat Schema et son export racine.
- Ajouter la table Drizzle et le service Core avec conversion row/Info, validation session et
  comparaison exhaustive.
- Générer la migration TypeScript, le snapshot et le schéma complet via l'outil du dépôt.
- Check de bloc : typecheck Schema/Core et migration `--check`.

### B2 — Reprise et refus ciblés

- Ajouter des tests Core sur base SQLite isolée : création, reconstruction/reprise, rejeu exact sans
  mutation, absence, session/project/location incohérents et divergences MT/APEX/session/Git.
- Vérifier que les collisions refusées n'ajoutent ni ne modifient de ligne.
- Check de bloc : test ciblé puis régression Core pertinente.

## Smoke technique et Verify

- Exécuter le test ciblé comme parcours create → service reconstruit → resume exact → collision
  rejetée → état persistant inchangé.
- Exécuter `bun run script/migration.ts --check`, `bun typecheck` dans `packages/schema`, puis
  `bun typecheck` et le test ciblé dans `packages/core`.
- Examiner le diff/pathset, confirmer l'absence de modification des projections Sprint préexistantes
  par le Build, écrire `smoke-report.md`, puis créer un commit local borné.

## Plan de smoke parent

Le parent pourra consommer le contrat depuis une candidate intégrée avec une base locale vierge :
créer projet/session, adopter un binding exact, redémarrer/reconstruire le runtime, reprendre avec les
mêmes faits, puis modifier successivement branche/HEAD/worktree pour vérifier un refus visible et
non destructif. Aucun viewport n'est requis pour DA20-003 ; DA10-003 précisera le smoke UI.

## Dépendances et dettes

- Entrée : baseline Sprint 1 uniquement.
- Sorties : le service Core et le contrat Schema sont consommables par DA30-004 ; le contrat Schema
  est consommable par DA10-003. Aucun endpoint n'est ajouté ici.
- Dette attendue : aucune dans le périmètre ; ownership/lease et UI restent explicitement dans leurs
  cartes existantes.
