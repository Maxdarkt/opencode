# Analyze — DA40-010

## Objectif et limites

Assembler sur `baseline-integration`, à partir de `702bf7dcd7468638c17fd95b110deb38bd253e9a`, une candidate locale réunissant les résultats validés du Sprint 1. L'enfant intègre, vérifie et documente sans commit, push, merge, rebase, promotion vers `staging`, activation du Sprint 2 ni modification des autres worktrees.

## Autorités et état observé

- MT Tasks : DA40-010, projet DA, hors sprint, 5 SP, `in_progress` depuis le début réel de cet Analyze ; external ref `.project/tasks/DA40-010-assembler-baseline-commune`.
- APEX : ce dossier porte les phases et preuves.
- Git : worktree `/Users/leanbot/Documents/40_Daidalon/features/50-integration`, branche `baseline-integration`, HEAD/base `702bf7dcd7468638c17fd95b110deb38bd253e9a`.
- Canonique documentaire : `/Users/leanbot/Documents/40_Daidalon/Daidalon`, consulté en lecture seule. Les projections locales `PLAN-GENERAL.md` et `sprint.md` sont read-only.
- État sale hérité : `AGENTS.md`, `PLAN-GENERAL.md`, `.project/projections/`, ce dossier APEX et `sprint.md`. Ces chemins sont conservés et attribués au cadrage parent.

## Inventaire des livraisons

| Livraison | Révision                                   | Parent      | Rôle dans l'assemblage                                                     |
| --------- | ------------------------------------------ | ----------- | -------------------------------------------------------------------------- |
| DA10-002  | `e22d723895e3a8537f9bf21d5d6e4561ff630de1` | `702bf7dcd` | delta complet : UI, contexte local/Git partagé, SDK généré et preuves DA10 |
| DA20-002  | `2d973aeaf6a289ba1f343663a758d7c70b1bcc11` | `702bf7dcd` | dossier `.project/tasks/DA20-002-contexte-local-verifiable` uniquement     |
| DA40-003  | `1b327889841111256dfbc88f9cb063f848cc661b` | `702bf7dcd` | baseline/checks et preuves DA40-003                                        |
| DA40-007  | `50019f223b575164873c67dcc8894286066ab30c` | `1b3278898` | architecture et preuves DA40-007                                           |
| DA40-006  | `b7111b6e973d7200e70990c6f32a1a4d4b4a64de` | `50019f223` | Makefile, ports, worktrees et preuves DA40-006                             |

Les 15 chemins hors `.project/` du commit DA20 ont été comparés objet par objet entre DA20 et DA10 : leurs blob IDs sont tous identiques. Appliquer le delta produit DA20 après DA10 serait donc une double application sans valeur ; importer son dossier APEX conserve sa provenance sans modifier une seconde fois le produit.

## Documents canoniques utiles

La release 0.1, le bilan Sprint 1, la routine de suivi, le plan/index de sprint et la mémoire durable constituent le contexte utile. Le Build peut en importer un snapshot dans la candidate, mais ne doit pas modifier la racine canonique. Après la transition MT, `PLAN-GENERAL.md` et le checkpoint parent encore à `todo` sont devenus obsolètes ; le parent est seul autorisé à les réconcilier et à rafraîchir les projections.

## Contrats et protections de régression

- Préserver le parcours : sélection du dossier, navigation/confirmation séparées, aucune initialisation Git implicite, contexte réel visible, cas non-Git/detached/base inconnue.
- Régénérer le client SDK via le script du dépôt après intégration des routes publiques ; ne jamais éditer les fichiers générés à la main.
- Exécuter les tests depuis les packages, jamais depuis la racine ; `bun typecheck` uniquement dans les packages concernés.
- Vérifier la façade Make avec une `.make.env` locale ignorée, des ports propres et aucun redémarrage d'un serveur existant.
- Conserver les preuves et worktrees source inchangés ; mesurer leurs HEAD/statuts avant et après.

## Risques et réponses

- Double application DA20/DA10 : évitée par comparaison des blobs et import sélectif du dossier APEX DA20.
- Conflit avec l'état sale initial : appliquer les deltas par pathsets bornés et contrôler `git diff --check` après chaque bloc ; ne jamais restaurer les fichiers hérités.
- Documents canoniques stale : ne pas écrire une projection read-only ; tracer l'écart et laisser au parent la mutation canonique.
- Génération SDK divergente : régénérer après assemblage, comparer le diff aux blobs validés et traiter toute différence comme correction bornée.
- Ports/processus : inventorier les listeners, utiliser la configuration du worktree et arrêter seulement les processus lancés par ce smoke.

## Questions et validation Analyze

Aucune décision produit n'est ouverte. L'ordre, les révisions, le traitement du chevauchement et les frontières sont déterminés par le mandat. L'attestation de routage a été acceptée explicitement par le parent malgré l'absence d'exposition des métadonnées observées. Analyze est validé autonomement le 2026-09-07 conformément au contrat enfant.
