# Features produit — Daidalon

Registre local. Une feature n’est ni une carte MT Tasks, ni un sprint.

Chaîne : **feature → user stories → tâches APEX (MT) → sprint**.

```text
.project/features/<slug>/
```

| Fichier | Rôle |
|---|---|
| `FEATURE.md` | Vision, décisions, statut |
| `DISCOVERY.md` | Preuves et questions ouvertes |
| `STORIES.md` | User stories et tranche de livraison |

`APEX` reste vide tant que `$task-scope` n’a pas créé la carte.
Le plan général pointe les cartes, pas les stories.

## Registre

| Slug | Statut | Notes |
|---|---|---|
| `placement-distant` | `discovery` | Après le 0.5 : lieu du projet, URL, dossier sprint. Puis hôte SSH. Pas de carte dans ce lot. |
| `cockpit-v2` | `scoped` | Chrome de `cockpit-cursor.html`. US-11 à US-16, une carte chacune. |
