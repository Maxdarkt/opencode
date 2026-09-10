# Revue du routage LLM — Sprint 1

Constat du 2026-09-06 : DA40-003, DA30-003, DA20-002 et DA10-002 ont réellement tourné avec `gpt-6-astra`. Les tâches avaient été créées sans modèle explicite et ont hérité du défaut Codex. Le cache indiquait à tort `modelClass: sol`.

Ce choix n’était pas justifié pour l’ensemble du sprint. Répartition qui aurait dû être appliquée :

| Tâche | Modèle cible | Effort | Motif |
|---|---|---|---|
| DA40-003 | gpt-5.6-luna ou gpt-5.6-terra | low/medium | inventaire, environnement et checks reproductibles |
| DA30-003 | gpt-5.6-terra | medium | qualification technique sans Build produit |
| DA20-002 | gpt-5.6-terra | high | contrat backend/OpenAPI multi-paquets |
| DA10-002 | gpt-5.6-terra, escalade Sol si nécessaire | high | intégration UI/API et états concurrents |
| DA40-004 | gpt-5.6-terra | medium | orchestration standard ; Astra seulement pour arbitrage exceptionnel |

Mesure corrective : modèle et effort deviennent obligatoires à la création ; modèle observé relu après lancement ; checkpoint Markdown compact obligatoire ; escalade Luna → Terra → Sol → Astra fondée sur difficulté ou échec démontré.
