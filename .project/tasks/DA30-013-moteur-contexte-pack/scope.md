# DA30-013 — Packer le contexte : worktree, compaction, cache

## Objectif
Livrer le **moteur de contexte** (C2, C3, C5) : pack minimal borné au worktree, compaction/prune OpenCode, préfixe cache stable.

## Contexte
Maquette figée. OpenCode a `SessionCompaction`, overflow, `prompt_cache_key`. Daidalon doit en faire une politique métier visible.

## Périmètre
- pack = mandat + pathset du worktree + sélection minimale ;
- brancher compaction / prune / troncature d’outils ;
- préfixe cache-stable (cwd, règles, outils) ;
- preuve tokens avant/après ; unknown honnête.

## Hors périmètre
Chrome mockup, Interrupt UI (DA10-008), bornes tours (DA30-012), adaptateurs abo.

## Acceptation
1. Un tour n’envoie pas tout le repo ni `staging`.
2. Compaction mesurable (moins de tokens d’entrée à mandat égal).
3. Tests ciblés packages/opencode ou core ; pas de faux zéro.

## Dépendances
Aucune. Bloque DA30-012, DA10-008, DA40-017.
