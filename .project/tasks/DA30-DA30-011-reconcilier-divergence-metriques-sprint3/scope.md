# Scope — DA30-011 — Réconcilier la divergence métriques Sprint 3

## Objectif

Réconcilier sans perte le commit du worktree historique `s3-30-cost-metrics`
`70e6bfedc906c1229f6a07bd96df6f30e3ea54af` avec la révision métriques intégrée dans
`staging` (`7374a3ea3b60baa897cdc1c9d9f6ed381f0b6149`), puis rendre le réalignement du
worktree possible et vérifié.

## Faits mesurés

- `staging` a reçu la candidate Sprint 3 au merge `948a99387`.
- Les rebase de `s3-30-schema-manifest` et `s3-30-apex-cycle` ont abouti propres.
- Le rebase de `s3-30-cost-metrics` a rencontré six conflits API/SDK en rejouant `70e6bf`; il a
  été annulé proprement. Le worktree est revenu propre sur sa branche et son HEAD d'origine.
- Le champ MT `external_ref` exact est
  `.project/tasks/DA30-DA30-011-reconcilier-divergence-metriques-sprint3` : le connecteur ne
  permet pas de le corriger après création; ce dossier l'adopte sans recréer la carte.

## Périmètre

- comparer les pathsets, contrats Schema/Core/HTTP/SDK et tests des deux révisions;
- produire une décision de réconciliation et un plan de correction borné;
- exécuter les checks ciblés et réaligner le worktree seulement après preuve;
- documenter les conflits, la récupération et le HEAD final.

## Hors périmètre

- modification du worktree actif DA30-009 ou du Sprint 4;
- reset, clean, suppression de worktree, force-push, push, déploiement ou migration non liée;
- démarrage d’un Sprint suivant.

## Acceptation

1. Les différences `70e6bf`/`7374a3e` sont expliquées avec pathsets et impact.
2. La solution retenue n’écrase aucun comportement métriques sans preuve de test.
3. Le worktree métriques est soit réaligné proprement sur `staging`, soit son blocage réel est
   documenté avec une action de reprise non ambiguë.
4. MT, ce scope et le plan général référencent le même identifiant et external_ref.

## Dépendances et suite

Carte backlog hors Sprint 4. Elle ne démarre pas sans mandat d’Analyze explicite et ne bloque pas
DA30-009; elle devra utiliser un worktree dédié ou le worktree historique seulement après
préflight de propreté.
