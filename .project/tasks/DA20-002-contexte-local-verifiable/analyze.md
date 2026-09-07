# Analyze — DA20-002
Mandat effectif parent ; dépendances DA40/DA30 done relues MT. HEAD 702bf7dcd7468638c17fd95b110deb38bd253e9a, branche 20-workspace-git ; baseline SHA256 evidence/initial-dirty.json.

La route UI V1 utilise /path et /vcs via InstanceContextMiddleware ; ces lectures initialisent InstanceStore. La préinspection doit éviter cette initialisation et tout Project.fromDirectory (persistance/cache par Project.ID). RootHttpApi fournit déjà authentification et validation sans instance. Session.Service.get lit SessionTable sans InstanceState ; on réutilise cette lecture pour le placement persisté.

Contrat partagé Schema, service Core global utilisant FSUtil/AppProcess, endpoint /global/context du serveur V1 qualifié. directory obligatoire absolu, jamais fallback cwd. Retour demandé/canonique/persisté et comparaison canonique ; session absente ou workspace présent => concordance inconnue. Pas de routage distant implicite. Git observé dans le chemin demandé uniquement ; deux clones restent distincts. État base explicite demandé/résolu/inconnu ; aucun staging implicite. Statut et comparaison avec base échoués => incomplete, jamais clean.

Risques : Git change durant lecture (observation non atomique, pas lease), truncation/timeout, symlinks/permissions, HEAD unborn/detached, base optionnelle, session distante. Vérifier fixtures réelles et route sans initialisation. Aucun code UI, réparation session, mutation Git produit ou garde écrivain.

Gate Analyze autonome validée dans le mandat et sprint-child-handoff ; aucun changement de scope.
