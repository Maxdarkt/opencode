# Handoff — DA10-003

La lecture `global.context` expose maintenant binding et snapshot d’exécution en lecture seule. L’UI rend les faits; la garde relit ce contexte juste avant prompt, commande, shell ou reprise et bloque fail-closed hors concordance, avec motif accessible. Code B2.1 reçu : `317e8f8bb6ba367d5e2add4c2b754d32c22666dd`; son amendement `213cccd97c4a40a080bf3a91e74232216c8e29a6` ne modifie que STATE/handoff. Le parent doit exécuter le smoke visuel décrit dans `smoke-report.md` avant le passage MT en `review`.
