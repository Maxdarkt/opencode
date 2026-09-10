# Préservation des worktrees sources — 2026-09-07

Les quatre HEAD observés après smoke sont inchangés par rapport au préflight :

- `10-product-ui` : `e22d723895e3a8537f9bf21d5d6e4561ff630de1`.
- `20-workspace-git` : `2d973aeaf6a289ba1f343663a758d7c70b1bcc11`.
- `30-agent-runtime` : `702bf7dcd7468638c17fd95b110deb38bd253e9a`.
- `40-tooling` : `b7111b6e973d7200e70990c6f32a1a4d4b4a64de`.

Leurs états sales/projections et preuves restent présents. Les seules lectures ont utilisé Git et le filesystem ; aucune commande d'écriture, de nettoyage, de commit, de merge, de rebase, de push, de promotion ou de suppression n'a ciblé ces worktrees.
