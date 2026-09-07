# Smoke technique et plan Pass B — DA40-010

## Candidate et environnement

- Racine `/Users/leanbot/Documents/40_Daidalon/features/50-integration`, branche `baseline-integration`, HEAD/base `702bf7dcd`, dirty attendu.
- `.make.env` ignorée : code 50, API `http://127.0.0.1:4150`, UI `http://127.0.0.1:4450`.
- Lancement : `make dev` après `make preflight-ports`; aucun listener initial.

## Smoke technique acquis

| Vérification                                       | Résultat                                                                                              |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `/global/health` réel                              | `healthy=true`, version `local`                                                                       |
| contexte racine d'intégration avec `base_ref=HEAD` | available, branche `baseline-integration`, HEAD/base `702bf7dcd...`, dirty true, review changed       |
| fixture temporaire non-Git                         | available, canonical `/private/tmp/...`, Git `non_git`, review incomplete                             |
| chemin temporaire absent                           | availability `absent`, Git null                                                                       |
| UI Vite réelle                                     | index OpenCode servi sur 4450                                                                         |
| Playwright headless                                | PASS ajout, chemin absent, confirmation interdite, annulation, ouverture candidate, branche/HEAD/base |
| non-initialisation Git                             | fixture sans `.git` avant/après ; aucune requête POST correspondant à `project.*git`                  |
| erreurs navigateur                                 | aucune page error                                                                                     |
| arrêt                                              | Ctrl-C transmis à `make dev`; ses seuls enfants nettoyés, aucun listener 4150/4450 restant            |

Preuve détaillée : `evidence/browser-smoke.json`. Le démarrage a créé `packages/opencode/config.json` (50 octets, schéma seul), absent de l'état initial ; ce résidu exact a été retiré avant handoff et n'appartient pas à la candidate.

## Pass B parent

1. Préconditions : vérifier `git status`, HEAD `702bf7dcd`, `.make.env` 50/4150/4450 et ports libres ; lancer `make dev` depuis la racine d'intégration.
2. Ouvrir `http://127.0.0.1:4450` dans un contexte navigateur neuf, viewport desktop standard (au moins 1280×800), sans envoyer de prompt modèle.
3. « Add project/Ajouter un projet » : saisir un dossier vide hors dépôt, vérifier disponibilité et chemin canonique ; éditer vers un enfant absent, vérifier message d'absence et confirmation désactivée ; annuler sans changer le projet.
4. Réouvrir puis sélectionner `/Users/leanbot/Documents/40_Daidalon/features/50-integration`. Vérifier bandeau/détails : API 4150, chemin exact, branche `baseline-integration`, HEAD `702bf7dcd7468638c17fd95b110deb38bd253e9a`, dirty/review changed.
5. Saisir `HEAD` comme base, actualiser et vérifier base résolue au même OID. Vérifier qu'aucun `.git` n'est créé dans la fixture et qu'aucune initialisation Git n'apparaît dans les requêtes.
6. Contrôler les layouts ancien/nouveau, le rendu compact des détails et la conservation de la navigation. Capturer écran d'ouverture, panneau de contexte déplié, base résolue et requêtes réseau pertinentes.
7. Arrêter `make dev` et prouver l'absence de listeners 4150/4450. Ne pas toucher aux instances 4110–4140/4410–4440.

## Correction/reprise

Si le Pass B échoue, garder la carte en review jusqu'à la transition parent `review -> in_progress`, puis reprendre ce chat au bloc correctif B10 avec le défaut, l'écran, la requête et le chemin affecté. Rejouer les tests/typechecks ciblés et le smoke concerné avant un nouveau handoff.
