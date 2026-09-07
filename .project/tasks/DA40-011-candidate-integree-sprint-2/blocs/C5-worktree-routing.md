# C5 — Rattachement du worktree à la nouvelle session

## Reproduction et diagnostic

- Échec parent reproduit localement sans prompt ni création de session : depuis l'accueil dont le contexte actif est
  `/Users/leanbot/Documents/40_Daidalon/features/s2-integration`, le bouton global « Nouvelle session » ouvrait un
  brouillon sur `/Users/leanbot/Documents/40_Daidalon/features/50-integration`, branche `baseline-integration`.
- `GET /project/current?directory=…/s2-integration` renvoie l'identité projet partagée
  `22f4eb5c773c99a9890aae1bbd0d271af5f4f5d4`, racine mémorisée `…/50-integration`, avec
  `…/s2-integration` dans `sandboxes`. C'est le modèle nominal des worktrees, pas un cache corrompu.
- `GET /global/context?directory=…/s2-integration` reste correctement borné : branche
  `sprint2-integration`, HEAD `9d0decb2be8abd1d7e7a31b28117572b0d873606`. La même requête sur
  `…/50-integration` renvoie séparément `baseline-integration` et `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2`.
- Cause client : `home-controller.ts` et le chemin accueil de `titlebar.tsx` ne reconnaissaient que
  `project.worktree === selection.directory`. Une sélection qui est un `project.sandboxes[]` tombait donc sur le
  premier projet/racine et créait le brouillon dans `50-integration`.
- Attribution : les deux comparaisons fautives sont présentes à la base
  `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2`; aucun commit Sprint 2 n'avait touché ces fichiers. C'est un défaut
  source App préexistant révélé par l'intégration, et non un conflit entre DA10/DA20/DA30.

## Correction bornée

Correction mécanique, sans changement de contrat API : résolution d'un projet par racine **ou** sandbox, puis
conservation du répertoire exact sélectionné lors de la création du brouillon. Les replis existants vers la racine
restent inchangés pour une sélection absente ou étrangère.

Pathset C5 :

- `packages/app/src/pages/home/home-controller.ts` ;
- `packages/app/src/components/titlebar.tsx` ;
- `packages/app/src/pages/home/home-controller.test.ts`.

## Vérifications

- Tests App ciblés : 22 passent, 47 assertions (`home-controller`, ouverture projet, contrôleur workspace,
  soumission prompt).
- Typecheck App : PASS. Prettier C5 : PASS. `git diff --check` : PASS.
- Oxlint sur contrôleur/test C5 : 0 warning/0 erreur. `titlebar.tsx` conserve 10 warnings pré-base hors lignes C5 ;
  l'appel C5 est explicitement `void` et n'ajoute aucun warning.
- Smoke visuel après correction, sans prompt/session : à 1440×900 puis 1024×768, contexte
  `s2-integration`, workspace `s2-integration`, branche `sprint2-integration`. L'étiquette projet reste normalement
  `50-integration`, racine de l'identité Git partagée.
- Les seuls serveurs C5 ont été arrêtés ; ports 4151/4451 libres. Trois brouillons locaux de diagnostic restent
  préservés conformément à l'interdiction de suppression ; aucun appel modèle ou effet externe.

## Suite

Le correctif est assez mécanique et borné pour être conservé dans DA40-011 selon le mandat C5. Le parent peut
accepter C5 et reprendre le smoke visuel concordant. B6 reste fermé jusqu'à instruction parent explicite.
