# Dettes — DA40-010

## Dette héritée D01 — lint global rouge

- Sévérité : faible pour cette intégration, moyenne pour la qualité globale.
- Impact : `bun run lint` ne peut pas servir de gate vert global.
- Preuve : 4900 warnings et 1 erreur sur l'échappement `\\200B` dans `packages/session-ui/src/v2/components/prompt-input/index.tsx:163` ; le blob du fichier est identique à `702bf7dcd` et hors pathset DA40-010.
- Propriétaire : maintenance transverse/upstream.
- Décision : hors scope ; le lint des 31 fichiers TS/TSX intégrés a 0 erreur (187 warnings).
- Réouverture : avant d'exiger un lint global vert ou lors d'une tâche touchant `session-ui`.

## Dette héritée D02 — suite app globale rouge

- Sévérité : faible.
- Impact : `bun run test:unit` termine 736 pass/1 fail sur la locale `pa-PK` attendue `pa` mais reçue `en`.
- Preuve : `packages/app/src/i18n/desktop-native.ts` et son test sont inchangés depuis `702bf7dcd`; les 36 tests app ciblés DA10 passent.
- Propriétaire : product-ui/i18n.
- Décision : hors scope, ne bloque pas la baseline intégrée.
- Réouverture : tâche locale i18n ou gate de suite app globalement verte.

## Dette de processus D03 — métadonnées modèle non exposées

- Sévérité : faible.
- Impact : l'outil de lecture ne permet pas d'attester directement modèle/effort observés.
- Preuve : création parent explicite `gpt-5.6-sol/high`, API acceptée pour le chat `01a07b3f-d1eb-7400-b644-1af894277c0e`, aucune substitution signalée.
- Propriétaire : orchestration Codex.
- Décision : preuve acceptée explicitement par le parent pour cette tâche ; aucune divergence observée.
- Réouverture : si l'API expose des métadonnées divergentes ou avant un workflow exigeant une attestation machine stricte.

Aucune dette corrective en scope n'est ouverte.
