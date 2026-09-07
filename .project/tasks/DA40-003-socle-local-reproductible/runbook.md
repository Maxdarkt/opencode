# Environnement reproductible et recette
Racine effective : /Users/leanbot/Documents/40_Daidalon/features/40-tooling ; branche 40-tooling ; HEAD 702bf7dcd7468638c17fd95b110deb38bd253e9a. Voir manifest.json et evidence/initial-dirty.json pour l'état non commité.

## Installation exacte
Depuis cette racine explicite, obtenir l'archive https://registry.npmjs.org/@oven/bun-darwin-aarch64/-/bun-darwin-aarch64-1.3.14.tgz ; extraire dans .project/tasks/DA40-003-socle-local-reproductible/evidence/runtime. Binaire : evidence/runtime/package/bin/bun (chemin relatif au dossier tâche). Vérifier --version = 1.3.14 et SHA256 du manifest.
Exécuter ce binaire depuis la racine du worktree avec `install --frozen-lockfile --ignore-scripts`. Installation mesurée : 4687 paquets, exit 0. Ne pas lancer prepare/husky, susceptible de modifier la configuration Git commune. Aucun script natif requis pour les checks et smokes réalisés ; desktop/Electron/PTY ne sont pas qualifiés.
Conserver le SHA256 de bun.lock avant/après. Les fichiers runtime sont ignorés localement par le .gitignore du dossier tâche, conservés sur disque et reconstructibles. Aucune installation globale ni modification de package.json/bun.lock.

## Instance de recette en cours
UI http://127.0.0.1:4440/ ; API http://127.0.0.1:4140/global/health.
Backend Bun PID 27514 ; client launcher Bun 27515, listener Node 27516 (Node v25.8.2). Propriétaire DA40-003, réservation transmise au parent. Ne pas redémarrer ni remplacer ces processus. Le serveur 4096 préexistant PID 20357 reste hors recette.
Commandes et environnement exacts dans evidence/processes.json : allowlist sans credentials fournisseurs, XDG data/cache/config/state, home test et managed config isolés dans evidence/runtime. Auto-update et models fetch désactivés ; catalogue fixture locale. Aucun prompt ni requête modèle autorisé par cette recette.
Le backend expose version local, pas le SHA Git. Preuve composée : branche/HEAD + empreintes sources du manifest + cwd des PID + ports d'écoute + entry Vite injectée. Refaire ces mesures immédiatement avant validation, car le serveur de développement peut recharger une source modifiée.

## Rejouer après extinction naturelle, sans restart
Vérifier les ports et PID enregistrés. Si un port est occupé, conserver l'instance et vérifier sa provenance ; ne pas la tuer. Si une nouvelle instance est nécessaire alors qu'une instance existe, faire attribuer un autre couple de ports par le parent.
Lancer une nouvelle instance uniquement avec les cwd/commandes et l'environnement allowlist de evidence/processes.json (chaque commande en session persistante distincte). Mettre PATH avec le dossier du Bun 1.3.14 en premier. Actualiser PID, manifest, URLs et preuves après lancement ; le JSON actuel est historique, ses PID ne sont jamais à utiliser aveuglément.
Depuis packages/opencode : `<bun-exact> run ./src/index.ts serve --hostname 127.0.0.1 --port 4140`.
Depuis packages/app : `VITE_OPENCODE_SERVER_HOST=127.0.0.1 VITE_OPENCODE_SERVER_PORT=4140 <bun-exact> run dev -- --host 127.0.0.1 --port 4440 --strictPort` avec le même environnement isolé. Attendre le message listening/ready puis GET health ; ne pas conclure un échec sur la seule latence initiale.
Rejouer les sept checks de evidence/checks.json depuis leurs paquets ; jamais tests racine, jamais tsc direct. RECORD=false et environnement sans clés.

## Recette entre worktrees
Le parent alloue un couple libre distinct et un propriétaire par backend/client ; chaque paire identifie ses deux racines, branches, HEAD, dirty et lockfile. Installer séparément les dépendances exactes de chaque worktree ; ne pas partager/symlinker node_modules entre worktrees, les liens workspace doivent pointer vers la bonne source.
Pour DA30, DA20 puis DA10, démarrer depuis leurs racines métier uniquement et renouveler le manifest. Le socle 40 ne contient aucune future modification des branches 30/20/10. Une UI 10 ciblant une API 20 est une recette croisée à identifier explicitement, pas une candidate intégrée. Ne jamais annoncer un parcours intégré à partir de tests séparés.
L'assemblage dans une candidate unique nécessite une décision parent sur source/cible/chemins et opérations Git autorisées ; aucune merge/cherry-pick/promotion implicite. Le parent conserve la décision de done/archived et le smoke visuel.
