# Handoff — DA10-003

La lecture `global.context` expose maintenant binding et snapshot d’exécution en lecture seule. L’UI rend les faits; la garde relit ce contexte juste avant prompt, commande, shell ou reprise et bloque fail-closed hors concordance, avec motif accessible. B2.2 préserve maintenant texte et contexte après un refus, au lieu d’effacer le draft; le libellé décrit un blocage à l’envoi. Le parent doit exécuter le re-smoke B2.2 décrit dans `smoke-report.md` avant le passage MT en `review`.
