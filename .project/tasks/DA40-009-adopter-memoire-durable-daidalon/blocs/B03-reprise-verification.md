# B03 — Reprise à froid et vérification

Statut : completed, 2026-09-07.

## Reconstruction à froid

Sans relire d'ancien chat, la séquence suivante a suffi : `AGENTS.md` →
`.project/apex.json` → checkpoint canonique → STATE DA40-009 → journal → carte MT
DA40-009 relue (`590e7249-13e7-4333-a935-ef877154e4ae`). Elle restitue l'objectif,
la racine canonique, le statut métier `in_progress`, B01/B02, l'attestation
Terra/high, la divergence de projection déjà réconciliée et la prochaine action.

## Cas couverts

| Cas | Procédure vérifiée | Résultat |
|---|---|---|
| Timeout MT | journal avec cible/précondition; relire par `display_id`/`external_ref`, ne pas rejouer l'effet inconnu | PASS documentaire |
| Projection stale | hash initial devenu stale, relecture canonique + cinq copies, registre rafraîchi sans écriture de plan | PASS réel |
| Carte archivée masquée | index puis liste MT `archived` (`f0f393cf-86a4-4a05-b3f1-ce8c4e4809dd`) retrouvent DA40-005/008 et leurs external_ref | PASS réel |

## Checks

- Modèles, décision, journal, registre, checkpoint, index et pointeur local : présents.
- Liens locaux canoniques : présents.
- `git diff --check` dans `Daidalon` et `40-tooling` : PASS.
- Dix projections : hashes égaux; plan
  `047c30067722610012fac56b9cecdad697b64440c33dab068028823df5ea3f3c`, sprint
  `35b2bd47a7edc7c2f241167eab56537d1f0e1a9bc5d23354255b23b9c2e3deb3`.
