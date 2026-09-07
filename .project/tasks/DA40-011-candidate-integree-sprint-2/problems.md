# Problems — DA40-011

## Blocages

Aucun blocage de remise.

## Dettes et limites connues

### Manifestes d'événements Schema hérités

- Fait : `packages/schema` termine avec 13 tests verts et exactement 2 échecs
  `public event manifest`.
- Provenance : les deux échecs sont reproduits sur la baseline et ne viennent pas de Sprint 2.
- Impact : la suite Schema complète n'est pas entièrement verte, mais les contrats modifiés,
  l'hygiène et tous les typechecks passent.
- Suivi : DA30-005 ; réouverture de DA40-011 seulement si le nombre ou la nature des échecs change.

### Avertissements App antérieurs à la base

- Fait : l'inventaire C4 conserve 35 avertissements sur des lignes antérieures à la baseline ;
  aucune ligne Sprint 2 n'est rouge.
- Impact : un lint `--deny-warnings` sur les fichiers entiers reste non nul.
- Suivi : inventaire détaillé dans `blocs/C4-lint-format.md`; réouverture si une correction Sprint 2
  ajoute un avertissement ou si le parent décide de traiter cette dette séparément.

### Isolation du test du contrôleur accueil

Une invocation ad hoc réunissant le test `home-controller` après les tests de garde dans un même
processus Bun rencontre la pollution des mocks de modules. Les deux commandes canoniques isolées
passent (13/0 puis 3/0) et le typecheck App passe. Aucun défaut runtime n'est observé. Réexaminer si
la suite App officielle adopte cette combinaison dans un seul processus.

## Données locales conservées

La fixture `DA40-011-SMOKE` et les brouillons diagnostics restent volontairement dans les données
locales ; `.make.env` est conservé. Ils ne font pas partie du commit et aucune suppression n'est
autorisée dans B6.
