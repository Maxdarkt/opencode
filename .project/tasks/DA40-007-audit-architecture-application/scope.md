# Scope — DA40-007

## Titre et objectif

Documenter l'architecture actuelle et les évolutions backend/BDD. Produire une vue compréhensible de Daidalon aujourd'hui, puis un cadre de décision explicite pour introduire ou faire évoluer des services distants et une base de données.

## Contexte mesuré

- La racine déclare un monorepo Bun avec des workspaces `packages/*`, `packages/console/*`, `packages/stats/*`, `packages/sdk/js` et `packages/slack`.
- L'expérience locale combine au minimum une UI Solid/Vite (`packages/app`) et un serveur/runtime Bun (`packages/opencode`).
- Le runtime utilise Drizzle et SQLite pour des données locales ; le dépôt contient aussi des surfaces cloud/console/SST issues du projet amont.
- Les README techniques sont répartis par package. Aucun document Daidalon ne synthétise encore modules, processus, flux, stockage, frontières ni stratégie backend/BDD.

## Dans le scope

- Inventorier les applications, packages structurants et dépendances de runtime réellement utilisées par le produit Daidalon.
- Décrire les processus UI, serveur local, session/agent/outils, accès Git/workspace, stockage local et services externes.
- Produire au moins un schéma Mermaid lisible et une carte des responsabilités par module.
- Distinguer clairement architecture du dépôt amont, architecture exécutée aujourd'hui et cible Daidalon.
- Répondre aux questions : projet classique ou monorepo ; un ou plusieurs modules ; quel backend aujourd'hui ; quelle BDD aujourd'hui ; besoin ou non d'un backend/BDD distant.
- Définir les déclencheurs d'évolution, options possibles, impacts sécurité/données/exploitation, migrations et tâches APEX à créer si le besoin change.
- Ajouter un lien stable depuis la documentation produit ou le README Daidalon approprié.

## Hors scope

- Implémenter un nouveau backend, une base distante, un service cloud ou une migration.
- Décider seul d'une architecture SaaS, multi-utilisateur ou synchronisée non demandée.
- Modifier le protocole, le runtime, la persistance ou les dépendances.

## Critères d'acceptation

1. Un document d'architecture durable répond aux questions utilisateur avec faits sourcés dans le dépôt et limites explicites.
2. Le schéma montre les frontières UI/client/protocole/serveur/core/session/stockage et les interactions système/fournisseurs.
3. Le document identifie le rôle actuel de SQLite et les données qui restent locales.
4. Une matrice de décision indique quand conserver l'architecture locale, quand ajouter un backend distant et quand ajouter une BDD distante.
5. Chaque évolution proposée décrit impacts, prérequis et tâches suivantes sans implémentation implicite.
6. Les liens et le rendu Mermaid sont vérifiés ; l'audit remet un handoff et un résumé utilisable dans le bilan du sprint.

## Surfaces probables

`docs/product/architecture.md` ou un dossier `docs/product/architecture/`, README/package manifests et sources structurantes en lecture, plus les preuves APEX de cette tâche.

## Dépendances, risques et validation

S'appuyer sur DA20-001, DA30-003 et DA40-003 sans confondre leurs conclusions avec l'état courant. Risques : documenter des packages amont inutilisés comme cible Daidalon, confondre serveur local et backend SaaS, ou conclure trop vite qu'aucune BDD n'existe. Vérifier chaque assertion sur manifests, imports, routes, schémas Drizzle et chemins de stockage.

## Relation au sprint

Carte ajoutée au Sprint 1 le 2026-09-06 à la demande utilisateur. Elle prend le worktree `/Users/leanbot/Documents/40_Daidalon/features/40-tooling` en premier ; DA40-006 attend sa libération. Modèle prévu : `gpt-5.6-luna`, effort `high`.
