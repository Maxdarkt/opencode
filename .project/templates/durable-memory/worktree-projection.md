---
type: worktree-projection
read_only: true
canonical_ref: <relative-path-from-worktree-to-Daidalon/document>
observed_at: <ISO-8601>
observed_revision: <git-head-or-content-hash>
freshness: <fresh|stale|unknown>
---
# Projection — <document>

Cette copie est une observation locale. Ne pas l'utiliser comme autorité et ne
jamais écrire le canonique depuis elle. Si `freshness` est `stale` ou `unknown`,
relire `canonical_ref`, actualiser l'observation et journaliser toute divergence
qui touche une mutation multi-support.
