# User stories — cockpit-v2

IDs à la suite de `placement-distant` (US-01 à US-10), pour qu’un même numéro ne désigne pas deux stories.  
Contrat visuel : `docs/product/maquette/cockpit-cursor.html`.  
`APEX` est rempli par la carte dont le `scope.md` recopie ces critères.

| ID | Story | APEX |
|---|---|---|
| US-11 | Menu gauche repliable, largeur à la souris, machines, recherche, arbre sprint et chats. | DA10-013 |
| US-12 | Écran de droite caché, 50 % puis réglable, onglets horizontaux Diff, Navigateur, Fichiers. | DA10-012 |
| US-13 | Carton du fil : emplacement, tokens, coût, perf de l’hôte, sources. Masqué si l’écran est ouvert. | DA10-014 |
| US-14 | Bandeau : toutes les machines, locale d’abord, scroll X, Terminal à droite. | DA10-015 |
| US-15 | Inspecteur seulement au clic droit sur la page du navigateur. | DA10-016 |
| US-16 | Fil : pastille d’hôte, bouton Écran, cartes Diff et Aperçu. Un nouveau chat ne rouvre pas l’écran. | DA10-017 |
| US-17 | Retour d’agent : objectif, réalisé, problèmes, dettes, points, fichiers cliquables, autorisation à copier. | DA10-018 |

## US-11 — Menu gauche

En tant que développeur, je veux le menu gauche du cockpit V2, afin de voir les projets de la machine active sans quitter le fil.

Critères :

- Le bouton ☰ replie le menu à 52 px et cache navigation, recherche, machines et arbre. La poignée de largeur disparaît.
- La poignée règle la largeur de 200 à 480 px.
- La liste des machines change la machine active. La recherche filtre les projets de cette machine. Le placeholder est « Projet sur {machine} ».
- L’arbre montre le nom du projet, le libellé du sprint, puis les chats. Le chat ouvert est marqué.
- Rattacher et Connecter (+) sont visibles. Ils n’enregistrent pas d’hôte et ne changent pas le rattachement.

Hors story : US-02, US-07.

## US-12 — Écran de droite

En tant que développeur, je veux l’écran de droite du cockpit V2, afin d’ouvrir Diff, Fichiers ou Navigateur sans que le fil se réduise tout seul.

Critères :

- L’écran est fermé à l’arrivée sur un chat.
- La première ouverture prend 50 % de la largeur du workspace. La poignée règle ensuite de 320 px à 80 % de cette largeur. La largeur choisie reste.
- La barre d’onglets est horizontale. Le bouton + est dans la rangée, juste après le dernier onglet. La rangée défile en X.
- Le + propose seulement Navigateur, Fichiers, Diff.
- Chaque chat a un onglet Diff tant qu’il n’est pas fermé. Le fermer le laisse absent. Un nouveau chat recrée Diff et laisse l’écran fermé.
- Changer de chat ou de machine ferme l’écran.
- Terminal n’est pas un onglet de cet écran.

Hors story : adresse distante (US-08), contenu du patch au-delà du diff du chat.

## US-13 — Carton du fil

En tant que développeur, je veux le carton fixe en haut à droite du chat, afin de lire le contexte du fil quand l’écran de droite est fermé.

Critères :

- Visible seulement si un chat est ouvert et l’écran de droite est fermé.
- Il affiche le projet, l’hôte et le dossier, la branche et le HEAD, les tokens du fil, le coût du fil, le CPU et la RAM de la machine de ce fil, puis les sources.
- Un clic sur une source ouvre l’écran sur Fichiers et sélectionne ce fichier.
- Le fil ne passe pas sous le carton.
- Tokens et coût viennent de DA30-014. Absents → `unknown`.
- CPU/RAM locaux viennent de DA40-020. Une machine distante sans mesure affiche `—`.

Hors story : US-06, nouveau calcul de coût.

## US-14 — Bandeau

En tant que développeur, je veux le bandeau du bas, afin de voir la charge des machines et d’ouvrir un terminal sans le mettre dans l’écran de droite.

Critères :

- La rangée des machines occupe la largeur jusqu’au bouton Terminal (`flex: 1`, `min-width: 0`, `overflow-x: auto`).
- Le bouton Terminal ne défile pas avec les puces.
- La machine locale est la première puce. Les autres suivent l’ordre d’enregistrement.
- Chaque puce montre le nom, le CPU et la RAM. La puce de l’hôte du chat ouvert est marquée.
- Terminal ouvre un bandeau bas. Un shell ajouté porte le nom de son hôte. Fermer ce bandeau ne ferme pas l’écran de droite.

Hors story : US-02, PTY distant.

## US-15 — Inspecteur

En tant que développeur, je veux l’inspecteur seulement au clic droit sur la page du navigateur, afin qu’il ne soit ni un onglet ni un bouton du bandeau.

Critères :

- Aucun bouton Inspecteur dans le bandeau. Aucun onglet Inspecteur.
- Le clic droit sur la page du navigateur, pendant que cet onglet est celui affiché, ouvre ou ferme l’inspecteur.
- Les sections sont Tâche, Git, Coût, Serveurs, Permissions.
- Fermer l’écran, quitter l’onglet Navigateur, ou fermer cet onglet ferme l’inspecteur.

Hors story : nouvelles sections.

## US-16 — Fil

En tant que développeur, je veux les commandes du fil qui ouvrent l’écran, afin qu’un nouveau chat prépare Diff sans afficher l’écran.

Critères :

- L’en-tête montre l’état, la pastille d’hôte, le chemin, Interrupt, et le bouton Écran. Le bouton est marqué quand l’écran est ouvert.
- La carte « Diff de ce chat » ouvre l’écran sur l’onglet Diff.
- La carte « Aperçu » n’apparaît que si le fil a une preview. Elle ouvre l’onglet Navigateur.
- L’URL affichée est celle que le produit fournit. Pour un projet local, c’est `http://127.0.0.1:<port>`.
- Un nouveau chat a l’onglet Diff et l’écran fermé. Le carton du fil est visible.

Hors story : US-08 pour l’adresse distante, US-10 pour le placement du chat.

## Dépendances

- US-11 et US-14 ne dépendent d’aucune story de cette feature.
- US-16, US-13 et US-15 dépendent de US-12.
- US-17 dépend de US-12 et de US-16.
- Un seul écrivain à la fois sur le worktree `10`.

## US-17 — Retour d’agent

En tant que pilote, je veux le retour de l’agent dans une fenêtre du fil, afin de voir ce qui était demandé, ce qui est fait, et de copier l’autorisation dans le prompt suivant.

Critères :

- La fenêtre a cinq libellés, dans cet ordre : Objectif, Réalisé, Problèmes, Dettes, Points. Une section vide affiche « Aucun ».
- Sous ces libellés, la liste des fichiers touchés, avec le delta de lignes. Un clic ouvre l’écran de droite sur Fichiers et sélectionne ce fichier.
- Si une autorisation ou une remise est demandée, elle est dans une fenêtre sous la liste, avec un bouton Copier. Le texte copié est celui à coller dans le prompt suivant.
- Pas d’autre endroit du fil pour demander cette autorisation.

Hors story : le texte des skills, le calcul du diff, le passage MT à `done`.
