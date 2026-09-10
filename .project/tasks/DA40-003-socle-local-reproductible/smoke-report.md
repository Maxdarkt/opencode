# Smoke technique et Pass B parent
Pass A terminé : 41 tests ciblés verts, 4 typechecks verts, backend health et sources Vite HTTP 200. Preuves : baseline.md, evidence/checks.json, http-smoke.json, listeners.txt, process-cwd.txt, manifest.json. Premier GET avant readiness refusé, second réussi sans restart.

## Pass B — à exécuter par le parent
Préconditions : contrôler la branche/HEAD/dirty du manifest ; aucun changement source depuis l'empreinte ; confirmer PID 27514 sur 4140, Node 27516 sur 4440 et cwd des deux paquets 40-tooling. Aucun autre écrivain jusqu'à réception.
Ouvrir http://127.0.0.1:4440/ dans un profil/stockage neuf pour cet origin. Si un serveur a déjà été mémorisé, sélectionner explicitement http://127.0.0.1:4140 ; ne pas effacer le stockage général utilisateur. La clé opencode.settings.dat:defaultServerUrl peut primer sur VITE.
1. Vérifier que la page locale se rend sans overlay d'import/runtime ni écran blanc ; capturer URL et écran.
2. Vérifier le serveur local 4140 sélectionné et joignable ; consulter GET /global/health = healthy true ; capturer réseau et selection. Ne pas confondre avec 4096 ni app.opencode.ai.
3. Ouvrir le sélecteur de dossier puis annuler ; état attendu : retour utilisable sans envoi de prompt ni initialisation Git volontaire. Pas de création de projet nécessaire pour accepter le socle.
4. Recharger la page ; vérifier que le serveur sélectionné reste 4140, sans appel fournisseur. Ne pas arrêter un serveur pour simuler une panne ; les cas indisponible et worktree sont couverts par les tests ciblés.
Preuves attendues : captures UI+URL, réponse health, réseau backend 4140, heure et manifest réactualisé, verdict Pass B. Évaluer lisibilité et rendu appartient au parent.
Fixtures : profil navigateur neuf ; catalogue backend fixture models-dev.json ; données XDG dédiées vides au démarrage. Aucun compte/API/secret requis. Git absent/detached/base inconnue et route session V2 restent aux tâches DA20/DA30/DA10, pas revendiqués ici.
Si erreur visuelle : consigner console, URL, PID/cwd/HEAD puis renvoyer un bloc correctif borné DA40-003. Ne pas restart. Reprise au STATE avec mêmes processus après mesure.

## Verdict Pass B parent — 2026-09-06
Réception exécutée par le parent `01a076a4-b458-72a3-8e2b-bf975091a840` sur `http://127.0.0.1:4440/`.

- La page locale OpenCode se rend correctement, sans overlay d'import/runtime ni écran blanc ; l'accueil affiche Projets et Sessions récentes.
- Les réglages Serveurs affichent `127.0.0.1:4140` sans authentification. Après rechargement de la page, cette sélection est toujours présente.
- Le sélecteur « Ouvrir un projet » s'ouvre, atteint l'état « Aucun dossier trouvé » sur la fixture vide, puis se ferme sans création de projet, prompt ni initialisation Git.
- Le parent a remesuré HEAD `702bf7dcd7468638c17fd95b110deb38bd253e9a`, branche `40-tooling`, index vide, SHA256 du lockfile et des cinq sources : toutes les valeurs correspondent à `manifest.json`.
- Les listeners sont toujours Bun PID 27514 sur `127.0.0.1:4140` et Node PID 27516 sur `127.0.0.1:4440`, avec cwd respectifs `packages/opencode` et `packages/app` dans le worktree 40-tooling.
- `GET /global/health` répond `{"healthy":true,"version":"local"}` et l'UI répond HTTP 200. La provenance reste démontrée par la preuve composée manifest/PID/cwd/ports/empreintes.

Verdict : **accepté**. Les limites annoncées restent exactes : desktop/PTY non qualifiés, aucun assemblage interbranches et aucun test fournisseur payant. Aucune correction enfant requise.
