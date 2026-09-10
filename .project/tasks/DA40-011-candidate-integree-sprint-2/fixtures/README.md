# Fixtures C6 — smoke métier local

Ces fixtures écrivent uniquement les identifiants réservés `ses_da40_011_smoke_s2`,
`DA40-011-SMOKE` et `c6-smoke-effect` dans la base locale OpenCode qui connaît ce worktree. Elles ne
créent aucun prompt, message, appel modèle ou effet externe. Elles sont conservées après le smoke.

Depuis `/Users/leanbot/Documents/40_Daidalon/features/s2-integration` :

```bash
bun .project/tasks/DA40-011-candidate-integree-sprint-2/fixtures/c6-business-smoke.ts seed
make dev
```

La sortie `seed` donne les URL exactes `uiURL` et `contextURL`. Ouvrir `uiURL`, puis exécuter les
transitions ci-dessous dans un autre terminal. Après chaque commande, utiliser « Refresh context ».

```bash
# 1. Concordant : owner génération 1, effet confirmé.
bun .project/tasks/DA40-011-candidate-integree-sprint-2/fixtures/c6-business-smoke.ts concordant

# 2. Divergent : seul le HEAD du binding devient la baseline Sprint 1.
bun .project/tasks/DA40-011-candidate-integree-sprint-2/fixtures/c6-business-smoke.ts divergent

# 3. Pending : HEAD restauré, effet marqué pending, état UI resuming.
bun .project/tasks/DA40-011-candidate-integree-sprint-2/fixtures/c6-business-smoke.ts pending

# 4. Reprise : effet confirmé, owner transféré, génération 2, état concordant.
bun .project/tasks/DA40-011-candidate-integree-sprint-2/fixtures/c6-business-smoke.ts resume

# Lecture seule de la fixture courante.
bun .project/tasks/DA40-011-candidate-integree-sprint-2/fixtures/c6-business-smoke.ts inspect
```

Pour les refus `divergent` et `pending`, saisir un brouillon sans l'envoyer ailleurs, ouvrir le
panneau Réseau du navigateur, vider la trace, puis cliquer « Envoyer ». Attendre l'alerte de blocage
et vérifier simultanément :

- aucune requête `POST /session/<id>/prompt_async`, `POST /session/<id>/message`,
  `POST /api/session/<id>/prompt` ou `POST /session/<id>/shell` ;
- le texte du brouillon reste identique ;
- seul `GET /global/context?...session_id=ses_da40_011_smoke_s2` apparaît.

La preuve automatisée complémentaire est :

```bash
cd packages/app
bun test --conditions=solid --preload ./happydom.ts \
  ./src/components/active-task-write-guard.test.ts \
  ./src/components/prompt-input/submit.test.ts
```

Elle vérifie le blocage avant écriture, zéro prompt et la restauration exacte du brouillon/contexte.
Le smoke navigateur reproductible, à lancer avec `make dev` actif depuis la racine du worktree, est :

```bash
bun .project/tasks/DA40-011-candidate-integree-sprint-2/fixtures/c6-browser-smoke.ts
```

Il bloque préventivement tout `POST` au niveau Playwright, vérifie qu'aucun `POST` n'est même tenté,
contrôle le brouillon dans les états divergent et pending, puis laisse la fixture concordante en
génération 2.

Arrêter ensuite uniquement le `make dev` lancé pour C6 avec `Ctrl-C`. Ne pas supprimer les fixtures.
