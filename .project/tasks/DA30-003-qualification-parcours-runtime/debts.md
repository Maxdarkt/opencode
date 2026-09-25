# Dettes et limites remises au parent

| ID | Sévérité / impact | Preuve | Owner / décision / réouverture |
|---|---|---|---|
| D1 | Haute : garde V2 insuffisante pour UI pilote V1 | diagnostic, GET health, tests compat ; admittedSeq compatible artificiel | DA30/parent Sprint 2 ; sélectionner route et couvrir V1 ou migration explicite avant lease |
| D2 | Haute : quiescence de tous écrivains non prouvée | matrice shell/PTY/descendants/outils applicatifs | DA30/DA40 ; cadrage confinement et protocole de reprise avant transfert automatique ; refus en attendant |
| D3 | Haute pour voie Leanbot : capacité indisponible | LOCAL_MAPPING_MISSING, requête MT dans contrat | Parent/MT ; résoudre mapping puis relire allowed ; aucune mutation de mapping ici |
| D4 | Moyenne : adaptateur réellement exécuté non observé | aucun appel fournisseur ; AI SDK seulement attendu de la configuration | Parent DA30 ; log llm.runtime/provider/model avec fixture instrumentée ou campagne autorisée avant assertion runtime/economie |
| D5 | Moyenne : qualifications live et OS partielles | 112 tests ciblés ; aucun prompt live, PTY/descendant réel ni multiprocessus | Parent ; compléter au plan lease. Les tests feuille injectent permissions/processus : ne certifient pas l’OS |

Aucune dette de code introduite. Aucun nouveau registre, coût fournisseur, modèle, carte MT ou extension de scope créé. Les suites ciblées et le typecheck passent ; ces limites sont des entrées de cadrage, pas des tests échoués masqués.
