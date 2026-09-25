# Discovery — cockpit-v2

Date : 2026-09-25. Contrat visuel : `docs/product/maquette/cockpit-cursor.html`.

Le sprint 6 a livré le chrome V1 (DA10-009, DA10-010, DA10-008). Le sprint 8 a livré les coûts (DA30-014) et le CPU/RAM local (DA40-020). Ces cartes sont `done`. Le cockpit V2 les affiche à d’autres endroits. Il ne recalcule pas ces mesures.

## Ce que la maquette fige

1. Menu gauche : replié 52 px, largeur 200–480 px, machines, recherche, arbre sprint/chats.
2. Écran droit : fermé par défaut, 50 % du workspace à la première ouverture, puis 320 px–80 %. Onglets horizontaux. Le + suit le dernier onglet. Scroll X. Types : Navigateur, Fichiers, Diff. Pas de Terminal.
3. Diff est l’onglet par défaut. Le fermer le laisse fermé. Un nouveau chat le recrée et laisse l’écran fermé. Changer de chat ou de machine ferme l’écran.
4. Carton fixe en haut à droite du chat, masqué si l’écran est ouvert. Emplacement, tokens, coût, perf de l’hôte du fil, sources.
5. Bandeau : machines, locale d’abord, flex 1, scroll X, Terminal à droite. Shells nommés par hôte.
6. Inspecteur : clic droit sur la page du navigateur seulement.
7. Fil : pastille d’hôte, bouton Écran, cartes Diff et Aperçu.

## Données lues, pas recalculées

- Tokens et coût : contrat DA30-014. Absent → `unknown`, pas un zéro.
- CPU/RAM local : contrat DA40-020.
- CPU/RAM d’un hôte distant : US-06, pas cette feature. La puce affiche `—`.
- Rattachement et hôte SSH : US-07 et US-02. Les boutons Rattacher et Connecter sont visibles. Ils ne persistent pas un hôte dans cette feature.
