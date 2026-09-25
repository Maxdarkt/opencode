# User stories — placement-distant

IDs locaux `US-nn`. Le 0.5 est le sprint 8 (cartes déjà créées).  
`APEX` vide jusqu’à `$task-scope`.

| ID | Story | Release | APEX |
|---|---|---|---|
| US-07 | En tant que développeur, je veux rattacher un projet à cette machine ou à un hôte SSH, et changer ce rattachement, afin que le lieu soit une donnée du projet. | 0.6 | — |
| US-08 | En tant que développeur, je veux que le navigateur de l’outil ouvre `localhost` si le projet est ici, et une adresse remontée depuis l’hôte s’il est distant, afin que smoke et preview suivent le projet. | 0.6 | — |
| US-09 | En tant que pilote, je veux un dossier sprint dans le projet, avec le fil du sprint et les chats de tâches, afin qu’un chat ne devienne pas un projet séparé. | 0.6 | — |
| US-10 | En tant que pilote, je veux que l’outil place le chat de tâche dans le worktree de la carte, afin que le dossier soit imposé par le produit. | 0.6 | — |
| US-02 | En tant que développeur, je veux enregistrer un hôte joignable en SSH, sans port entrant, afin d’y rattacher des projets. | 0.7 | — |
| US-03 | En tant que pilote, je veux que la carte ouvre son worktree sur la machine du projet, afin que Git et les outils écrivent là-bas. | 0.7 | — |
| US-01 | En tant que développeur, je veux conduire depuis la machine de l’outil pendant que l’agent travaille sur l’hôte du projet, afin de mener plusieurs projets sans tout exécuter ici. | 0.7 | — |
| US-04 | En tant que développeur, je veux que la session distante continue si la machine de l’outil se ferme, afin de reprendre le même fil. | 0.7 | — |
| US-05 | En tant que développeur, je veux que `make dev` tourne sur la machine du projet et que son adresse remonte dans le navigateur de l’outil, afin de voir l’application sans navigateur distant. | 0.7 | — |
| US-06 | En tant que pilote, je veux la charge CPU/RAM de la machine qui exécute, afin de savoir si elle peut prendre un agent de plus. | 0.8 | — |

## Enchaînement

- **0.5 / sprint 8** : DA30-014, DA30-015, DA40-020. Aucune story de cette feature. Arrêt propre.
- **0.6** : US-07 → US-08, et US-09 → US-10. Ça se teste encore sur une seule machine. US-08 en local ouvre `localhost`. Revenir d’un hôte SSH au local ne change que le rattachement.
- **0.7** : US-02 puis US-03, US-01, US-04, US-05. US-05 applique US-08 au serveur de preview. US-04 ne vaut que si le projet est distant.
- **0.8** : US-06, après DA40-020. La mesure du poste de l’outil ne suffit plus.

Les skills (`apex-task`, `sprint-support`) restent la méthode. Ils lisent le rattachement et l’adresse. Ils ne les codent pas.
